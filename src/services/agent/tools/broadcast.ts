import type { Client } from "@xmtp/node-sdk";
import { getName } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

// Store the client reference for broadcast functionality
let broadcastClient: Client | null = null;

export function setBroadcastClient(client: Client) {
  broadcastClient = client;
}

function isAuthorizedBroadcaster(walletAddress: string): boolean {
  if (!walletAddress) {
    console.log(`🔐 Checking broadcast permission: No wallet address provided - DENIED`);
    return false;
  }
  
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Authorized addresses for broadcasting (wallet addresses OR inbox IDs)
  const authorizedAddresses = [
    "0x22209cfc1397832f32160239c902b10a624cab1a", // Your test wallet
    "0x327bf6a70433f2893eacde947ffec2ef9b918f5a", // Original agent wallet
    "132ddfd29e29096151775be0f3a9f996e059c10dd952b16d3749e9320f5ba424", // Your inbox ID
  ];
  
  const isAuthorized = authorizedAddresses.some(addr => 
    normalizedAddress === addr.toLowerCase()
  );
  
  console.log(`🔐 Checking broadcast permission for ${walletAddress}: ${isAuthorized ? 'ALLOWED' : 'DENIED'}`);
  return isAuthorized;
}

// Function to resolve inbox ID to basename using OnchainKit
async function resolveInboxIdToBasename(senderInboxId: string): Promise<string> {
  try {
    console.log(`🔍 Resolving inbox ID ${senderInboxId} to basename...`);
    
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
    
    // Resolve address to basename using OnchainKit
    const basename = await getName({ 
      address: formattedAddress, 
      chain: base 
    });
    
    // If basename exists, use it; otherwise fall back to truncated address
    const displayName = basename || `${formattedAddress.slice(0, 6)}...${formattedAddress.slice(-4)}`;
    
    console.log(`✅ Final display name: ${displayName}`);
    return displayName;
    
  } catch (error) {
    console.error(`❌ Failed to resolve basename for inbox ${senderInboxId}:`, error);
    return `inbox-${senderInboxId.slice(0, 6)}...`;
  }
}

// Simple broadcast function without LangChain complications
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

    // Resolve inbox ID to basename using the corrected approach
    const senderName = await resolveInboxIdToBasename(senderInboxId);

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
