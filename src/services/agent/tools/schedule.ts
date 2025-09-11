import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { EVENT_TZ } from "@/constant.js";
import { z } from "zod";

export const SCHEDULE_DATA = {
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
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: State of Base w/ Jesse Pollak & Special Guests",
      "10:00–10:20 AM: Fireside Chat (Jesse Pollak & Special Guests)",
      "10:40–11:00 AM: Panel Discussion on Growth (Special Guests)",
      "11:30 AM: Workshops Round 1",
      "12:30 PM: Workshops Round 2",
      "1:30–3:00 PM: Lunch",
      "7:00–9:00 PM: Communal Banquet",
      "",
      "☀️ Ask me about 'Day Activities' for yoga, pickleball, whiskey tasting & more!",
      "🌙 Ask me about 'Night Activities' for gaming, karaoke, poker & fire pits!",
    ],
    dayActivities: [
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
    ],
    nightActivities: [
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
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: Jesse AMA & Award Ceremony",
      "11:30 AM: Workshops Round 3",
      "12:30 PM: Workshops Round 4", 
      "1:30–3:00 PM: Lunch",
      "7:00 PM: Dinner - Food Truck Festival",
      "8:00 PM: Live Band Performance",
      "",
      "☀️ Ask me about 'Day Activities' for ongoing activities!",
      "🌙 Ask me about 'Night Activities' for final evening fun!",
    ],
    dayActivities: [
      "All Day: Tattoo Parlour",
      "All Day: Merch Trading Post",
      "11:00 AM–7:00 PM: Lawn Games",
      "11:00 AM–8:00 PM: Co-work & Co-create",
      "4:00–6:00 PM: Pickleball Tournament",
    ],
    nightActivities: [
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

// Removed fetchBasecampScheduleDetails - using more specific tools instead

export const getFullSchedule = tool(
  ({ day, query }: { day?: string; query?: string }) => { 
    console.log("🔄 Getting full schedule...", { day, query });
    
    // Check if this is an activity-specific question for the 4 group activities
    if (query) {
      const queryLower = query.toLowerCase();
      const activityGroupMap = {
        'yoga': 'join_yoga',
        'running': 'join_running', 
        'pickleball': 'join_pickleball',
        'hiking': 'join_hiking'
      };
      
      // Find matching activity
      const activityKey = Object.keys(activityGroupMap).find(key => 
        queryLower.includes(key)
      );
      
      if (activityKey) {
        // Find the activity in the schedule
        let foundActivity = '';
        
        // Search Monday activities
        const mondayData = SCHEDULE_DATA.monday as any;
        if (mondayData.dayActivities) {
          const dayMatch = mondayData.dayActivities.find((item: string) => 
            item.toLowerCase().includes(activityKey)
          );
          if (dayMatch) foundActivity = dayMatch;
        }
        
        // Search Tuesday activities if not found
        if (!foundActivity) {
          const tuesdayData = SCHEDULE_DATA.tuesday as any;
          if (tuesdayData.dayActivities) {
            const dayMatch = tuesdayData.dayActivities.find((item: string) => 
              item.toLowerCase().includes(activityKey)
            );
            if (dayMatch) foundActivity = dayMatch;
          }
        }
        
        if (foundActivity) {
          // Return Quick Actions for group joining
          return JSON.stringify({
            contentType: "coinbase.com/actions:1.0",
            content: {
              id: `${activityKey}_group_join`,
              description: `🎯 ${activityKey.charAt(0).toUpperCase() + activityKey.slice(1)} schedule: ${foundActivity}

Would you like me to add you to the ${activityKey.charAt(0).toUpperCase() + activityKey.slice(1)} @ Basecamp group chat?`,
              actions: [
                {
                  id: activityGroupMap[activityKey as keyof typeof activityGroupMap],
                  label: "✅ Yes, Add Me",
                  style: "primary"
                },
                {
                  id: "no_group_join",
                  label: "❌ No Thanks", 
                  style: "secondary"
                }
              ]
            }
          });
        }
      }
    }
    
    // Default: return full schedule data
    return JSON.stringify(SCHEDULE_DATA);
  },
  {
    name: "GetFullSchedule",
    description: "Use this tool to get the full schedule for Basecamp 2025. This tool contains the complete accurate schedule data for September 14-17, 2025 (Sunday-Wednesday). Also use for activity questions like 'What time is yoga?', 'When is pickleball?'",
    schema: z.object({
      day: z.string().optional().describe("The day to get schedule for: 'Sunday', 'Monday', 'Tuesday', or 'Wednesday'"),
      query: z.string().optional().describe("The specific question or activity being asked about"),
    }),
  }
);

export const getSpecificDaySchedule = tool(
  ({ day }: { day: string }) => { console.log("🔄 Getting specific day schedule...", day);
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA];
    
    if (!scheduleData) {
      return `Invalid day. Basecamp 2025 runs September 14-17, 2025. Available days are:
- Sunday (September 14) - Arrival Day
- Monday (September 15) - Day 1 (Full Programming)
- Tuesday (September 16) - Day 2
- Wednesday (September 17) - Departure`;
    }

    let result = `Here's the schedule for ${scheduleData.title}:\n\n`;
    scheduleData.events.forEach((event) => {
      if (event.trim()) { // Skip empty lines
        result += `- ${event}\n`;
      }
    });
    
    // Add natural prompts for day/night activities on Monday and Tuesday
    const scheduleDataWithActivities = scheduleData as any;
    if (scheduleDataWithActivities.dayActivities && scheduleDataWithActivities.nightActivities) {
      result += `\nWant to know more? Ask me about "Day Activities" or "Night Activities" for ${dayKey === 'monday' ? 'Monday' : 'Tuesday'}!`;
    }
    
    return result;
  },
  {
    name: "GetSpecificDaySchedule",
    description: "CRITICAL: Use this tool for specific day schedule questions like 'What's the schedule for Monday?', 'Monday schedule', 'Tuesday schedule', 'show me Monday', etc. This tool includes the prompts for Day Activities and Night Activities. Parameter: day (string) - The day to get schedule for: 'Sunday', 'Monday', 'Tuesday', or 'Wednesday'",
    schema: z.object({
      day: z.string().describe("The day to get schedule for: 'Sunday', 'Monday', 'Tuesday', or 'Wednesday'"),
    }),
  }
);

