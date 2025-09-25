# Rocky: Agent Launcher + Token Launcher Build Plan

## 🎯 Vision
A Base miniapp where users can create custom AI agents with selected tools, website knowledge integration, and automatic deployment with token generation.

## 📋 Available Tools (From Basecamp Concierge)

### **Easy Tools (Phase 1 - Start with 4)**
1. **Help System**
   - `showHelp` - Displays available commands and examples

2. **Event/Business Information**
   - `fetchEventInfo` - Provides event/business information from the creators website

3. **Schedule Management**
   - `getFullSchedule` - AI responsses for Complete event/business schedules

4. **Reminder System**
   - `setReminder` - Personal reminders with timezone conversion
   - `fetchAllPendingReminders` - View all reminders
   - `cancelPendingReminder` - Cancel specific reminder

### **Advanced Tools (Future Phases)**
5. **Broadcasting** *(Admin Only)*
   - `previewBroadcast` - Mass communication system
   - `confirmBroadcast` - Send announcements

6. **Group Management** *(Admin Only)*
   - `createGroup` - Create new XMTP groups
   - `trackGroups` - Keep track of all created groups
   - `addMemberToActivityGroup` - Group coordination
   - `addMembersToGroup` - Bulk member management
   - `listGroups` - Show all managed groups
   - `getGroupInfo` - Get group details and member count

7. **Emergency Communication**
   - `forwardUrgentMessage` - Forward urgent messages to admins

---

## 🏗️ Rocky Architecture

### **Phase 1: MVP Agent Launcher (4 Easy Tools)**

#### **Frontend: Base Miniapp**
```
Rocky Agent Builder
├── Tool Selection (Checkboxes)
│   ├── ✅ Help System
│   ├── ✅ Event/Business Information  
│   ├── ✅ Schedule Management
│   └── ✅ Reminder System
├── Configuration
│   ├── Agent Name Input
│   ├── Website URL Input
│   ├── Agent Description
│   └── Token Name/Symbol
└── Deploy Button
```

#### **Backend: Agent Generator**
```
Rocky Backend
├── Website Crawler
│   ├── Scrape website content
│   ├── Extract key information
│   ├── Generate knowledge base
│   └── Create agent prompt
├── Key Generator
│   ├── Run `npm run generateKeys`
│   ├── Store keys securely
│   └── Generate agent config
├── Agent Builder
│   ├── Select tool templates
│   ├── Inject website knowledge
│   ├── Configure XMTP client
│   └── Generate agent code
└── Deployment Pipeline
    ├── Create Railway project
    ├── Deploy agent instance
    ├── Generate token contract
    └── Return agent details
```

---

## 🚀 Phase 1 Implementation Plan

### **Step 1: Tool Template System**
Create modular tool templates that can be easily configured:

```typescript
// Tool Templates
interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  requiredData: string[];
  codeTemplate: string;
}

const EASY_TOOLS: ToolTemplate[] = [
  {
    id: 'help',
    name: 'Help System',
    description: 'Shows available commands and examples',
    difficulty: 'easy',
    requiredData: ['agentName', 'availableCommands'],
    codeTemplate: 'templates/help.ts'
  },
  {
    id: 'eventinfo',
    name: 'Event/Business Information',
    description: 'Provides information about your event/business',
    difficulty: 'easy', 
    requiredData: ['websiteData', 'businessDescription', 'eventDetails'],
    codeTemplate: 'templates/eventinfo.ts'
  },
  {
    id: 'schedule',
    name: 'Schedule Management',
    description: 'Shows event schedules and programming',
    difficulty: 'easy',
    requiredData: ['scheduleData', 'timezone', 'eventDates'],
    codeTemplate: 'templates/schedule.ts'
  },
  {
    id: 'reminders',
    name: 'Reminder System',
    description: 'Personal reminders with timezone support',
    difficulty: 'easy',
    requiredData: ['timezone', 'databaseConfig'],
    codeTemplate: 'templates/reminders.ts'
  }
];
```

### **Step 2: Website Crawler**
```typescript
// Website Crawler Service
class WebsiteCrawler {
  async crawlWebsite(url: string): Promise<WebsiteData> {
    // 1. Crawl main pages
    // 2. Extract text content
    // 3. Identify key sections (About, Services, Contact, FAQ)
    // 4. Generate structured knowledge base
    // 5. Create agent-specific prompts
  }
}

interface WebsiteData {
  businessName: string;
  description: string;
  services: string[];
  contact: ContactInfo;
  faq: FAQ[];
  keyContent: string;
  agentPrompt: string;
}
```

