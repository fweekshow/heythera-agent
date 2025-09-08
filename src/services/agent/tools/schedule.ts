import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { EVENT_TZ } from "@/constant.js";

const SCHEDULE_DATA = {
  sunday: {
    title: "Sunday 9/14 — Arrival Day",
    events: [
      "9:00 AM: Alpine Club Lounge Opens",
      "2:00 PM: Basecamp Check-In",
      "6:00 PM: Welcome Reception",
    ],
  },
  monday: {
    title: "Monday 9/15 — Day 1 (Full Programming)",
    events: [
      // Morning
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: State of Base w/ Jesse Pollak & Special Guests",
      "10:00–10:20 AM: Fireside Chat (Jesse Pollak & Special Guests)",
      "10:40–11:00 AM: Panel Discussion on Growth (Special Guests)",
      "11:30 AM: Workshops Round 1",
      "12:30 PM: Workshops Round 2",
      "1:30–3:00 PM: Lunch",
      
      // Day Activities
      "7:00 AM: Yoga",
      "8:00 AM: Guided Trail Running", 
      "All Day: Tattoo Parlour",
      "All Day: Merch Trading Post",
      "11:00 AM–7:00 PM: Lawn Games",
      "11:00 AM–8:00 PM: Co-work & Co-create",
      "2:00–4:00 PM: Mushroom Lab",
      "2:00–3:00 PM: Yoga",
      "3:00–5:00 PM: Pickleball Tournament",
      "5:00–6:30 PM: Whiskey Tasting",
      
      // Evening
      "7:00–9:00 PM: Communal Banquet",
      
      // Night Activities
      "9:00 PM: Night Hike",
      "9:00–11:00 PM: Gaming",
      "9:00–10:30 PM: Whiskey Tasting",
      "Varies: Karaoke",
      "Varies: Poker", 
      "Varies: Village Green Fire Pits",
    ],
  },
  tuesday: {
    title: "Tuesday 9/16 — Day 2 & Closing",
    events: [
      // Morning
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: Jesse AMA & Award Ceremony",
      "11:30 AM: Workshops Round 3",
      "12:30 PM: Workshops Round 4", 
      "1:30–3:00 PM: Lunch",
      
      // Day Activities
      "All Day: Tattoo Parlour",
      "All Day: Merch Trading Post",
      "11:00 AM–7:00 PM: Lawn Games",
      "11:00 AM–8:00 PM: Co-work & Co-create",
      "4:00–6:00 PM: Pickleball Tournament",
      
      // Evening
      "7:00 PM: Dinner - Food Truck Festival",
      "8:00 PM: Live Band Performance",
      
      // Night Activities
      "9:00–11:00 PM: Gaming",
      "Varies: Karaoke",
      "Varies: Poker",
      "Varies: Village Green Fire Pits",
    ],
  },
  wednesday: {
    title: "Wednesday 9/17 — Departure",
    events: [
      "5:00–10:00 AM: Breakfast",
      "Departure day",
    ],
  },
};

export const fetchBasecampScheduleDetails = tool(
  () => {
    const today = DateTime.now().setZone(EVENT_TZ);
    let scheduleText = `Basecamp 2025 Schedule\n`;
    scheduleText += `Event Duration: September 14-17, 2025\n\n`;
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
      "ALWAYS use this tool for ANY schedule question - whether asking for the full schedule, specific days like 'Monday', 'Tuesday', 'Sunday', 'Wednesday', or specific events. Contains complete accurate schedule for September 14-17, 2025 (Sunday-Wednesday). Use this tool first, then extract the relevant information from the response.",
  },
);

export const getSpecificDaySchedule = tool(
  ({ day }: { day: string }) => {
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA];
    
    if (!scheduleData) {
      return `Invalid day. Basecamp 2025 runs September 14-17, 2025. Available days are:
- Sunday (September 14) - Arrival Day
- Monday (September 15) - Day 1 (Full Programming)
- Tuesday (September 16) - Day 2 & Closing
- Wednesday (September 17) - Departure`;
    }

    let result = `${scheduleData.title}\n\n`;
    scheduleData.events.forEach((event) => {
      result += `- ${event}\n`;
    });
    
    return result;
  },
  {
    name: "GetSpecificDaySchedule",
    description: "Gets the schedule for a specific day (Sunday, Monday, Tuesday, or Wednesday) during Basecamp 2025. Use when someone asks about schedule for a particular day like 'What's the schedule on Monday?' or 'Tuesday schedule'. Parameter: day (string) - The day to get schedule for: 'Sunday', 'Monday', 'Tuesday', or 'Wednesday'",
  }
);
