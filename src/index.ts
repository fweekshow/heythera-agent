import { Client, type Signer, type DecodedMessage, Group } from "@xmtp/node-sdk";
import { createReminderDispatcher } from "./dispatcher.js";
import { isMentioned, removeMention } from "./mentions.js";
import { AIAgent } from "./services/agent/index.js";
import { setBroadcastClient } from "./services/agent/tools/broadcast.js";
import { setUrgentMessageClient } from "./services/agent/tools/urgentMessage.js";
import { setGroupClient } from "./services/agent/tools/activityGroups.js";
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
import { ActionsCodec, type ActionsContent, ContentTypeActions } from "./xmtp-inline-actions/types/ActionsContent.js";
import { IntentCodec, ContentTypeIntent } from "./xmtp-inline-actions/types/IntentContent.js";

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

// Conversation memory storage (per user)
interface ConversationEntry {
  userMessage: string;
  botResponse: string;
  timestamp: Date;
}

const conversationHistory = new Map<string, ConversationEntry[]>();

// Helper functions for conversation memory
function addToConversationHistory(senderInboxId: string, userMessage: string, botResponse: string) {
  const history = conversationHistory.get(senderInboxId) || [];
  
  // Add new entry
  history.push({
    userMessage,
    botResponse,
    timestamp: new Date()
  });
  
  // Keep only last 3 exchanges
  if (history.length > 3) {
    history.shift();
  }
  
  conversationHistory.set(senderInboxId, history);
}

function getConversationContext(senderInboxId: string): string {
  const history = conversationHistory.get(senderInboxId) || [];
  
  if (history.length === 0) {
    return "";
  }
  
  let context = "Recent conversation context:\n";
  history.forEach((entry, index) => {
    context += `User: ${entry.userMessage}\nBot: ${entry.botResponse}\n`;
  });
  context += "Current message:\n";
  
  return context;
}

