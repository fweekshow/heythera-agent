import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { EVENT_TZ, eventDate } from "../../../constant.js";
import { z } from "zod";

export const FACILITATORS_DATA = {
  "Chris": {
    title: "Fitness Instructor",
    bio: "Leads the daily group workout sessions to help residents start their day with energy and movement."
  },
  "Monique": {
    title: "Yoga/Breathwork/Sound Healing Facilitator", 
    bio: "Specializes in holistic healing practices including yoga, breathwork, and sound healing sessions."
  },
  "David": {
    title: "Mental Health Counselor",
    bio: "Helps residents navigate mental health struggles and develop healthy coping strategies."
  },
  "Christopher": {
    title: "Spirituality in Recovery Facilitator",
    bio: "Guides residents in exploring spiritual aspects of their recovery journey."
  },
  "Colin": {
    title: "Recovery Counselor",
    bio: "Specializes in coping with change and relapse prevention strategies."
  },
  "Donny": {
    title: "Addiction Specialist",
    bio: "Helps residents understand addiction and works with the 12 Dimensions program."
  },
  "Rachel": {
    title: "Somatic Therapist",
    bio: "Facilitates somatic writing and grief processing sessions."
  },
  "Matthew": {
    title: "Relationships & Somatic Process Therapist",
    bio: "Focuses on relationships in recovery and somatic processing techniques. Also leads Somatic Imagination sessions on Saturdays."
  },
  "Bianca": {
    title: "Family Dynamics Specialist",
    bio: "Works on healing family dynamics and the 12 Dimensions program."
  },
  "Emanuela": {
    title: "Trauma & Psychospiritual Specialist",
    bio: "Facilitates trauma education, psychospiritual practices, and emotional processing sessions."
  },
  "Matt M.": {
    title: "Technology Wellness Facilitator",
    bio: "Helps residents develop a healthy relationship with technology."
  },
  "Kristen": {
    title: "12-Step Program Specialist",
    bio: "Facilitates NA & The 12 Steps sessions and goal-setting workshops."
  },
  "Sean Patrick": {
    title: "DBT Skills Therapist",
    bio: "Teaches Dialectical Behavior Therapy skills for emotional regulation and interpersonal effectiveness."
  },
  "Tash": {
    title: "Movement Therapist",
    bio: "Teaches pole dancing and movement therapy in the yoga room."
  }
};

export const SCHEDULE_DATA = {
  monday: {
    title: "Monday — Red Door Life Group Schedule",
    events: [
      "8:00 AM: Daily Group Workout w/ Chris",
      "9:00 AM: Daily Intentions",
      "10:00 AM: Yoga/Breathwork/Sound Healing w/ Monique",
      "11:00 AM: Coping with Change w/ Colin",
      "1:00 PM: 12 Dimensions w/ Bianca",
      "2:00 PM: Balance and Wellness through Technology w/ Matt M.",
      "3:00 PM: NA & The 12 Steps w/ Kristen",
      "4:00 PM: Soundbath with Monique (Yoga Room)",
    ],
  },
  tuesday: {
    title: "Tuesday — Red Door Life Group Schedule",
    events: [
      "8:00 AM: Daily Group Workout w/ Chris",
      "9:00 AM: Daily Intentions", 
      "10:00 AM: Navigating Mental Health Struggles w/ David",
      "11:00 AM: Understanding Addiction w/ Donny",
      "1:00 PM: Psychospiritual Practices w/ Emanuela",
      "2:00 PM: Open Journaling",
      "3:00 PM: Setting and Attaining Goals w/ Kristen",
    ],
  },
  wednesday: {
    title: "Wednesday — Red Door Life Group Schedule",
    events: [
      "8:00 AM: Daily Group Workout w/ Chris",
      "9:00 AM: Daily Intentions",
      "10:00 AM: Yoga/Breathwork/Sound Healing with Monique",
      "11:00 AM: Somatic Writing w/ Rachel",
      "1:00 PM: Somatic Grief w/ Rachel", 
      "2:00 PM: Experiencing Emotions w/ Emanuela",
      "3:00 PM: 12 Dimensions w/ Donny",
    ],
  },
  thursday: {
    title: "Thursday — Red Door Life Group Schedule", 
    events: [
      "8:00 AM: Daily Group Workout w/ Chris",
      "9:00 AM: Daily Intentions",
      "10:00 AM: Spirituality in Recovery w/ Christopher",
      "11:00 AM: Relationships in Recovery w/ Matthew",
      "1:00 PM: Trauma Education w/ Emanuela",
      "2:00 PM: Somatic Process w/ Matthew",
      "4:00 PM: Learning Pole with Tash (Yoga Room)",
    ],
  },
  friday: {
    title: "Friday — Red Door Life Group Schedule",
    events: [
      "8:00 AM: Daily Group Workout w/ Chris",
      "9:00 AM: Daily Intentions",
      "10:00 AM: Yoga/Breathwork/Sound Healing w/ Monique",
      "11:00 AM: Relapse Prevention w/ Colin",
      "1:00 PM: House Meeting",
      "2:00 PM: DBT Skills w/ Sean Patrick",
      "3:00 PM: Healing Family Dynamics w/ Bianca",
    ],
  },
  saturday: {
    title: "Saturday — Red Door Life Group Schedule",
    events: [
      "11:00 AM: Somatic Imagination w/ Matthew (Group Room)",
    ],
  },
};

