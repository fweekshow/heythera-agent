import type { Client } from "@xmtp/node-sdk";

// Store the client reference for group management
let groupClient: Client<any> | null = null;

export function setGroupClient(client: Client<any>) {
  groupClient = client;
}

// Function to initialize the agent by creating/joining activity groups
export async function initializeAgentInGroups(): Promise<void> {
  if (!groupClient) {
    console.log("❌ Group client not initialized");
    return;
  }

  console.log("🔄 Initializing agent in activity groups...");
  
  // First, let's see what conversations the agent actually has access to
  await groupClient.conversations.sync();
  const allConversations = await groupClient.conversations.list();
  console.log(`🔍 Agent has access to ${allConversations.length} total conversations:`);
  
  for (const conv of allConversations) {
    const type = conv.constructor.name;
    console.log(`  - ${conv.id} (${type})`);
    
    // If it's a group, try to get more details
    if (type === 'Group') {
      try {
        const groupDetails = conv as any;
        console.log(`    Name: ${groupDetails.name || 'No name'}`);
        console.log(`    Description: ${groupDetails.description || 'No description'}`);
        console.log(`    Metadata: ${JSON.stringify(groupDetails.metadata || {})}`);
        console.log(`    Participants: ${groupDetails.participants?.length || 0} members`);
      } catch (error) {
        console.log(`    Could not get group details: ${error}`);
      }
    }
  }
  
  // Check if agent has access to all activity groups
  for (const [activity, groupId] of Object.entries(ACTIVITY_GROUPS)) {
    try {
      console.log(`🔄 Checking ${activity} group (${groupId})...`);
      
      // Look for group by exact ID match
      const group = allConversations.find(conv => conv.id === groupId);
      
      if (group) {
        const groupDetails = group as any;
        console.log(`✅ Found ${activity} group: ${group.id}`);
        console.log(`   Name: ${groupDetails.name || 'No name'}`);
        console.log(`   Description: ${groupDetails.description || 'No description'}`);
      } else {
        console.log(`❌ ${activity} group not found!`);
        console.log(`💡 Expected ID: ${groupId}`);
        console.log(`💡 Agent address: ${(groupClient as any).address || 'unknown'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${activity} group:`, error);
    }
  }
}

// Activity group IDs - actual IDs from the groups the agent has access to
const ACTIVITY_GROUPS = {
  yoga: "30a7bba3a9715180891a807e16be16af",
  running: "5980087769adb51f37190ac0f9500340", 
  pickleball: "01cdc3fc34a8810919b953c528135044",
  hiking: "0e11ad71f6cd8808836529bc31fbaffa"

};

// Activity group names for display
const ACTIVITY_NAMES = {
  yoga: "🧘 Yoga @ Basecamp",
  running: "🏃 Running @ Basecamp",
  pickleball: "🏓 Pickleball @ Basecamp", 
  hiking: "🥾 Hiking @ Basecamp"
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

    const activityName = ACTIVITY_NAMES[activity];
    
    console.log(`🎯 Adding user ${userInboxId} to ${activityName} group`);

    // Get the group by exact ID match
    const groupId = ACTIVITY_GROUPS[activity];
    if (!groupId) {
      return "❌ Unknown activity. Available activities: yoga, running, pickleball, hiking";
    }

    await groupClient.conversations.sync();
    const allConversations = await groupClient.conversations.list();
    
    // Find the group by exact ID
    const group = allConversations.find(conv => conv.id === groupId);
    
    if (!group) {
      console.log(`❌ ${activity} group (${groupId}) not found in agent's conversations`);
      console.log(`🔍 Available groups:`);
      allConversations.filter(c => c.constructor.name === 'Group').forEach(conv => {
        const details = conv as any;
        console.log(`  - ${conv.id}: ${details.name || 'No name'}`);
      });
      return `❌ Could not find ${activityName} group. The agent needs to be added to this group first. Please contact support to add the agent to the ${activityName} group.`;
    }

    console.log(`✅ Found ${activity} group: ${group.id}`);
    console.log(`   Name: ${(group as any).name || 'No name'}`);

    // Add the member to the group using the correct XMTP method
    try {
      await (group as any).addMembers([userInboxId]);
      console.log(`✅ Successfully added user to ${activityName} group`);
    } catch (addError: any) {
      if (addError.message?.includes('already') || addError.message?.includes('duplicate')) {
        console.log(`ℹ️ User was already in ${activityName} group`);
      } else {
        throw addError; // Re-throw if it's a different error
      }
    }
    
    return `✅ Great! You're now in the ${activityName} group chat. 

You'll receive updates and can chat with other participants about ${activity} activities during Basecamp 2025!

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
  'hiking': 'join_hiking'
} as const;

// Check if an activity has group chat functionality
export function hasGroupChat(activity: string): boolean {
  const normalized = activity.toLowerCase();
  return normalized in ACTIVITY_GROUP_MAP;
}

// Get the join action ID for an activity
export function getJoinActionId(activity: string): string | null {
  const normalized = activity.toLowerCase();
  return ACTIVITY_GROUP_MAP[normalized as keyof typeof ACTIVITY_GROUP_MAP] || null;
}

// Generate quick actions for activity group joining
export function generateActivityGroupQuickActions(activity: string, scheduleInfo: string) {
  const normalized = activity.toLowerCase();
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

// Generate group selection quick actions for the main "Join Groups" button
export function generateGroupSelectionQuickActions() {
  return {
    id: "group_selection_actions",
    description: "👥 Which group would you like to join?",
    actions: [
      {
        id: "join_yoga",
        label: "🧘 Yoga",
        style: "primary"
      },
      {
        id: "join_running",
        label: "🏃 Running",
        style: "primary"
      },
      {
        id: "join_hiking",
        label: "🥾 Hiking",
        style: "primary"
      },
      {
        id: "join_pickleball",
        label: "🏓 Pickleball",
        style: "primary"
      }
    ]
  };
}
