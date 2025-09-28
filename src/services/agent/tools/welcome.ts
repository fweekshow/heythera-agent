import { tool } from "@langchain/core/tools";

export const sendWelcomeMessage = tool(
  () => {
    // Return Quick Actions for Base App (coinbase.com/actions:1.0)
    return JSON.stringify({
      contentType: "coinbase.com/actions:1.0",
      content: {
        id: "basecamp_welcome_actions",
        description: "Hi! I'm Thera your Wellness Concierge assistant. Here are things I can help you with:",
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
      }
    });
  },
  {
    name: "SendWelcomeMessage",
    description: "Sends a welcome message with Quick Actions for new users to choose from (Schedule, Set Reminder, Concierge Support)",
  },
);

export const showHelp = tool(
  () => {
    return `🤖 Thera - Wellness Concierge Assistant - Available Commands

📅 SCHEDULE COMMANDS:
• "schedule" - Get the weekly therapeutic schedule
• "schedule [day]" - Get schedule for specific day (Monday-Saturday)

ℹ️ INFO COMMANDS:
• "info" or "about red door" - General information about Red Door Life Group
• "facilitators" - Learn about our therapeutic staff

⏰ REMINDER COMMANDS:
• "remind me [message] at [time]" - Set a reminder
• "remind me [message] in [X] minutes/hours" - Set relative reminder  
• "my reminders" - View all your reminders
• "delete reminder [number]" - Delete a specific reminder

💡 EXAMPLES:
• "What's the schedule for Monday?"
• "When is yoga with Monique?"
• "Remind me about DBT skills tomorrow"
• "Who facilitates trauma education?"

Need more help? Just ask me naturally - I understand conversational requests too!

Official site: https://www.reddoor.life 
Contact: 424.242.2760`;
  },
  {
    name: "ShowHelp",
    description:
      "Shows detailed help information with available commands for Red Door Life Group",
  },
);
