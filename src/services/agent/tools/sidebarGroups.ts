import type { Client, DecodedMessage, Conversation } from "@xmtp/node-sdk";
import { ContentTypeActions, type ActionsContent } from "../../../xmtp-inline-actions/types/ActionsContent.js";

interface SidebarGroup {
  id: string;
  name: string;
  originalGroupId: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
}

// In-memory storage for sidebar groups (replace with database in production)
const sidebarGroups = new Map<string, SidebarGroup>();
const pendingInvitations = new Map<string, { groupId: string; originalGroupId: string }>();

let sidebarClient: Client<any> | null = null;

export function setSidebarClient(client: Client<any>) {
  sidebarClient = client;
}

/**
 * Handle sidebar group creation request
 * Triggered by: "@thera sidebar this conversation GroupName" or "@thera sidebar GroupName"
 */
export async function handleSidebarRequest(
  groupName: string,
  originalMessage: DecodedMessage,
  client: Client,
  originalConversation: Conversation
): Promise<string> {
  try {
    if (!sidebarClient) {
      return "❌ Sidebar group system not initialized. Please try again later.";
    }

    const requesterInboxId = originalMessage.senderInboxId;
    const originalGroupId = originalMessage.conversationId;

    console.log(`🎯 Creating sidebar group "${groupName}" requested by ${requesterInboxId}`);

    // Step 1: Create XMTP group with requester and agent as initial members
    const sidebarGroup = await sidebarClient!.conversations.newGroup([requesterInboxId]);
    
    console.log(`✅ Created sidebar group: ${sidebarGroup.id}`);

    // Step 2: Set the group name after creation
    try {
      const currentName = (sidebarGroup as any).name;
      if (!currentName || currentName !== groupName) {
        await (sidebarGroup as any).updateName(groupName);
        console.log(`✅ Set sidebar group name: "${groupName}"`);
      }
    } catch (nameError: any) {
      console.log(`⚠️ Could not set group name: ${nameError.message}`);
    }

    // Step 3: Store sidebar group metadata
    const sidebarGroupData: SidebarGroup = {
      id: sidebarGroup.id,
      name: groupName,
      originalGroupId: originalGroupId,
      createdBy: requesterInboxId,
      createdAt: new Date(),
      members: [requesterInboxId] // Agent is automatically included
    };
    
    sidebarGroups.set(sidebarGroup.id, sidebarGroupData);

    // Step 4: Make the requester a super admin of the group they created
    try {
      await (sidebarGroup as any).addSuperAdmin(requesterInboxId);
      console.log(`✅ Made ${requesterInboxId} a super admin of the sidebar group`);
    } catch (adminError: any) {
      console.log(`⚠️ Could not make requester admin: ${adminError.message}`);
      // Continue anyway - the group still works, just without admin privileges
    }

    // Step 5: Send welcome message to the sidebar group
    await sidebarGroup.send(`🎯 Welcome to "${groupName}"!\n\nThis is a sidebar conversation from the main group. You are now a group admin and can manage this space for focused discussions.`);

    // Step 6: Pause briefly to ensure group is properly set up
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 7: Send invitation quick actions to original group
    const invitationActions: ActionsContent = {
      id: `sidebar_invite_${sidebarGroup.id}`,
      description: `🎯 "${groupName}" sidebar group created! Would you like to join this focused discussion?`,
      actions: [
        {
          id: `join_sidebar_${sidebarGroup.id}`,
          label: "✅ Yes, Join",
          style: "primary"
        },
        {
          id: `decline_sidebar_${sidebarGroup.id}`,
          label: "❌ No Thanks",
          style: "secondary"
        }
      ]
    };

    // Send invitation to original group conversation
    await (originalConversation as any).send(invitationActions, ContentTypeActions);
    console.log(`📤 Sent sidebar group invitation to original group conversation`);

    // Step 8: Return a simple confirmation (no additional message needed)
    return ""; // Don't send a separate confirmation message

  } catch (error: any) {
    console.error("❌ Error creating sidebar group:", error);
    return `❌ Failed to create sidebar group "${groupName}". Please try again later.\n\nError: ${error.message}`;
  }
}

/**
 * Handle joining a sidebar group via quick actions
 */
