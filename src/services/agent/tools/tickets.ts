import { tool } from "@langchain/core/tools";
import { TICKETS_URL } from "@/constant.js";

export const fetchTicketsDetails = tool(
  () => {
    return `Tickets are no longer for sale.

Check the website for the latest information.

NFT pass types:
• Hackathon / Full Summit / Jesse Pass / Dimes Package

Purchase: ${TICKETS_URL}`;
  },
  {
    name: "FetchTicketsDetails",
    description:
      "Retrieves complete details about Onchain Summit tickets, including availability, pass types, and purchase link",
  },
);
