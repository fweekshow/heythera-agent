import { Client, type Signer, type DecodedMessage, Group } from "@xmtp/node-sdk";
import { createReminderDispatcher } from "./dispatcher.js";
import { isMentioned, removeMention } from "./mentions.js";
import { AIAgent } from "./services/agent/index.js";
import {
  createSigner,
  getDbPath,
  getEncryptionKeyFromHex,
  logAgentDetails,
} from "./services/helpers/client.js";
import { initDb } from "./store.js";
import {
  DEBUG_LOGS,
  DB_ENCRYPTION_KEY,
  SHOW_SENDER_ADDRESS,
  WALLET_KEY,
  XMTP_ENV,
} from "./config.js";

if (!WALLET_KEY) {
  throw new Error("WALLET_KEY is required");
}

if (!DB_ENCRYPTION_KEY) {
  throw new Error("DB_ENCRYPTION_KEY is required");
}

if (!XMTP_ENV) {
  throw new Error("XMTP_ENV is required");
}

const signer = createSigner(WALLET_KEY);
const encryptionKey = getEncryptionKeyFromHex(DB_ENCRYPTION_KEY);

console.log(`🚀 Starting Basecamp 2025 Concierge Agent`);

// Initialize database for reminders
initDb();

// Initialize AI agent
const agent = new AIAgent();

async function handleMessage(message: DecodedMessage, client: Client) {
  try {
    const messageContent = message.content as string;
    const senderInboxId = message.senderInboxId;
    const conversationId = message.conversationId;

    if (DEBUG_LOGS) {
      console.log(`📥 Received message:`, {
        id: message.id,
        senderInboxId,
        conversationId,
        content: messageContent,
      });
    }

    // Skip messages from ourselves
    if (senderInboxId === client.inboxId) {
      if (DEBUG_LOGS) {
        console.log("⏭️ Skipping own message");
      }
      return;
    }

    // Get conversation to check if it's a group
    const conversation = await client.conversations.getConversationById(conversationId);
    if (!conversation) {
      console.error("❌ Could not find conversation");
      return;
    }

    const isGroup = conversation instanceof Group;
    let shouldRespond = false;
    let cleanContent = messageContent;

    if (isGroup) {
      // In groups, only respond if mentioned
      if (isMentioned(messageContent)) {
        shouldRespond = true;
        cleanContent = removeMention(messageContent);
        if (DEBUG_LOGS) {
          console.log("👋 Mentioned in group, will respond");
        }
      }
    } else {
      // In DMs, always respond
      shouldRespond = true;
      if (DEBUG_LOGS) {
        console.log("💬 DM received, will respond");
      }
    }

    if (!shouldRespond) {
      if (DEBUG_LOGS) {
        console.log("⏭️ Not mentioned in group, skipping");
      }
      return;
    }

    // Get sender address for context
    let senderAddress = "";
    if (SHOW_SENDER_ADDRESS) {
      try {
        // Use the sender's inbox ID to get their address
        senderAddress = senderInboxId;
      } catch (error) {
        console.warn("⚠️ Could not get sender address:", error);
      }
    }

    try {
      console.log(`🤖 Processing message: "${cleanContent}"`);
      
      // Generate AI response
      const response = await agent.run(
        cleanContent,
        senderInboxId,
        conversationId,
        isGroup,
        senderAddress,
      );

      if (response) {
        await conversation.send(response);
        console.log(`✅ Sent response: "${response}"`);
      }
    } catch (error) {
      console.error("❌ Error generating or sending response:", error);
      
      // Send fallback message
      try {
        await conversation.send(
          "Sorry, I encountered an error while processing your request. Please try again later."
        );
      } catch (fallbackError) {
        console.error("❌ Error sending fallback message:", fallbackError);
      }
    }
  } catch (error) {
    console.error("❌ Error processing message:", error);
  }
}

async function main() {
  try {
    const dbPath = getDbPath("basecamp-agent");
    const client = await Client.create(signer, {
      dbEncryptionKey: encryptionKey,
      env: XMTP_ENV as "local" | "dev" | "production",
      dbPath,
    });
    
    await logAgentDetails(client);

    // Initialize reminder dispatcher
    const reminderDispatcher = createReminderDispatcher();
    reminderDispatcher.start(client);

    // Handle process termination
    const cleanup = () => {
      console.log("🛑 Shutting down agent...");
      reminderDispatcher.stop();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    console.log("👂 Listening for messages...");
    console.log("💬 Agent will only respond to:");
    console.log("  - Direct messages (DMs)");
    console.log("  - Group messages when mentioned with @basecampconcierge");
    
    // Sync conversations before streaming
    console.log("🔄 Syncing conversations...");
    await client.conversations.sync();
    
    // Start streaming messages
    console.log("📡 Starting message stream...");
    const stream = await client.conversations.streamAllMessages();
    
    for await (const message of stream) {
      // Skip messages from ourselves or non-text messages
      if (
        message?.senderInboxId.toLowerCase() === client.inboxId.toLowerCase() ||
        message?.contentType?.typeId !== "text"
      ) {
        continue;
      }
      
      await handleMessage(message, client);
    }

  } catch (error) {
    console.error("❌ Error starting agent:", error);
    process.exit(1);
  }
}

main().catch(console.error);