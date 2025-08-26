import { tool } from "@langchain/core/tools";
import { SUMMIT_URL } from "@/constant.js";

export const fetchHackathonDetails = tool(
  () => {
    return `Hackathon Details:

The Onchain Summit Hackathon runs Wednesday-Friday (August 20-22) and is invite-only.

Schedule:
• Wednesday: Build sessions + family meal
• Thursday: Build sessions + Art Show & Happy Hour
• Friday: Final build session + submission + OSC Party

Registration is required. Check ${SUMMIT_URL} for details. 

Ask me about the hackathon schedule or specific build sessions!`;
  },
  {
    name: "FetchHackathonDetails",
    description:
      "Retrieves complete details about the Onchain Summit hackathon, including schedule, summit url",
  },
);
