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
  console.log("🔄 Syncing conversations (aggressive)...");
  await groupClient.conversations.sync();
  
  // Wait and sync again to ensure all installations are synced
  console.log("🔄 Waiting for installation sync...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  await groupClient.conversations.sync();
  
  console.log("🔄 Getting conversation list...");
  const allConversations = await groupClient.conversations.list();
  console.log(`🔍 Agent has access to ${allConversations.length} total conversations`);
  
  // Check if agent has access to all activity groups by searching by name
  for (const activity of Object.keys(ACTIVITY_GROUPS)) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 Checking ${activity} group...`);
      }
      
      // Look for group by name match
      const group = allConversations.find(conv => {
        const groupDetails = conv as any;
        return groupDetails.name === activity && conv.constructor.name === 'Group';
      });
      
      if (group) {
        const groupDetails = group as any;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`✅ Found ${activity} group: ${group.id}`);
          console.log(`   Name: ${groupDetails.name || 'No name'}`);
          console.log(`   Description: ${groupDetails.description || 'No description'}`);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`❌ ${activity} group not found!`);
          console.log(`💡 Looking for group named: ${activity}`);
          console.log(`💡 Available groups:`);
          allConversations.filter(c => c.constructor.name === 'Group').forEach(conv => {
            const details = conv as any;
            console.log(`     - ${conv.id}: ${details.name || 'No name'}`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${activity} group:`, error);
    }
  }
}

// Valid activity group names - we search by name instead of hardcoded IDs
const ACTIVITY_GROUPS = {
  // Recovery Community Groups
  "Red Door Community": true,
  "Sober Social": true, 
  "Outings": true,
  "Recovery Support": true,
};

// Activity group names for display
const ACTIVITY_NAMES = {
  // Recovery Community Groups
  "Red Door Community": "🏠 Red Door Life Group Community",
  "Sober Social": "🤝 Sober Social Events",
  "Outings": "🌟 Group Outings & Activities", 
  "Recovery Support": "💪 Recovery Support Network",
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

    await groupClient.conversations.sync();
    const allConversations = await groupClient.conversations.list();
    
    // Find the group by name instead of ID
    const group = allConversations.find(conv => {
      const groupDetails = conv as any;
      return groupDetails.name === activity && conv.constructor.name === 'Group';
    });
    
    if (!group) {
      console.log(`❌ ${activity} group not found in agent's conversations`);
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
      console.log(`❌ Error for ${activityName}: ${addError.message}`);
      
      if (addError.message?.includes('already') || addError.message?.includes('duplicate')) {
        console.log(`ℹ️ User was already in ${activityName} group`);
      } else if (addError.message?.includes('Failed to verify all installations') || addError.code === 'GenericFailure') {
        console.log(`⚠️ Installation verification failed for ${activityName} group - this is a temporary XMTP network issue (user will receive friendly error message)`);
        // Return a user-friendly message for installation verification failures
        return `⚠️ There's a temporary network issue preventing group access right now. 

Please try joining the ${activityName} group again in a few minutes, or contact support if the issue persists.

The group chat is available and you can try again later!`;
      } else {
        console.log(`❌ Unknown error for ${activityName} group:`, addError);
        return `❌ Failed to add you to the ${activityName} group. Error: ${addError.message || 'Unknown error'}. Please contact support.`;
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

// Special function to add user to Base @ DevConnect group by name
export async function addMemberToBaseGlobalEvents(userInboxId: string): Promise<string> {
  try {
    if (!groupClient) {
      return "❌ Group management system not initialized. Please try again later.";
    }

    console.log(`🎯 Adding user ${userInboxId} to Base @ DevConnect group`);

    await groupClient.conversations.sync();
    const allConversations = await groupClient.conversations.list();
    
    // Find the group by name "Base @ DevConnect"
    const group = allConversations.find(conv => {
      const details = conv as any;
      return details.name === "Base @ DevConnect";
    });
    
    if (!group) {
      console.log(`❌ Base @ DevConnect group not found in agent's conversations`);
      console.log(`🔍 Available groups:`);
      allConversations.filter(c => c.constructor.name === 'Group').forEach(conv => {
        const details = conv as any;
        console.log(`  - ${conv.id}: ${details.name || 'No name'}`);
      });
      return `❌ Could not find Base @ DevConnect group. The agent needs to be added to this group first. Please contact support to add the agent to the Base @ DevConnect group.`;
    }

    console.log(`✅ Found Base @ DevConnect group: ${group.id}`);
    console.log(`   Name: ${(group as any).name || 'No name'}`);

    // Add the member to the group using the correct XMTP method
    try {
      await (group as any).addMembers([userInboxId]);
      console.log(`✅ Successfully added user to Base @ DevConnect group`);
    } catch (addError: any) {
      console.log(`❌ Error for Base @ DevConnect: ${addError.message}`);
      
      if (addError.message?.includes('already') || addError.message?.includes('duplicate')) {
        console.log(`ℹ️ User was already in Base @ DevConnect group`);
        return `✅ You're already in the Base @ DevConnect group! You'll receive exclusive updates and can participate in community discussions.`;
      } else if (addError.message?.includes('Failed to verify all installations') || addError.code === 'GenericFailure') {
        console.log(`⚠️ Installation verification failed for Base @ DevConnect group - this is a temporary XMTP network issue`);
        return `⚠️ There's a temporary network issue preventing group access right now. 

Please try joining the Base @ DevConnect group again in a few minutes, or contact support if the issue persists.

The group chat is available and you can try again later!`;
      } else {
        console.log(`❌ Unknown error for Base @ DevConnect group:`, addError);
        return `❌ Failed to add you to the Base @ DevConnect group. Error: ${addError.message || 'Unknown error'}. Please contact support.`;
      }
    }
    
    return `✅ Great! You're now in the Base @ DevConnect group chat. 

You'll receive exclusive updates and can participate in community discussions about future Base events!

Check your group chats to see the conversation.`;

  } catch (error: any) {
    console.error(`❌ Error adding member to Base @ DevConnect group:`, error);
    return `❌ Failed to add you to the Base @ DevConnect group. Please contact support or try again later.`;
  }
}

// Function to get activity group info
export function getActivityGroupInfo(activity: keyof typeof ACTIVITY_GROUPS): { name: string } | null {
  const isValidActivity = ACTIVITY_GROUPS[activity];
  const name = ACTIVITY_NAMES[activity];
  
  if (!isValidActivity || !name) return null;
  
  return { name };
}

// List all available activity groups
export function getAvailableActivities(): string[] {
  return Object.keys(ACTIVITY_GROUPS);
}

// Activity group mapping for quick actions
export const ACTIVITY_GROUP_MAP = {
  // Recovery Community Groups
  'red door community': 'join_red_door_community',
  'sober social': 'join_sober_social',
  'outings': 'join_outings', 
  'recovery support': 'join_recovery_support'
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
    description: "👥 Which Red Door Life Group community would you like to join?",
    actions: [
      {
        id: "join_red_door_community",
        label: "🏠 Red Door Community",
        style: "primary"
      },
      {
        id: "join_sober_social",
        label: "🤝 Sober Social",
        style: "primary"
      },
      {
        id: "join_outings",
        label: "🌟 Outings",
        style: "primary"
      },
      {
        id: "join_recovery_support",
        label: "💪 Recovery Support",
        style: "primary"
      }
    ]
  };
}