export async function joinSidebarGroup(
  groupId: string,
  userInboxId: string
): Promise<string> {
  try {
    if (!sidebarClient) {
      return "❌ Sidebar group system not initialized. Please try again later.";
    }

    // Since we send invitations to the group conversation, we don't need to check
    // for individual invitations - anyone who sees the quick actions can join

    // Get sidebar group info
    const sidebarGroupData = sidebarGroups.get(groupId);
    if (!sidebarGroupData) {
      return "❌ Sidebar group not found.";
    }

    console.log(`🎯 Adding user ${userInboxId} to sidebar group "${sidebarGroupData.name}"`);

    // Sync conversations to get latest state
    await sidebarClient!.conversations.sync();
    const allConversations = await sidebarClient!.conversations.list();
    
    // Find the group by exact ID (matching activityGroups pattern)
    const sidebarGroup = allConversations.find(conv => conv.id === groupId);
    
    if (!sidebarGroup) {
      console.log(`❌ Sidebar group (${groupId}) not found in agent's conversations`);
      return `❌ Could not find sidebar group. Please contact support.`;
    }

    console.log(`✅ Found sidebar group: ${sidebarGroup.id}`);
    console.log(`   Name: ${sidebarGroupData.name}`);

    // Add user to the group using the same pattern as activityGroups
    try {
      await (sidebarGroup as any).addMembers([userInboxId]);
      console.log(`✅ Successfully added user to sidebar group "${sidebarGroupData.name}"`);
    } catch (addError: any) {
      console.log(`❌ Error adding to sidebar group: ${addError.message}`);
      
      if (addError.message?.includes('already') || addError.message?.includes('duplicate')) {
        console.log(`ℹ️ User was already in sidebar group`);
        return `ℹ️ You're already in "${sidebarGroupData.name}"! Check your group conversations to find it.`;
      } else if (addError.message?.includes('Failed to verify all installations') || addError.code === 'GenericFailure') {
        console.log(`⚠️ Installation verification failed for sidebar group - temporary XMTP network issue`);
        return `⚠️ There's a temporary network issue preventing group access right now. 

Please try joining "${sidebarGroupData.name}" again in a few minutes, or contact support if the issue persists.

The sidebar group is available and you can try again later!`;
      } else {
        console.log(`❌ Unknown error for sidebar group:`, addError);
        return `❌ Failed to add you to "${sidebarGroupData.name}". Error: ${addError.message || 'Unknown error'}. Please contact support.`;
      }
    }
    
    // Update our records
    sidebarGroupData.members.push(userInboxId);
    sidebarGroups.set(groupId, sidebarGroupData);

    // Send a welcome message to help the user identify the group
    await sidebarGroup.send(`🎉 ${userInboxId} joined the "${sidebarGroupData.name}" sidebar discussion!`);

    // Get agent's actual address properly
    const inboxState = await sidebarClient!.preferences.inboxState();
    const agentAddress = inboxState.identifiers[0]?.identifier || 'unknown';
    
    // For now, use agent DM deeplink since group deeplink format is unclear
    const agentDeeplink = `cbwallet://messaging/${agentAddress}`;

    return `✅ Great! You're now in "${sidebarGroupData.name}" sidebar group.

💬 **Message me to access the group:** ${agentDeeplink}

You'll receive messages and can participate in this focused discussion! Check your group conversations for the new sidebar.`;

  } catch (error: any) {
    console.error("❌ Error joining sidebar group:", error);
    return `❌ Failed to join sidebar group. Please contact support or try again later.`;
  }
}

/**
 * Handle declining a sidebar group invitation
 */
export async function declineSidebarGroup(
  groupId: string,
  userInboxId: string
): Promise<string> {
  try {
    const sidebarGroupData = sidebarGroups.get(groupId);
    const groupName = sidebarGroupData?.name || "sidebar group";

    console.log(`📝 ${userInboxId} declined to join sidebar group "${groupName}"`);

    return `✅ You've declined to join "${groupName}". No worries!`;

  } catch (error: any) {
    console.error("❌ Error declining sidebar group:", error);
    return "✅ Invitation declined.";
  }
}

/**
 * Parse sidebar command from message content
 * Supports: "@thera sidebar this conversation GroupName" or "@thera sidebar GroupName"
 * Also supports cleaned content: "sidebar this conversation GroupName" or "sidebar GroupName"
 */
export function parseSidebarCommand(content: string): string | null {
  // Try with @thera prefix first
  let sidebarMatch = content.match(/@thera sidebar (?:this (?:conversation )?)?(.+)/i);
  if (sidebarMatch) {
    return sidebarMatch[1].trim();
  }
  
  // Try without @thera prefix (for cleaned content from groups)
  sidebarMatch = content.match(/^sidebar (?:this (?:conversation )?)?(.+)/i);
  return sidebarMatch ? sidebarMatch[1].trim() : null;
}

/**
 * Check if message is a sidebar creation request
 */
export function isSidebarRequest(content: string): boolean {
  return content.toLowerCase().includes('@thera sidebar') || 
         content.toLowerCase().startsWith('sidebar ');
}

/**
 * Get sidebar group info
 */
export function getSidebarGroupInfo(groupId: string): SidebarGroup | undefined {
  return sidebarGroups.get(groupId);
}

/**
 * List all sidebar groups created by the agent
 */
export function listSidebarGroups(): SidebarGroup[] {
  return Array.from(sidebarGroups.values());
}

/**
 * Clean up expired invitations (call periodically)
 */
export function cleanupExpiredInvitations(maxAgeHours: number = 24): void {
  const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
  
  for (const [key, invitation] of pendingInvitations.entries()) {
    const groupData = sidebarGroups.get(invitation.groupId);
    if (groupData && groupData.createdAt < cutoffTime) {
      pendingInvitations.delete(key);
    }
  }
  
  console.log(`🧹 Cleaned up expired sidebar group invitations`);
}

export default {
  handleSidebarRequest,
  joinSidebarGroup,
  declineSidebarGroup,
  parseSidebarCommand,
  isSidebarRequest,
  getSidebarGroupInfo,
  listSidebarGroups,
  cleanupExpiredInvitations,
  setSidebarClient
};
