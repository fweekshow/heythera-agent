import { tool } from "@langchain/core/tools";

export const sendWelcomeMessage = tool(
  () => {
    return `Hi! I'm the Basecamp 2025 Concierge - your helpful assistant for Basecamp. I can help you with the Schedule, General Info or Setting Reminders.

Ask me questions like... "What's the schedule on Monday?" "Set me a reminder 15 minutes before Dinner"`;
  },
  {
    name: "SendWelcomeMessage",
    description:
      "Sends a welcome message explaining the agent's capabilities for Basecamp 2025",
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
