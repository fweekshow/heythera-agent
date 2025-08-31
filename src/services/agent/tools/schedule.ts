import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { EVENT_TZ } from "@/constant.js";

const SCHEDULE_DATA = {
  sunday: {
    title: "Sunday 9/14 — Arrival Day",
    events: [
      "All day: Guest arrivals",
      "6:00–10:00pm: Welcome Reception",
    ],
  },
  monday: {
    title: "Monday 9/15 — Day 1",
    events: [
      "8:00–10:00am: Breakfast + AM connection",
      "10:00–11:00am: Kickoff & Featured Programming",
      "11:00am–1:00pm: Curated Sessions",
      "1:00–3:00pm: Lunch",
      "3:00–7:00pm: Open Day Activities",
      "7:00–9:00pm: Dinner",
      "9:00pm+: Evening Activities",
    ],
  },
  tuesday: {
    title: "Tuesday 9/16 — Day 2 & Closing",
    events: [
      "8:00–10:00am: Breakfast",
      "10:00–11:00am: Featured Programming",
      "11:00am–1:00pm: Curated Sessions",
      "1:00–3:00pm: Lunch",
      "3:00–7:00pm: Open Day Activities",
      "7:00–9:00pm: Dinner",
      "9:00pm+: Closing Activities",
    ],
  },
};

export const fetchBasecampScheduleDetails = tool(
  () => {
    const today = DateTime.now().setZone(EVENT_TZ);
    let scheduleText = `Basecamp 2025 Schedule\n`;
    scheduleText += `Event Duration: September 14-16, 2025\n\n`;
    scheduleText += `Today's Date: ${today.toFormat("LLLL d, yyyy")}\n`;
    scheduleText += `Today's Day: ${today.toFormat("cccc")}\n`;
    scheduleText += `Current Time: ${today.toFormat("hh:mm a ZZZZ")}\n\n`;

    // Add each day's schedule in a readable format
    Object.entries(SCHEDULE_DATA).forEach(([day, data]) => {
      scheduleText += `${data.title}\n`;
      data.events.forEach((event) => {
        scheduleText += `- ${event}\n`;
      });
      scheduleText += `\n`;
    });

    return scheduleText;
  },
  {
    name: "FetchBasecampScheduleDetails",
    description:
      "ALWAYS use this tool for ANY schedule question - whether asking for the full schedule, specific days like 'Monday', 'Tuesday', 'Sunday', or specific events. Contains complete accurate schedule for September 14-16, 2025 (Sunday-Tuesday). Use this tool first, then extract the relevant information from the response.",
  },
);

export const getSpecificDaySchedule = tool(
  ({ day }: { day: string }) => {
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA];
    
    if (!scheduleData) {
      return `Invalid day. Basecamp 2025 runs September 14-16, 2025. Available days are:
- Sunday (September 14) - Arrival Day
- Monday (September 15) - Day 1  
- Tuesday (September 16) - Day 2 & Closing`;
    }

    let result = `${scheduleData.title}\n\n`;
    scheduleData.events.forEach((event) => {
      result += `- ${event}\n`;
    });
    
    return result;
  },
  {
    name: "GetSpecificDaySchedule",
    description: "Gets the schedule for a specific day (Sunday, Monday, or Tuesday) during Basecamp 2025. Use when someone asks about schedule for a particular day like 'What's the schedule on Monday?' or 'Tuesday schedule'. Parameter: day (string) - The day to get schedule for: 'Sunday', 'Monday', or 'Tuesday'",
  }
);
