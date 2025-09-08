import type { Client } from "@xmtp/node-sdk";
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Store the client reference for broadcast functionality
let broadcastClient: Client | null = null;

export function setBroadcastClient(client: Client) {
  broadcastClient = client;
}

// Simple authorization using inbox IDs only
function isAuthorizedBroadcaster(senderInboxId: string): boolean {
  // AUTHORIZED INBOX IDs - Add new users here
  const authorizedInboxIds = [
    "132ddfd29e29096151775be0f3a9f996e059c10dd952b16d3749e9320f5ba424", // Your inbox ID
    // Add more inbox IDs here for additional authorized users
  ];
  
  const isAuthorized = authorizedInboxIds.includes(senderInboxId);
  
  console.log(`🔐 Checking broadcast permission for inbox ${senderInboxId}: ${isAuthorized ? 'ALLOWED' : 'DENIED'}`);
  return isAuthorized;
}

// Function to resolve inbox ID to basename with fallback to wallet address
async function getSenderIdentifier(senderInboxId: string): Promise<string> {
  try {
    console.log(`🔍 Resolving sender identifier for inbox ${senderInboxId}...`);
    
    if (!broadcastClient) {
      console.log("⚠️ Broadcast client not available");
      return `inbox-${senderInboxId.slice(0, 6)}...`;
    }
    
    // Get the user's address from XMTP inbox state
    const inboxState = await broadcastClient.preferences.inboxStateFromInboxIds([senderInboxId]);
    const addressFromInboxId = inboxState[0]?.identifiers[0]?.identifier;
    
    if (!addressFromInboxId) {
      console.log("⚠️ Could not resolve wallet address from inbox ID");
      return `inbox-${senderInboxId.slice(0, 6)}...`;
    }
    
    console.log(`📋 Resolved inbox ID to address: ${addressFromInboxId}`);
    
    // Ensure address is properly formatted
    const formattedAddress = addressFromInboxId.toLowerCase().startsWith('0x') 
      ? addressFromInboxId as `0x${string}`
      : `0x${addressFromInboxId}` as `0x${string}`;
    
    try {
      // Try to resolve address to basename using viem
      const publicClient = createPublicClient({
        chain: base,
        transport: http()
      });
      
      const basename = await publicClient.getEnsName({
        address: formattedAddress,
      });
      
      // If basename exists, use it; otherwise fall back to truncated address
      const displayName = basename || `${formattedAddress.slice(0, 6)}...${formattedAddress.slice(-4)}`;
      
      console.log(`✅ Final display name: ${displayName}`);
      return displayName;
      
    } catch (basenameError) {
      console.log(`⚠️ Basename resolution failed, using wallet address:`, basenameError);
      return `${formattedAddress.slice(0, 6)}...${formattedAddress.slice(-4)}`;
    }
    
  } catch (error) {
    console.error(`❌ Failed to get sender identifier:`, error);
    return `inbox-${senderInboxId.slice(0, 6)}...`;
  }
}

// Store pending broadcasts for confirmation
const pendingBroadcasts = new Map<string, {
  message: string;
  senderInboxId: string;
  conversationId: string;
  senderName: string;
  formattedContent: string;
}>();

// Preview broadcast function - shows formatted message and asks for confirmation
export async function previewBroadcast(
  message: string,
  senderInboxId: string,
  currentConversationId: string
): Promise<string> {
  try {
    if (!broadcastClient) {
      return "❌ Broadcast system not initialized. Please try again later.";
    }

    if (!message || message.trim().length === 0) {
      return "❌ Broadcast message cannot be empty. Use: /broadcast [your message]";
    }

    // Check authorization using inbox ID (much simpler!)
    if (!isAuthorizedBroadcaster(senderInboxId)) {
      return "❌ Access denied. You are not authorized to send broadcast messages.";
    }

    // Get sender identifier
    const senderName = await getSenderIdentifier(senderInboxId);
    
    // Format the broadcast content
    const broadcastContent = `📢 Announcement\n\n${message.trim()}\n\n---\nSent by: ${senderName}`;
    
    // Store pending broadcast
    pendingBroadcasts.set(senderInboxId, {
      message: message.trim(),
      senderInboxId,
      conversationId: currentConversationId,
      senderName,
      formattedContent: broadcastContent
    });

    // Show preview and ask for confirmation
    const previewMessage = `📋 BROADCAST PREVIEW\n\n` +
      `${broadcastContent}\n\n` +
      `📊 Will be sent to all active conversations.\n\n` +
      `Should I send the message? Respond "Yes" or "No"`;

    return previewMessage;
    
  } catch (error: any) {
    console.error("❌ Error creating broadcast preview:", error);
    return "❌ Failed to create broadcast preview. Please try again later.";
  }
}