// Clean up old conversations (older than 1 hour)
function cleanupOldConversations() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const [senderInboxId, history] of conversationHistory.entries()) {
    const recentHistory = history.filter(entry => entry.timestamp > oneHourAgo);
    
    if (recentHistory.length === 0) {
      conversationHistory.delete(senderInboxId);
    } else {
      conversationHistory.set(senderInboxId, recentHistory);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldConversations, 30 * 60 * 1000);

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
          
          // Parse the JSON result and send as ActionsContent
          const actionsData = JSON.parse(result);
          await (conversation as any).send(actionsData.content, ContentTypeActions);
          console.log(`✅ Sent broadcast preview with quick actions`);
        } catch (broadcastError: any) {
          await conversation.send(`❌ Broadcast preview failed: ${broadcastError.message}`);
          console.error("❌ Broadcast error:", broadcastError);
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
      
      // Use AI to detect if this is a single activity keyword
      const activityDetectionPrompt = `Is this message a single activity keyword that matches one of these activities: yoga, running, pickleball, hiking?

Return with the exact keyword:
- "hiking"
- "yoga" 
- "running"
- "pickleball"

Examples that should return NO:
- "hello"
- "what time is hiking"
- "show me the schedule"
- "join groups"
- "hiking at 7am"

Message: "${cleanContent}"

Respond with only only exact keyword or nothing.`;

      const isSingleActivityKeyword = await agent.run(
        activityDetectionPrompt,
        senderInboxId,
        conversationId,
        isGroup,
        senderAddress,
      );
      console.log("🔍 isSingleActivityKeyword", isSingleActivityKeyword);
      
      if (isSingleActivityKeyword && !isSingleActivityKeyword.toLowerCase().includes("no")) {
        console.log("🎯 AI detected single activity keyword, sending Quick Actions...");
        try {
          const { hasGroupChat, getJoinActionId } = await import("./services/agent/tools/activityGroups.js");
          const singleKeyword = cleanContent.trim().toLowerCase();
          const normalized = singleKeyword;
          const displayName = normalized.charAt(0).toUpperCase() + normalized.slice(1);
          const joinActionId = getJoinActionId(normalized);
          
          if (hasGroupChat(singleKeyword)) {
            // Find the activity in schedule to get timing info
            const conciergeActionsContent: ActionsContent = {
                id: `${normalized}_activity_join`,
                description: `🎯 ${displayName}
Would you like me to add you to the ${displayName} @ Basecamp group chat?`,
                actions: [
                  {
                    id: joinActionId || "",
                    label: "✅ Yes, Add Me",
                    style: "primary"
                  },
                  {
                    id: "no_group_join",
                    label: "❌ No Thanks", 
                    style: "secondary"
                  }
                ]
              };
            await (conversation as any).send(conciergeActionsContent, ContentTypeActions);
            return
          }
        } catch (activityError) {
          console.error("❌ Error sending activity Quick Actions:", activityError);
          // Fall through to AI processing
        }
      }
      
      // Get conversation context for this user
      const conversationContext = getConversationContext(senderInboxId);
      const messageWithContext = conversationContext + cleanContent;
      
      // Use AI to detect if this is a greeting/engagement message
      const greetingCheckPrompt = `Is this message a greeting, casual hello, or someone starting a conversation? Examples: "hi", "hello", "hey", "yoooo", "what's up", "sup", "howdy", "good morning", "gm", "yo", "hey there", "bm", "based morning" etc. 

Message: "${cleanContent}"

Respond with just "YES" if it's a greeting/engagement, or "NO" if it's a specific question or request.`;

      const isGreeting = await agent.run(
        greetingCheckPrompt,
        senderInboxId,
        conversationId,
        isGroup,
        senderAddress,
      );

      if (isGreeting && isGreeting.toLowerCase().includes("yes")) {
        console.log("👋 AI detected greeting/engagement, sending Quick Actions...");
        try {
          // Create Quick Actions for welcome message using proper ActionsContent type
          const quickActionsContent: ActionsContent = {
            id: "basecamp_welcome_actions",
            description: "Hi! I'm the Basecamp Agent. Here are things I can help you with:",
            actions: [
              {
                id: "schedule",
                label: "📅 Schedule",
                style: "primary"
              },
              {
                id: "set_reminder", 
                label: "⏰ Set Reminder",
                style: "secondary"
              },
              {
                id: "concierge_support",
                label: "🎫 Concierge Support", 
                style: "secondary"
              },
              {
                id: "join_groups",
                label: "👥 Join Groups",
                style: "secondary"
              }
            ]
          };

          console.log("🎯 Sending Quick Actions:", JSON.stringify(quickActionsContent, null, 2));
          console.log("🎯 Content type being used:", ContentTypeActions.toString());
          
          // Send Quick Actions with proper content type using the registered codec
          await (conversation as any).send(quickActionsContent, ContentTypeActions);
          console.log(`✅ Sent Quick Actions welcome message`);
          console.log(`✅ Content type used:`, ContentTypeActions.toString());
          
          // Store this exchange in conversation history
          addToConversationHistory(senderInboxId, cleanContent, "Welcome message with Quick Actions sent");
          return; // Exit early, don't process with AI
        } catch (quickActionsError) {
          console.error("❌ Error sending Quick Actions:", quickActionsError);
          // Fallback to regular text
          await conversation.send("Hi! I'm the Basecamp Agent. I can help you with the Schedule, Set Reminders, or Concierge Support. What would you like to know?");
          addToConversationHistory(senderInboxId, cleanContent, "Welcome message sent (fallback)");
          return;
        }
      }

      // Use AI to detect if this is a group joining request
      const groupJoinPrompt = `Is this message asking to see, join, or get information about group chats or activity groups? Examples: "join group chats", "show me the groups", "can you show me the group chats", "what groups are available", "I want to join groups", etc.

Message: "${cleanContent}"

Respond with only "YES" or "NO".`;

      const isGroupJoinRequest = await agent.run(
        groupJoinPrompt,
        senderInboxId,
        conversationId,
        isGroup,
        senderAddress,
      );
      console.log("🔍 isGroupJoinRequest", isGroupJoinRequest);
      
      if (isGroupJoinRequest && isGroupJoinRequest.toLowerCase().includes("yes")) {
        console.log("🎯 AI detected group joining request, sending Quick Actions...");
        try {
          const { generateGroupSelectionQuickActions } = await import("./services/agent/tools/activityGroups.js");
          const groupSelectionActions = generateGroupSelectionQuickActions();
          await (conversation as any).send(groupSelectionActions, ContentTypeActions);
          console.log(`✅ Sent group selection Quick Actions`);
          addToConversationHistory(senderInboxId, cleanContent, "Group selection Quick Actions sent");
          return; // Exit early, don't process with AI
        } catch (groupError) {
          console.error("❌ Error sending group Quick Actions:", groupError);
          // Fall through to AI processing
        }
      }

      // Activity questions will be handled by the AI agent using the GetFullSchedule tool

      // Check if this is a casual acknowledgment

      // Check if this is an urgent message (only after user clicked "urgent_yes")
      const urgentContext = getConversationContext(senderInboxId);
      const isUrgentMessage = urgentContext.includes("urgent_yes");

      if (isUrgentMessage) {
        console.log("🚨 Urgent message detected, forwarding to staff...");
        try {
          const { forwardUrgentMessage } = await import("./services/agent/tools/urgentMessage.js");
          const result = await forwardUrgentMessage(cleanContent, senderInboxId, conversationId);
          await conversation.send(result);
          addToConversationHistory(senderInboxId, cleanContent, "Urgent message forwarded to staff");
          return; // Skip AI agent
        } catch (error) {
          console.error("❌ Error forwarding urgent message:", error);
          await conversation.send("❌ Failed to forward your urgent message. Please contact concierge@base.org directly.");
          return;
        }
      }

      // Generate AI response for non-welcome requests
      const response = await agent.run(
        messageWithContext,
        senderInboxId,
        conversationId,
        isGroup,
        senderAddress,
      );

      if (response) {
        console.log(`🔍 AI Response check - contains Quick Actions?: ${response.includes('"contentType":"coinbase.com/actions:1.0"')}`);
        console.log(`🔍 Full AI Response: "${response}"`);
        
        // Check if this is a Quick Actions response
        if (response.includes('"contentType":"coinbase.com/actions:1.0"')) {
          try {
            console.log("🎯 Detected Quick Actions response, parsing...");
            const quickActionsData = JSON.parse(response);
            const actionsContent = quickActionsData.content;
            
            console.log("🎯 Sending Quick Actions:", JSON.stringify(actionsContent, null, 2));
            
            // Send the Quick Actions using Base App's content type
            await conversation.send(actionsContent);
            console.log(`✅ Sent Quick Actions welcome message`);
            
            // Store this exchange in conversation history
            addToConversationHistory(senderInboxId, cleanContent, "Welcome message with Quick Actions sent");
          } catch (quickActionsError) {
            console.error("❌ Error sending Quick Actions:", quickActionsError);
            console.log("🔄 Falling back to regular text response");
            // Fallback to regular text
            await conversation.send("Hi! I'm the Basecamp Agent. I can help you with the Schedule, Set Reminders, or Concierge Support. What would you like to know?");
          }
        } else {
          // Regular text response
          console.log("💬 Sending regular text response");
          await conversation.send(response);
          console.log(`✅ Sent response: "${response}"`);
          
          // Store this exchange in conversation history
          addToConversationHistory(senderInboxId, cleanContent, response);
        }
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
    console.log("🔄 Initializing client...");
    const dbPath = getDbPath("basecamp-agent");
    console.log("🔄 DB path:", dbPath);
    const client = await Client.create(signer, {
      dbEncryptionKey: encryptionKey,
      env: XMTP_ENV as "local" | "dev" | "production",
      dbPath,
      codecs: [new ActionsCodec(), new IntentCodec()],
    });
    
    // Register codecs for Quick Actions
    console.log("🔄 Client initialized with Quick Actions codecs");
    await logAgentDetails(client);
    // Initialize broadcast client
    setBroadcastClient(client);
    
    // Initialize urgent message client
    setUrgentMessageClient(client);
    
    // Initialize group client for activity groups
    setGroupClient(client);
    
    // Initialize agent in activity groups
    const { initializeAgentInGroups } = await import("./services/agent/tools/activityGroups.js");
    await initializeAgentInGroups();

    // Initialize reminder dispatcher
    const reminderDispatcher = createReminderDispatcher();
    reminderDispatcher.start(client);
    console.log("🔄 Reminder dispatcher initialized");
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
    // Skip messages from ourselves
    if (message?.senderInboxId.toLowerCase() === client.inboxId.toLowerCase()) {
      continue;
    }

    // Debug: Log all message types
    console.log(`📨 Message received - Type: ${message?.contentType?.typeId}, Content: ${typeof message?.content}`);
    console.log(`📨 Expected intent type: ${ContentTypeIntent.toString()}`);
    
    // Debug intent messages specifically
    if (message?.contentType?.typeId === "intent") {
      console.log(`🎯 Intent message detected! Content:`, JSON.stringify(message.content, null, 2));
    }

    // Handle Intent messages (Quick Action responses)
    if (message?.contentType?.typeId === ContentTypeIntent.toString() || 
        message?.contentType?.typeId === "coinbase.com/intent:1.0" ||
        message?.contentType?.typeId === "intent") {
      const intentContent = message.content as any;
      const actionId = intentContent.actionId;
      
      console.log(`🎯 Received Quick Action intent: ${actionId}`);
      console.log(`🎯 Full intent content:`, JSON.stringify(intentContent, null, 2));
      
      // Get conversation to respond
      const conversation = await client.conversations.getConversationById(message.conversationId);
      if (!conversation) continue;
      
      // Handle different action IDs
      switch (actionId) {
        case "schedule":
          // Use AI agent to provide schedule information
          try {
            const scheduleResponse = ` 📅 Basecamp 2025 Schedule Helper

Ask me any questions about the schedule! Here are some examples:

By Day:
•⁠  ⁠What is the schedule on Monday?
•⁠  ⁠What's happening on Sunday?
•⁠  ⁠Show me Tuesday's events

By Event:
•⁠  ⁠What time does Jesse start speaking?
•⁠  ⁠When is the Pickleball Tournament on Monday?
•⁠  ⁠What time is the Welcome Reception?

By Activity Type:
•⁠  ⁠What are the night activities?
•⁠  ⁠Show me the day activities
•⁠  ⁠What workshops are available?

Just ask naturally - I understand conversational requests!`;
            await conversation.send(scheduleResponse);
            addToConversationHistory(message.senderInboxId, "schedule", "Schedule overview requested");
          } catch (error) {
            console.error("❌ Error getting schedule:", error);
            await conversation.send("I'm having trouble accessing the schedule right now. Please try again in a moment!");
          }
          break;
        case "set_reminder":
          await conversation.send("I can help you set reminders! Just tell me what you'd like to be reminded about and when. For example: 'Remind me about the Welcome Reception 30 minutes before it starts'");
          break;
        case "concierge_support":
          const conciergeActionsContent: ActionsContent = {
            id: "concierge_support_actions",
            description: `Concierge Support

I'm here to help as your Concierge during Basecamp 2025! 

Is this an urgent matter that needs immediate attention?`,
            actions: [
              {
                id: "urgent_yes",
                label: "🚨 Yes, Urgent",
                style: "danger"
              },
              {
                id: "urgent_no", 
                label: "📧 No, Not Urgent",
                style: "secondary"
              }
            ]
          };
          await (conversation as any).send(conciergeActionsContent, ContentTypeActions);
          break;
        case "join_groups":
          const { generateGroupSelectionQuickActions } = await import("./services/agent/tools/activityGroups.js");
          const groupSelectionActions = generateGroupSelectionQuickActions();
          await (conversation as any).send(groupSelectionActions, ContentTypeActions);
          break;
        case "urgent_yes":
          // Store that user is in urgent mode
          addToConversationHistory(message.senderInboxId, "urgent_yes", "User selected urgent support");
          await conversation.send(`🚨 Urgent Support

I understand this is urgent! Please describe your concern and I'll forward it directly to the event organizers for immediate attention.

What's the issue you're experiencing?`);
          break;
        case "urgent_no":
          await conversation.send(`📧 Non-Urgent Support

For non-urgent matters, please send a message to:
concierge@base.org

This is the best way to reach our support team for general questions, requests, or non-urgent concerns.

Is there anything else I can help you with regarding Basecamp 2025?`);
          break;
        case "join_yoga":
          const { addMemberToActivityGroup } = await import("./services/agent/tools/activityGroups.js");
          const yogaResult = await addMemberToActivityGroup("yoga", message.senderInboxId);
          await conversation.send(yogaResult);
          break;
        case "join_running":
          const { addMemberToActivityGroup: addRunning } = await import("./services/agent/tools/activityGroups.js");
          const runningResult = await addRunning("running", message.senderInboxId);
          await conversation.send(runningResult);
          break;
        case "join_pickleball":
          const { addMemberToActivityGroup: addPickleball } = await import("./services/agent/tools/activityGroups.js");
          const pickleballResult = await addPickleball("pickleball", message.senderInboxId);
          await conversation.send(pickleballResult);
          break;
        case "join_hiking":
          const { addMemberToActivityGroup: addHiking } = await import("./services/agent/tools/activityGroups.js");
          const hikingResult = await addHiking("hiking", message.senderInboxId);
          await conversation.send(hikingResult);
          break;
        case "no_group_join":
          await conversation.send("👍 No problem! Feel free to ask me about other activities or anything else regarding Basecamp 2025.");
          break;
        case "broadcast_yes":
          try {
            const { confirmBroadcast } = await import("./services/agent/tools/broadcast.js");
            const result = await confirmBroadcast(message.senderInboxId, message.conversationId);
            await conversation.send(result);
            console.log(`✅ Broadcast confirmation result: "${result}"`);
          } catch (confirmError: any) {
            await conversation.send(`❌ Confirmation failed: ${confirmError.message}`);
            console.error("❌ Confirmation error:", confirmError);
          }
          break;
        case "broadcast_no":
          try {
            const { cancelBroadcast } = await import("./services/agent/tools/broadcast.js");
            const result = await cancelBroadcast(message.senderInboxId);
            await conversation.send(result);
            console.log(`✅ Broadcast cancelled: "${result}"`);
          } catch (cancelError: any) {
            await conversation.send(`❌ Cancel failed: ${cancelError.message}`);
            console.error("❌ Cancel error:", cancelError);
          }
          break;
        default:
          await conversation.send("Thanks for your selection! How can I help you with Basecamp 2025?");
      }
      continue;
    }
    
    // Skip non-text messages
    if (message?.contentType?.typeId !== "text") {
      continue;
    }
      
      await handleMessage(message, client as any);
    }

  } catch (error) {
    console.error("❌ Error starting agent:", error);
    process.exit(1);
  }
}

main().catch(console.error);