// Removed fetchBasecampScheduleDetails - using more specific tools instead

export const getFullSchedule = tool(
  async ({ day, query }: { day?: string; query?: string }) => { 
    console.log("🔄 Getting full schedule...", { day, query });
    
    // If there's a specific query, search for relevant content
    if (query) {
      const queryLower = query.toLowerCase();
      console.log("🔍 Searching schedule for:", queryLower);
      
      // Search through all schedule data for relevant content
      const results: string[] = [];
      
      // Search all days
      Object.entries(SCHEDULE_DATA).forEach(([dayName, dayData]) => {
        if (dayData.events) {
          dayData.events.forEach((event: string) => {
            if (event.toLowerCase().includes(queryLower)) {
              results.push(`${dayName.charAt(0).toUpperCase() + dayName.slice(1)}: ${event}`);
            }
          });
        }
      });
      
      if (results.length > 0) {
        return `Here are the sessions related to "${query}":\n\n${results.join('\n\n')}`;
      } else {
        return `I couldn't find any specific sessions about "${query}" in the schedule. Here's the full weekly schedule for you to browse:\n\n${JSON.stringify(SCHEDULE_DATA, null, 2)}`;
      }
    }
    
    // If specific day requested, return that day's schedule
    if (day) {
      const dayKey = day.toLowerCase();
      if (dayKey in SCHEDULE_DATA) {
        return JSON.stringify(SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA]);
      }
    }
    
    // If no day specified, determine current day based on day of week
    const now = eventDate();
    const dayOfWeek = (now.weekdayShort || 'mon').toLowerCase(); // 'mon', 'tue', etc.
    
    // Map day abbreviations to full day names
    let currentDay = 'monday'; // fallback
    if (dayOfWeek === 'mon') currentDay = 'monday';
    else if (dayOfWeek === 'tue') currentDay = 'tuesday';
    else if (dayOfWeek === 'wed') currentDay = 'wednesday';
    else if (dayOfWeek === 'thu') currentDay = 'thursday';
    else if (dayOfWeek === 'fri') currentDay = 'friday';
    else if (dayOfWeek === 'sat') currentDay = 'saturday';
    else if (dayOfWeek === 'sun') currentDay = 'monday'; // Sunday defaults to Monday schedule
    
    console.log(`🔍 Current date: ${now.toFormat('yyyy-MM-dd HH:mm')} ET (${dayOfWeek}), determined day: ${currentDay}`);
    
    // Return current day's schedule
    return JSON.stringify(SCHEDULE_DATA[currentDay as keyof typeof SCHEDULE_DATA]);
  },
  {
    name: "GetFullSchedule",
    description: "Use this tool to get the Red Door Life Group weekly schedule. This tool contains the complete accurate schedule data for Monday through Saturday. Also use for activity questions like 'What time is yoga?', 'When is DBT skills?'",
    schema: z.object({
      day: z.string().optional().describe("The day to get schedule for: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', or 'Saturday'"),
      query: z.string().optional().describe("The specific question or activity being asked about"),
    }),
  }
);