### **Step 3: Agent Generator**
```typescript
// Agent Generator Service
class AgentGenerator {
  async generateAgent(config: AgentConfig): Promise<AgentDeployment> {
    // 1. Generate XMTP keys
    const keys = await this.generateXMTPKeys();
    
    // 2. Build tool set from templates
    const tools = await this.buildTools(config.selectedTools, config.websiteData);
    
    // 3. Create agent code
    const agentCode = await this.assembleAgent(tools, config);
    
    // 4. Deploy to Railway
    const deployment = await this.deployToRailway(agentCode, keys);
    
    // 5. Generate token
    const token = await this.generateToken(config.tokenConfig);
    
    return { deployment, token, agentUrl: deployment.url };
  }
}
```

### **Step 4: Base Miniapp Frontend**
```typescript
// Rocky Frontend Components
const AgentBuilder = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [agentConfig, setAgentConfig] = useState<AgentConfig>();
  
  const handleDeploy = async () => {
    // 1. Validate inputs
    // 2. Crawl website
    // 3. Generate agent
    // 4. Show deployment results
  };
  
  return (
    <div className="agent-builder">
      <ToolSelector tools={EASY_TOOLS} onChange={setSelectedTools} />
      <WebsiteInput value={websiteUrl} onChange={setWebsiteUrl} />
      <AgentConfigForm onChange={setAgentConfig} />
      <DeployButton onClick={handleDeploy} />
    </div>
  );
};
```

---

## 📁 Project Structure

```
rocky/
├── frontend/                 # Base Miniapp
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentBuilder.tsx
│   │   │   ├── ToolSelector.tsx
│   │   │   ├── WebsiteInput.tsx
│   │   │   └── DeploymentStatus.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── types/
│   └── package.json
├── backend/                  # Agent Generator API
│   ├── src/
│   │   ├── services/
│   │   │   ├── crawler.ts
│   │   │   ├── generator.ts
│   │   │   ├── deployer.ts
│   │   │   └── tokenLauncher.ts
│   │   ├── templates/        # Tool templates
│   │   │   ├── help.ts
│   │   │   ├── eventinfo.ts
│   │   │   ├── schedule.ts
│   │   │   └── reminders.ts
│   │   └── routes/
│   └── package.json
├── shared/                   # Shared types and utils
│   ├── types.ts
│   └── constants.ts
└── docs/
    ├── API.md
    └── DEPLOYMENT.md
```

---

## 🎯 Success Metrics

### **Phase 1 Goals**
- [ ] Users can select 4 basic tools
- [ ] Website crawler extracts useful business information
- [ ] Agent generator creates functional XMTP agents
- [ ] Automatic deployment to Railway works
- [ ] Token generation integrated
- [ ] End-to-end flow takes < 5 minutes

### **Key Features**
- **One-click deployment**: From tool selection to live agent
- **Website integration**: AI automatically learns about user's business
- **Token bundling**: Every agent comes with a token
- **Base ecosystem**: Native Base miniapp with seamless UX
- **Modular tools**: Easy to add more tools in future phases

---

## 🔄 Future Phases

### **Phase 2: Medium Tools**
- Schedule management
- Reminder system
- Database integration

### **Phase 3: Advanced Tools**
- Broadcasting system
- Group management
- Admin controls

### **Phase 4: Marketplace**
- Agent discovery
- Tool marketplace
- Revenue sharing

---

## 🔧 Enhanced Group Management System

### **Group Creation & Tracking Features**
```typescript
// Enhanced Group Management Service
class GroupManager {
  // Create new XMTP group
  async createGroup(config: GroupConfig): Promise<GroupInfo> {
    const group = await client.conversations.newGroup([...initialMembers]);
    
    // Store group metadata in database
    const groupInfo = await this.storeGroupMetadata({
      groupId: group.id,
      name: config.name,
      description: config.description,
      category: config.category,
      createdBy: config.creatorInboxId,
      createdAt: new Date(),
      isPublic: config.isPublic,
      maxMembers: config.maxMembers
    });
    
    return groupInfo;
  }
  
  // Track all groups created by agent
  async trackGroups(): Promise<GroupInfo[]> {
    return await this.database.getGroupsByAgent(this.agentId);
  }
  
  // Get group statistics and info
  async getGroupInfo(groupId: string): Promise<GroupDetails> {
    const group = await client.conversations.getConversationById(groupId);
    const metadata = await this.database.getGroupMetadata(groupId);
    const memberCount = await group.members.length;
    
    return {
      ...metadata,
      memberCount,
      isActive: await this.checkGroupActivity(groupId),
      lastActivity: await this.getLastActivity(groupId)
    };
  }
}

interface GroupConfig {
  name: string;
  description: string;
  category: 'event' | 'topic' | 'activity' | 'announcement';
  creatorInboxId: string;
  initialMembers: string[];
  isPublic: boolean;
  maxMembers?: number;
}

interface GroupInfo {
  groupId: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  createdAt: Date;
  isActive: boolean;
}
```