// Confirm and send the broadcast
export async function confirmBroadcast(
  senderInboxId: string,
  conversationId: string
): Promise<string> {
  try {
    const pending = pendingBroadcasts.get(senderInboxId);
    
    if (!pending) {
      return "❌ No pending broadcast found. Use /broadcast [message] first.";
    }

    if (!broadcastClient) {
      return "❌ Broadcast system not initialized. Please try again later.";
    }

    console.log(`📢 Confirming broadcast from ${senderInboxId}: "${pending.message}"`);

    // Get all conversations
    await broadcastClient.conversations.sync();
    const conversations = await broadcastClient.conversations.list();
    
    if (conversations.length === 0) {
      return "⚠️ No conversations found to broadcast to.";
    }

    let successCount = 0;
    let errorCount = 0;

    // Send to all conversations except the current one
    for (const conversation of conversations) {
      try {
        if (conversation.id !== pending.conversationId) {
          await conversation.send(pending.formattedContent);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`❌ Failed to send broadcast to conversation ${conversation.id}:`, error);
        errorCount++;
      }
    }

    // Clear pending broadcast
    pendingBroadcasts.delete(senderInboxId);

    const resultMessage = `✅ Broadcast sent successfully!\n\n` +
      `📊 Results:\n` +
      `• Delivered to: ${successCount} conversations\n` +
      `• Failed: ${errorCount} conversations\n` +
      `• Total conversations: ${conversations.length}`;

    console.log(`📢 Broadcast completed: ${successCount} success, ${errorCount} errors`);
    return resultMessage;
    
  } catch (error: any) {
    console.error("❌ Error confirming broadcast:", error);
    return "❌ Failed to send broadcast. Please try again later.";
  }
}

// Cancel pending broadcast
export async function cancelBroadcast(senderInboxId: string): Promise<string> {
  const pending = pendingBroadcasts.get(senderInboxId);
  
  if (!pending) {
    return "❌ No pending broadcast to cancel.";
  }

  pendingBroadcasts.delete(senderInboxId);
  console.log(`🚫 Broadcast cancelled by ${senderInboxId}`);
  return "✅ Broadcast cancelled successfully.";
}

// Original broadcast function (now used internally by confirm)
export async function sendBroadcast(
  message: string,
  senderInboxId: string, 
  currentConversationId: string
): Promise<string> {
  try {
    if (!broadcastClient) {
      return "❌ Broadcast system not initialized. Please try again later.";
    }

    if (!message || message.trim().length === 0) {
      return "❌ Broadcast message cannot be empty. Use: /broadcast [your message]";
    }

    console.log(`📢 Initiating broadcast from inbox ${senderInboxId}: "${message}"`);

    // Get the user's actual wallet address from XMTP inbox state first for authorization
    const inboxState = await broadcastClient.preferences.inboxStateFromInboxIds([senderInboxId]);
    const addressFromInboxId = inboxState[0]?.identifiers[0]?.identifier;
    
    if (!addressFromInboxId) {
      console.log("⚠️ Could not resolve wallet address from inbox ID");
      return "❌ Could not verify sender address.";
    }

    console.log(`📋 Resolved inbox ID to wallet address: ${addressFromInboxId}`);

    // Check authorization using the resolved wallet address
    if (!isAuthorizedBroadcaster(addressFromInboxId)) {
      return "❌ Access denied. You are not authorized to send broadcast messages.";
    }

    // Get sender identifier
    const senderName = await getSenderIdentifier(senderInboxId);

    // Get all conversations
    await broadcastClient.conversations.sync();
    const conversations = await broadcastClient.conversations.list();
    
    if (conversations.length === 0) {
      return "⚠️ No conversations found to broadcast to.";
    }

    // Prepare broadcast message with header using resolved username
    const broadcastContent = `📢 BASECAMP 2025 BROADCAST\n\n${message.trim()}\n\n---\nSent by: ${senderName}`;

    let successCount = 0;
    let errorCount = 0;

    // Send to all conversations except the current one
    for (const conversation of conversations) {
      try {
        // Skip sending to the conversation where the broadcast was initiated
        if (conversation.id === currentConversationId) {
          continue;
        }
        
        await conversation.send(broadcastContent);
        successCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`❌ Failed to send broadcast to conversation ${conversation.id}:`, error);
        errorCount++;
      }
    }

    const resultMessage = `✅ Broadcast sent successfully!\n\n` +
      `📊 Results:\n` +
      `• Delivered to: ${successCount} conversations\n` +
      `• Failed: ${errorCount} conversations\n` +
      `• Total conversations: ${conversations.length}`;

    console.log(`📢 Broadcast completed: ${successCount} success, ${errorCount} errors`);
    
    return resultMessage;
  } catch (error: any) {
    console.error("❌ Error sending broadcast:", error);
    return "❌ Failed to send broadcast message. Please try again later.";
  }
}