export const getDayActivities = tool(
  ({ day, activity }: { day: string; activity?: string }) => {
    console.log("🔄 Getting day activities...", day, activity);
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA] as any;
    
    if (!scheduleData || !scheduleData.dayActivities) {
      return `Day activities are only available for Monday and Tuesday. Available options:
- Monday Day Activities
- Tuesday Day Activities`;
    }

    let result = `☀️ Here are the Day Activities for ${scheduleData.title}:\n\n`;
    scheduleData.dayActivities.forEach((activityItem: string) => {
      result += `- ${activityItem}\n`;
    });
    
    // If they asked about a specific activity, highlight it
    if (activity) {
      const lowerActivity = activity.toLowerCase();
      const matchingActivity = scheduleData.dayActivities.find((item: string) => 
        item.toLowerCase().includes(lowerActivity)
      );
      if (matchingActivity) {
        result += `\n🎯 You asked about ${activity}! It's scheduled: ${matchingActivity}`;
      }
    }
    
    result += `\nLots to choose from! Let me know if you want details about any specific activity.`;
    
    return result;
  },
  {
    name: "GetDayActivities",
    description: "use this tool when someone is asking for day activities",
    schema: z.object({
      day: z.string().describe("The day to get day activities"),
      activity: z.string().describe("The activity they're asking about"),
    }),
  }
);

export const getActivityTime = tool(
  ({ activity, day }: { activity: string; day?: string }) => {
    console.log("🔄 Getting activity time...", activity, day);
    const searchDay = day?.toLowerCase() || 'monday';
    const scheduleData = SCHEDULE_DATA[searchDay as keyof typeof SCHEDULE_DATA] as any;
    
    if (!scheduleData) {
      return `Please specify which day you're asking about: Monday or Tuesday.`;
    }
    
    const activityLower = activity.toLowerCase();
    let foundActivity = '';
    
    // Search in day activities
    if (scheduleData.dayActivities) {
      const dayMatch = scheduleData.dayActivities.find((item: string) => 
        item.toLowerCase().includes(activityLower)
      );
      if (dayMatch) foundActivity = dayMatch;
    }
    
    // Search in night activities
    if (!foundActivity && scheduleData.nightActivities) {
      const nightMatch = scheduleData.nightActivities.find((item: string) => 
        item.toLowerCase().includes(activityLower)
      );
      if (nightMatch) foundActivity = nightMatch;
    }
    
    if (foundActivity) {
      // Check if this is one of the 4 activities with group chats
      const activityGroupMap = {
        'yoga': 'join_yoga',
        'running': 'join_running', 
        'pickleball': 'join_pickleball',
        'hiking': 'join_hiking'
      };
      
      const activityKey = Object.keys(activityGroupMap).find(key => 
        activityLower.includes(key)
      );
      
      if (activityKey) {
        // Return Quick Actions for group joining
        return JSON.stringify({
          contentType: "coinbase.com/actions:1.0",
          content: {
            id: `${activityKey}_group_join`,
            description: `🎯 ${activity} schedule: ${foundActivity}

Would you like me to add you to the ${activityKey.charAt(0).toUpperCase() + activityKey.slice(1)} @ Basecamp group chat?`,
            actions: [
              {
                id: activityGroupMap[activityKey as keyof typeof activityGroupMap],
                label: "✅ Yes, Add Me",
                style: "primary"
              },
              {
                id: "no_group_join",
                label: "❌ No Thanks", 
                style: "secondary"
              }
            ]
          }
        });
      } else {
        return `🎯 ${activity} schedule: ${foundActivity}`;
      }
    }
    
    return `I couldn't find specific timing for "${activity}". Try asking about day activities or night activities for ${searchDay === 'monday' ? 'Monday' : 'Tuesday'}!`;
  },
  {
    name: "GetActivityTime",
    description: "Use when someone asks about timing for a specific activity like 'What time is pickleball?', 'When is yoga?', 'What time?'. Parameters: activity (string) - the activity they're asking about, day (optional string) - Monday or Tuesday",
    schema: z.object({
      activity: z.string().describe("The activity they're asking about"),
      day: z.string().describe("The day to get activity time"),
    }),
  }
);

export const getNightActivities = tool(
  ({ day }: { day: string }) => {
    console.log("🔄 Getting night activities...", day);
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA] as any;
    
    if (!scheduleData || !scheduleData.nightActivities) {
      return `Night activities are only available for Monday and Tuesday. Available options:
- Monday Night Activities  
- Tuesday Night Activities`;
    }

    let result = `🌙 Here are the Night Activities for ${scheduleData.title}:\n\n`;
    scheduleData.nightActivities.forEach((activity: string) => {
      result += `- ${activity}\n`;
    });
    
    result += `\nPerfect way to wind down the day! Ask me about any of these if you want more info.`;
    
    return result;
  },
  {
    name: "GetNightActivities", 
    description: "use this schedule tool when someone is asking for night activities",
    schema: z.object({
      day: z.string().describe("The day to get night activities"),
    }),
  }
);
