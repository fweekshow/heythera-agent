import { Client, type Signer, type DecodedMessage, Group } from "@xmtp/node-sdk";
import { createReminderDispatcher } from "./dispatcher.js";
import { isMentioned, removeMention } from "./mentions.js";
import { AIAgent } from "./services/agent/index.js";
import { setBroadcastClient } from "./services/agent/tools/broadcast.js";
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
  MENTION_HANDLES,
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
    let cleanContent = messageContent;

    // Always respond to all messages, but clean mentions from groups
    if (isGroup && isMentioned(messageContent)) {
      cleanContent = removeMention(messageContent);
      if (DEBUG_LOGS) {
        console.log("👋 Mentioned in group, will respond");
      }
    } else if (!isGroup) {
      if (DEBUG_LOGS) {
        console.log("💬 DM received, will respond");
      }
    } else if (isGroup && !isMentioned(messageContent)) {
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
      
      // Check for broadcast command and handle with preview
      if (!isGroup && cleanContent.toLowerCase().startsWith("/broadcast ")) {
        const broadcastMessage = cleanContent.substring(11).trim(); // Remove "/broadcast " prefix
        
        // Handle broadcast with preview/confirmation
        try {
          // Import the broadcast functions
          const { previewBroadcast, confirmBroadcast } = await import("./services/agent/tools/broadcast.js");
          
          const result = await previewBroadcast(
            broadcastMessage,
            senderInboxId,
            conversationId
          );
          
          await conversation.send(result);
          console.log(`✅ Sent broadcast preview: "${result}"`);
        } catch (broadcastError: any) {
          await conversation.send(`❌ Broadcast preview failed: ${broadcastError.message}`);
          console.error("❌ Broadcast error:", broadcastError);
        }
        return;
      }
      
      // Check for broadcast confirmation command
      if (!isGroup && cleanContent.toLowerCase() === "/confirm") {
        try {
          const { confirmBroadcast } = await import("./services/agent/tools/broadcast.js");
          
          const result = await confirmBroadcast(senderInboxId, conversationId);
          
          await conversation.send(result);
          console.log(`✅ Broadcast confirmation result: "${result}"`);
        } catch (confirmError: any) {
          await conversation.send(`❌ Confirmation failed: ${confirmError.message}`);
          console.error("❌ Confirmation error:", confirmError);
        }
        return;
      }
      
      // Check for broadcast cancel command
      if (!isGroup && cleanContent.toLowerCase() === "/cancel") {
        try {
          const { cancelBroadcast } = await import("./services/agent/tools/broadcast.js");
          
          const result = await cancelBroadcast(senderInboxId);
          
          await conversation.send(result);
          console.log(`✅ Broadcast cancelled`);
        } catch (cancelError: any) {
          await conversation.send(`❌ Cancel failed: ${cancelError.message}`);
          console.error("❌ Cancel error:", cancelError);
        }
        return;
      }
      
      // Check for DM me command to establish DM connection
      if (cleanContent.toLowerCase().includes("dm me") || cleanContent.toLowerCase().includes("start dm")) {
        try {
          console.log(`📱 DM request from ${senderAddress}, attempting to establish DM connection...`);
          
          // Try to create DM with the sender
          const dmConversation = await client.conversations.newDm(senderAddress);
          const dmMessage = `Hi! I'm starting this DM as requested. You can now message me directly here for private conversations about Basecamp 2025!`;
          
          await dmConversation.send(dmMessage);
          await conversation.send(`✅ DM started! Check your direct messages.`);
          console.log(`✅ Established DM with ${senderAddress}`);
          return;
          
        } catch (dmError: any) {
          await conversation.send(`❌ Failed to start DM: ${dmError.message}`);
          console.error(`❌ DM establishment failed:`, dmError);
          return;
        }
      }
      
      
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

    // Initialize broadcast client
    setBroadcastClient(client);

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
    console.log(`  - Group messages when mentioned with @${MENTION_HANDLES.split(',')[0]}`);
    
    // Sync conversations before streaming
    console.log("🔄 Syncing conversations...");
    await client.conversations.sync();
    
    // Listen for new conversations to send welcome messages (disabled to prevent double messages)
    // (async () => {
    //   for await (const conversation of conversationStream) {
    //     try {
    //       const isGroup = conversation instanceof Group;
    //       
    //       if (!isGroup) {
    //         // Send welcome message to new DMs
    //         const welcomeMessage = `Hi! I'm the Basecamp 2025 Concierge - your helpful assistant for Basecamp. I can help you with:

    // • Schedule: Get event times, daily agendas for Sept 14-16, 2025
    // • General Info: Event details, logistics, and FAQ
    // • Reminders: Set personal reminders for sessions and activities

    // What would you like to know about Basecamp 2025?

    // Official site: https://www.basecamp2025.xyz 
    // Updates: @base`;

    //         if (conversation) {
    //           await conversation.send(welcomeMessage);
    //           console.log(`✅ Sent welcome message to new DM conversation`);
    //         }
    //       }
    //     } catch (error) {
    //       console.error("❌ Error sending welcome message:", error);
    //     }
    //   }
    // })();

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