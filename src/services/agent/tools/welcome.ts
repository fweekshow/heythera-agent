import { tool } from "@langchain/core/tools";

export const sendWelcomeMessage = tool(
  () => {
    // Return Quick Actions for Base App (coinbase.com/actions:1.0)
    return JSON.stringify({
      contentType: "coinbase.com/actions:1.0",
      content: {
        id: "basecamp_welcome_actions",
        description: "Hi! I'm Rocky the Basecamp Agent. Here are things I can help you with:",
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
    return `🤖 Basecamp 2025 Concierge - Available Commands

📅 SCHEDULE COMMANDS:
• "schedule" - Get the 3-day event itinerary
• "schedule [day]" - Get schedule for specific day (Sunday, Monday, Tuesday)

ℹ️ INFO COMMANDS:
• "info" or "about basecamp" - General information about Basecamp 2025
• "faq" - Get FAQ topics (detailed answers on website)

⏰ REMINDER COMMANDS:
• "remind me [message] at [time]" - Set a reminder
• "remind me [message] in [X] minutes/hours" - Set relative reminder  
• "my reminders" - View all your reminders
• "delete reminder [number]" - Delete a specific reminder

💡 EXAMPLES:
• "What's the schedule for Monday?"
• "What is Basecamp?"
• "Remind me to submit application tomorrow"
• "When does the Welcome Reception start?"

Need more help? Just ask me naturally - I understand conversational requests too!

Official site: https://www.basecamp2025.xyz 
Updates: @base`;
  },
  {
    name: "ShowHelp",
    description:
      "Shows detailed help information with available commands for Basecamp 2025",
  },
);
