# Sidebar Groups Tool

A comprehensive tool for creating sidebar group conversations in XMTP/Base App, allowing users to spin off focused discussions from larger group chats.

## Features

- **Command-based Group Creation**: Users can create sidebar groups with natural language commands
- **Automatic Invitations**: All members from the original group receive quick action invitations
- **Interactive Join/Decline**: Users respond with yes/no buttons to join sidebar groups
- **Metadata Tracking**: Tracks group relationships, members, and creation details
- **Automatic Cleanup**: Removes expired invitations and manages group lifecycle

## Usage

### Creating a Sidebar Group

Users can create sidebar groups with these commands in any group chat:

```
@rocky sidebar this conversation DevConnect Marketing
@rocky sidebar Marketing Discussion
@rocky sidebar this Planning Committee
```

### System Flow

1. **Detection**: Agent detects `@rocky sidebar` command
2. **Creation**: Creates XMTP group with requester + Rocky as initial members
3. **Invitation**: Sends quick action buttons to all original group members
4. **Response**: Members click "Yes, Join" or "No Thanks" 
5. **Addition**: Accepted members are added to the sidebar group

## Integration

### 1. Add to Main Message Handler

```typescript
import { integrateSidebarGroupHandling } from './services/agent/tools/sidebarGroups.integration';

async function handleMessage(message: DecodedMessage, client: Client) {
  const conversation = await client.conversations.getConversationById(message.conversationId);
  
  // Check for sidebar functionality first
  const sidebarResponse = await integrateSidebarGroupHandling(message, client, conversation);
  if (sidebarResponse) {
    await conversation.send(sidebarResponse);
    return;
  }
  
  // Continue with existing logic...
}
```

### 2. Add Intent Handling

```typescript
// In your intent handling switch statement
case actionId.startsWith('join_sidebar_') ? actionId : '':
  const groupId = actionId.replace('join_sidebar_', '');
  return await joinSidebarGroup(groupId, message.senderInboxId);

case actionId.startsWith('decline_sidebar_') ? actionId : '':
  const groupId = actionId.replace('decline_sidebar_', '');
  return await declineSidebarGroup(groupId, message.senderInboxId);
```

### 3. Initialize Client

```typescript
import { setSidebarClient } from './services/agent/tools/sidebarGroups';

// In your main function
setSidebarClient(client);
```

## API Reference

### Core Functions

#### `handleSidebarRequest(groupName, message, client, conversation)`
Creates a new sidebar group and sends invitations.

#### `joinSidebarGroup(groupId, userInboxId)`
Adds a user to an existing sidebar group.

#### `declineSidebarGroup(groupId, userInboxId)`
Handles user declining to join a sidebar group.

### Utility Functions

#### `parseSidebarCommand(content)`
Extracts group name from sidebar command.

#### `isSidebarRequest(content)`
Checks if message is a sidebar creation request.

#### `getSidebarGroupInfo(groupId)`
Retrieves metadata for a sidebar group.

#### `listSidebarGroups()`
Returns all sidebar groups created by the agent.

#### `cleanupExpiredInvitations(maxAgeHours)`
Removes expired invitations (default: 24 hours).

## Data Structures

### SidebarGroup
```typescript
interface SidebarGroup {
  id: string;              // XMTP group ID
  name: string;            // User-provided group name
  originalGroupId: string; // Source group conversation ID
  createdBy: string;       // Creator's inbox ID
  createdAt: Date;         // Creation timestamp
  members: string[];       // Array of member inbox IDs
}
```

## Quick Actions Format

The tool uses XMTP's ActionsContent format for interactive invitations:

```typescript
{
  id: `sidebar_invite_${groupId}`,
  description: `🎯 "${groupName}" sidebar group was created. Would you like to join?`,
  actions: [
    {
      id: `join_sidebar_${groupId}`,
      label: "✅ Yes, Join",
      style: "primary"
    },
    {
      id: `decline_sidebar_${groupId}`,
      label: "❌ No Thanks", 
      style: "secondary"
    }
  ]
}
```

## Error Handling

- **Group Creation Failures**: Graceful fallback with error messages
- **Member Addition Errors**: Handles XMTP network issues and duplicate members
- **Invalid Invitations**: Validates invitation existence before processing
- **Network Issues**: Retry logic and user-friendly error messages

## Storage

Currently uses in-memory storage with Maps. For production:

- Replace `sidebarGroups` Map with database storage
- Replace `pendingInvitations` Map with persistent storage
- Add database migration for group metadata tables

## Monitoring & Cleanup

- **Invitation Expiry**: 24-hour default expiration for pending invitations
- **Group Tracking**: All sidebar groups are tracked with creation metadata
- **Member Management**: Maintains accurate member lists and group relationships
- **Logging**: Comprehensive console logging for debugging and monitoring

## Example User Experience

1. **User in group chat**: "Hey, can we create a smaller group to discuss the marketing strategy?"

2. **User**: "@rocky sidebar this conversation Marketing Strategy"

3. **Rocky**: "✅ 'Marketing Strategy' sidebar group created successfully! Group members have been invited to join."

4. **All group members receive**: 
   ```
   🎯 "Marketing Strategy" sidebar group was created by a group member.
   Would you like to join this focused discussion?
   [✅ Yes, Join] [❌ No Thanks]
   ```

5. **Members who click "Yes"**: Get added to the new focused sidebar group

6. **Result**: Smaller, focused discussion group for specific topics

## Future Enhancements

- **Group Permissions**: Admin controls and member permissions
- **Group Discovery**: List and search existing sidebar groups
- **Integration with Base Names**: Support for human-readable group addresses
- **Analytics**: Group usage statistics and member engagement tracking
- **Scheduled Cleanup**: Automatic removal of inactive sidebar groups
