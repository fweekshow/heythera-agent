import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { SF_TZ } from "@/constant.js";

const SCHEDULE_DATA = {
  wednesday: {
    title: "Wednesday — HACKATHON INVITE ONLY:",
    events: [
      "8:00am - 9:00am: Morning Welcome . Announcements . Breakfast Served",
      "9:00am - 12:30pm: Morning Build Session",
      "12:30pm - 1:30pm: Lunch Served",
      "1:30pm - 4:00pm: Afternoon Build Session",
      "4:00pm - 5:00pm: Break Before Dinner",
      "6:00 - 8:00: Kevin and Chintan Prepare Family Meal",
      "8:00 - 12:00: Space is open for building and connecting.",
    ],
  },
  thursday: {
    title: "Thursday — HACKATHON INVITE ONLY UNTIL HAPPY HOUR:",
    events: [
      "8:00am - 9:00am: Breakfast Served",
      "9:00am - 12:30pm: Morning Build Session",
      "12:30pm - 1:30pm: Lunch Served",
      "1:30pm - 4:00pm: Afternoon Build Session",
      "4:00pm - 4:30pm: Break Before Art Show and Happy Hour",
      "4:30 - 8:00: OSC Art Show . Dinner . Open Bar . DJ Big Kev",
    ],
  },
  friday: {
    title: "Friday — HACKATHON INVITE ONLY UNTIL HAPPY HOUR:",
    events: [
      "8:00am: Doors Open . Breakfast Served",
      "9:00am - 12:30pm: Morning Build Session",
      "12:30pm - 1:30pm: Lunch Served",
      "1:30pm - 3:00pm: Afternoon Build Session",
      "3:00pm - 4:00pm: Build Submission - Conclusion of Hackathon",
      "5:00pm - 9:00pm: OSC Opening Happy Hour . DJ Mark Divita",
      "• ROOR Poker Tournament",
      "• 9:30pm doors open",
      "• ROOR OSC Party - Mustache Harbor",
      "• 111 Minna . SF, CA 94105",
    ],
  },
  saturday: {
    title: "Saturday:",
    events: [
      "10:00am: Doors Open . Breakfast Served",
      "10:00am - 5:00pm: Builder Demo Hall",
      "12:30pm - 1:30pm: Lunch Served",
      "1:30pm - 5:00pm: Main Stage",
      "7:00pm - 11:00pm: OSC Casino Night . Golden State Warriors . Hosted by Franco Finn",
    ],
  },
  sunday: {
    title: "Sunday:",
    events: [
      "10:00am - 12:00pm: San Francisco Brunch Served",
      "12:00pm - 7:00pm: Film3 Festival - Festival Tickets",
    ],
  },
};

export const fetchSummitScheduleDetails = tool(
  () => {
    const today = DateTime.now().setZone(SF_TZ);

    return `
    Summit Duration - August 20 (Wednesday) - August 24 (Sunday)

    Today's Date: ${today.toFormat("LLLL d, yyyy")}
    Today's Day: ${today.toFormat("cccc")}
    Current Time: ${today.toFormat("hh:mm a ZZZZ")}

    Complete Schedule:
    ${JSON.stringify(SCHEDULE_DATA)}
    `;
  },
  {
    name: "FetchSummitSchedules",
    description:
      "Retrieves the full Onchain Summit schedule. Includes today’s date and weekday (based on San Francisco timezone), today’s events, and the complete multi-day program with all scheduled activities",
  },
);