### **Database Schema for Group Tracking**
```sql
-- Groups table
CREATE TABLE agent_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT UNIQUE NOT NULL,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT false,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Group members tracking
CREATE TABLE group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  member_inbox_id TEXT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  added_by TEXT,
  is_admin BOOLEAN DEFAULT false,
  FOREIGN KEY (group_id) REFERENCES agent_groups (group_id)
);

-- Group activity tracking
CREATE TABLE group_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'message', 'member_join', 'member_leave'
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  FOREIGN KEY (group_id) REFERENCES agent_groups (group_id)
);
```

### **Group Management Tools**
```typescript
// New tools for group creation and management
export const createGroup = tool(
  async ({ name, description, category, initialMembers }: CreateGroupParams) => {
    const groupInfo = await groupManager.createGroup({
      name,
      description,
      category,
      creatorInboxId: senderInboxId,
      initialMembers,
      isPublic: false
    });
    
    return `✅ Group "${name}" created successfully!\n\nGroup ID: ${groupInfo.groupId}\nCategory: ${category}\nMembers: ${initialMembers.length}\n\nUse /addmembers ${groupInfo.groupId} [addresses] to add more members.`;
  },
  {
    name: "CreateGroup",
    description: "Create a new XMTP group with specified name, description and initial members",
    schema: z.object({
      name: z.string().describe("Name of the group"),
      description: z.string().describe("Description of the group"),
      category: z.enum(['event', 'topic', 'activity', 'announcement']).describe("Group category"),
      initialMembers: z.array(z.string()).describe("Array of wallet addresses for initial members")
    })
  }
);

export const listGroups = tool(
  async () => {
    const groups = await groupManager.trackGroups();
    
    if (groups.length === 0) {
      return "No groups found. Use /creategroup to create your first group.";
    }
    
    const groupList = groups.map(g => 
      `📋 ${g.name} (${g.category})\n` +
      `   ID: ${g.groupId}\n` +
      `   Members: ${g.memberCount}\n` +
      `   Created: ${g.createdAt.toDateString()}\n` +
      `   Status: ${g.isActive ? '🟢 Active' : '🔴 Inactive'}`
    ).join('\n\n');
    
    return `🏷️ Managed Groups (${groups.length}):\n\n${groupList}`;
  },
  {
    name: "ListGroups",
    description: "List all groups created and managed by this agent"
  }
);

export const getGroupInfo = tool(
  async ({ groupId }: { groupId: string }) => {
    const groupDetails = await groupManager.getGroupInfo(groupId);
    
    return `📋 Group Details: ${groupDetails.name}\n\n` +
           `ID: ${groupId}\n` +
           `Description: ${groupDetails.description}\n` +
           `Category: ${groupDetails.category}\n` +
           `Members: ${groupDetails.memberCount}${groupDetails.maxMembers ? `/${groupDetails.maxMembers}` : ''}\n` +
           `Created: ${groupDetails.createdAt.toDateString()}\n` +
           `Status: ${groupDetails.isActive ? '🟢 Active' : '🔴 Inactive'}\n` +
           `Last Activity: ${groupDetails.lastActivity?.toDateString() || 'No recent activity'}`;
  },
  {
    name: "GetGroupInfo",
    description: "Get detailed information about a specific group",
    schema: z.object({
      groupId: z.string().describe("The group ID to get information about")
    })
  }
);
```

---

## 💡 Technical Considerations

1. **Security**: Secure key generation and storage
2. **Scalability**: Handle multiple concurrent deployments
3. **Reliability**: Robust error handling and rollback
4. **Cost**: Optimize Railway usage and token deployment costs
5. **UX**: Smooth onboarding and clear progress indicators

This build plan starts with the easiest tools and creates a foundation for expanding Rocky into a full agent creation platform.