export const getFacilitatorInfo = tool(
  async ({ facilitatorName }: { facilitatorName: string }) => {
    console.log("🔄 Getting facilitator info...", facilitatorName);
    
    const facilitator = FACILITATORS_DATA[facilitatorName as keyof typeof FACILITATORS_DATA];
    
    if (!facilitator) {
      return `Facilitator "${facilitatorName}" not found. Available facilitators: ${Object.keys(FACILITATORS_DATA).join(", ")}`;
    }
    
    return `${facilitatorName} - ${facilitator.title}\n\n${facilitator.bio}`;
  },
  {
    name: "GetFacilitatorInfo",
    description: "Get information about a specific facilitator at Red Door Life Group. Use when someone asks about facilitators, their backgrounds, or who is leading sessions.",
    schema: z.object({
      facilitatorName: z.string().describe("The name of the facilitator to get information about"),
    }),
  }
);

export const getSpecificDaySchedule = tool(
  ({ day }: { day: string }) => { console.log("🔄 Getting specific day schedule...", day);
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA];
    
    if (!scheduleData) {
      return `Invalid day. Red Door Life Group runs Monday through Saturday. Available days are:
- Monday - Full therapy and wellness programming
- Tuesday - Mental health focus and goal setting
- Wednesday - Somatic work and emotional processing
- Thursday - Spirituality and relationships in recovery
- Friday - Relapse prevention and family dynamics
- Saturday - Special Somatic Imagination session`;
    }

    let result = `Here's the schedule for ${scheduleData.title}:\n\n`;
    scheduleData.events.forEach((event) => {
      if (event.trim()) { // Skip empty lines
        result += `- ${event}\n`;
      }
    });
    
    return result;
  },
  {
    name: "GetSpecificDaySchedule",
    description: "CRITICAL: Use this tool for specific day schedule questions like 'What's the schedule for Monday?', 'Monday schedule', 'Tuesday schedule', 'show me Monday', etc. Parameter: day (string) - The day to get schedule for: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', or 'Saturday'",
    schema: z.object({
      day: z.string().describe("The day to get schedule for: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', or 'Saturday'"),
    }),
  }
);


export const getActivityTime = tool(
  async ({ activity, day }: { activity: string; day?: string }) => {
    console.log("🔄 Getting activity time...", activity, day);
    
    // If no day specified, search all days
    if (!day) {
      const activityLower = activity.toLowerCase();
      const results: string[] = [];
      
      Object.entries(SCHEDULE_DATA).forEach(([dayName, dayData]) => {
        dayData.events.forEach((event: string) => {
          if (event.toLowerCase().includes(activityLower)) {
            results.push(`${dayName.charAt(0).toUpperCase() + dayName.slice(1)}: ${event}`);
          }
        });
      });
      
      if (results.length > 0) {
        return `🎯 ${activity} sessions:\n\n${results.join('\n')}`;
      } else {
        return `I couldn't find "${activity}" in the schedule. Try asking about specific sessions like "yoga", "DBT", "12 dimensions", "somatic", etc.`;
      }
    }
    
    // Search specific day
    const dayKey = day.toLowerCase();
    const scheduleData = SCHEDULE_DATA[dayKey as keyof typeof SCHEDULE_DATA];
    
    if (!scheduleData) {
      return `Invalid day. Please specify Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday.`;
    }
    
    const activityLower = activity.toLowerCase();
    const foundActivity = scheduleData.events.find((event: string) => 
      event.toLowerCase().includes(activityLower)
    );
    
    if (foundActivity) {
      return `🎯 ${activity} on ${day}: ${foundActivity}`;
    }
    
    return `I couldn't find "${activity}" on ${day}. Here's what's scheduled that day:\n\n${scheduleData.events.join('\n')}`;
  },
  {
    name: "GetActivityTime",
    description: "Use when someone asks about timing for a specific activity like 'What time is yoga?', 'When is DBT?', 'What time is group workout?'. Parameters: activity (string) - the activity they're asking about, day (optional string) - specific day to search",
    schema: z.object({
      activity: z.string().describe("The activity they're asking about"),
      day: z.string().optional().describe("The specific day to search (optional)"),
    }),
  }
);




