import type { Client } from "@xmtp/node-sdk";

// Store the client reference for group management
let groupClient: Client<any> | null = null;

export function setGroupClient(client: Client<any>) {
  groupClient = client;
}

// Activity group IDs - extracted from the group URLs
const ACTIVITY_GROUPS = {
  yoga: "68c08cefd741296b23956360",
  running: "68c08d490b8e399769f63396", 
  pickleball: "68c08ce30b8e399769f63394",
  hike: "68c08d59d741296b23956363"
};

// Activity group names for display
const ACTIVITY_NAMES = {
  yoga: "🧘 Yoga @ Basecamp",
  running: "🏃 Running @ Basecamp",
  pickleball: "🏓 Pickleball @ Basecamp", 
  hike: "🥾 Hiking @ Basecamp"
};

// Function to add a user to an activity group
export async function addMemberToActivityGroup(
  activity: keyof typeof ACTIVITY_GROUPS,
  userInboxId: string
): Promise<string> {
  try {
    if (!groupClient) {
      return "❌ Group management system not initialized. Please try again later.";
    }

    const groupId = ACTIVITY_GROUPS[activity];
    const activityName = ACTIVITY_NAMES[activity];
    
    if (!groupId) {
      return "❌ Unknown activity. Available activities: yoga, running, pickleball, hiking";
    }

    console.log(`🎯 Adding user ${userInboxId} to ${activityName} group (${groupId})`);

    // Debug: List all conversations to see what groups we have access to
    await groupClient.conversations.sync();
    const allConversations = await groupClient.conversations.list();
    console.log(`🔍 Agent has access to ${allConversations.length} total conversations:`);
    
    for (const conv of allConversations) {
      const type = conv.constructor.name;
      console.log(`  - ${conv.id} (${type})`);
    }

    // Get the group
    const group = await groupClient.conversations.getConversationById(groupId);
    if (!group) {
      console.log(`❌ Group ${groupId} not found in agent's conversations`);
      return `❌ Could not find ${activityName} group. The agent may not be a member of this group yet. Group ID: ${groupId}`;
    }

    // Add the member to the group
    await (group as any).addMembersByInboxId([userInboxId]);
    
    console.log(`✅ Successfully added user to ${activityName} group`);
    
    return `✅ Great! I've added you to the ${activityName} group chat. 

You'll now receive updates and can chat with other participants about ${activity} activities during Basecamp 2025!

Check your group chats to see the conversation.`;

  } catch (error: any) {
    console.error(`❌ Error adding member to ${activity} group:`, error);
    return `❌ Failed to add you to the ${ACTIVITY_NAMES[activity]} group. Please contact support or try again later.`;
  }
}

// Function to get activity group info
export function getActivityGroupInfo(activity: keyof typeof ACTIVITY_GROUPS): { groupId: string; name: string } | null {
  const groupId = ACTIVITY_GROUPS[activity];
  const name = ACTIVITY_NAMES[activity];
  
  if (!groupId) return null;
  
  return { groupId, name };
}

// List all available activity groups
export function getAvailableActivities(): string[] {
  return Object.keys(ACTIVITY_GROUPS);
}

// Activity group mapping for quick actions
export const ACTIVITY_GROUP_MAP = {
  'yoga': 'join_yoga',
  'running': 'join_running', 
  'pickleball': 'join_pickleball',
  'hike': 'join_hiking'
} as const;

// Normalize activity name (hiking -> hike)
export function normalizeActivityName(activity: string): string {
  if (activity === 'hiking') {
    return 'hike';
  }
  return activity;
}

// Check if an activity has group chat functionality
export function hasGroupChat(activity: string): boolean {
  const normalized = normalizeActivityName(activity.toLowerCase());
  return normalized in ACTIVITY_GROUP_MAP;
}

// Get the join action ID for an activity
export function getJoinActionId(activity: string): string | null {
  const normalized = normalizeActivityName(activity.toLowerCase());
  return ACTIVITY_GROUP_MAP[normalized as keyof typeof ACTIVITY_GROUP_MAP] || null;
}

// Generate quick actions for activity group joining
export function generateActivityGroupQuickActions(activity: string, scheduleInfo: string) {
  const normalized = normalizeActivityName(activity.toLowerCase());
  const joinActionId = getJoinActionId(normalized);
  
  if (!joinActionId) {
    return null;
  }

  const displayName = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  
  return {
    id: `${normalized}_group_join`,
    description: `🎯 ${displayName} schedule: ${scheduleInfo}

Would you like me to add you to the ${displayName} @ Basecamp group chat?`,
    actions: [
      {
        id: joinActionId,
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
}
