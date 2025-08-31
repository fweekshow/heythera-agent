import { tool } from "@langchain/core/tools";
import { BASECAMP_URL } from "@/constant.js";

export const fetchBasecampInfo = tool(
  () => {
    return `Basecamp 2025 Information:

Event Dates: September 14-16, 2025

What we know from ${BASECAMP_URL}:

📅 SCHEDULE:
• Sunday 9/14: Guest arrivals, Welcome Reception (6:00–10:00pm)
• Monday 9/15: Full day of programming with breakfast, sessions, activities, dinner
• Tuesday 9/16: Final day with programming and closing activities

❓ FAQ TOPICS (visit website for details):
• What is Basecamp?
• Is Basecamp free? What costs do I cover?
• When can I expect to hear back about my application?
• What are you looking for in applicants?
• What happens if I'm not accepted?
• Will Basecamp be livestreamed or available online?

For complete details, applications, and FAQ answers: ${BASECAMP_URL}`;
  },
  {
    name: "FetchBasecampInfo",
    description:
      "Provides all available information about Basecamp 2025 based on the official website",
  },
);
