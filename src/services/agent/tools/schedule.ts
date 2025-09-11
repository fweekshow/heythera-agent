import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { EVENT_TZ } from "@/constant.js";
import { z } from "zod";

export const SPEAKERS_DATA = {
  "Jesse Pollak": {
    title: "Founder, Base",
    bio: "Founder of Base, leading the development of the Base blockchain and ecosystem."
  },
  "Shan Aggarwal": {
    title: "Chief Business Officer, Coinbase", 
    bio: "Chief Business Officer at Coinbase, overseeing business strategy and operations."
  },
  "Jacob Horne": {
    title: "Co-Founder, Zora",
    bio: "Co-Founder of Zora, building tools for creators and communities onchain."
  },
  "Alexander Cutler": {
    title: "Co-Founder, Aerodrome",
    bio: "Co-Founder of Aerodrome, developing DeFi infrastructure on Base."
  },
  "Brianna Chang": {
    title: "Head of Product, Virtuals",
    bio: "Head of Product at Virtuals, working on virtual world and metaverse experiences."
  }
};

export const SCHEDULE_DATA = {
  sunday: {
    title: "Sunday 9/14 — Arrival Day",
    events: [
      "9:00 AM: Alpine Club Lounge Opens - Welcome to Stowe. For early arrivals, grab a seat, meet some friends, and settle in.",
      "2:00 PM: Basecamp Check-In - Drop your bags, pick up your field kit, and get ready for BaseCamp.",
      "6:00 PM: Welcome Reception - The official kickoff. Drinks, bites, and a chance to meet others building on Base.",
    ],
  },
  monday: {
    title: "Monday 9/15 — Day 1 (Full Programming)",
    events: [
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: State of Base w/ Jesse Pollak & Special Guests - BaseCamp kicks off with a look back on 2025 so far, a reminder of why we're here, and a path forward. Let's keep building in the open.",
      "10:00–10:20 AM: Fireside Chat - Jesse Pollak & Shan Aggarwal (Chief Business Officer, Coinbase) discuss the current state of the industry and what comes next.",
      "10:40–11:00 AM: Panel Discussion on Growth - Jesse Pollak, Alexander Cutler (Co-Founder, Aerodrome), Jacob Horne (Co-Founder, Zora), and Brianna Chang (Head of Product, Virtuals) share how they scaled their projects on Base. A conversation on choosing to build onchain, the unlocks that drove growth, and what they've learned that new builders can apply today.",
      "11:30 AM–12:15 PM: Workshops Round 1 - Base Builder Product Roadmap, Making Onchain Payments Work for Everyone, Arming the Trenches",
      "12:30–1:15 PM: Workshops Round 2 - Vibe Coding Cook Sesh, Base Ads Vision and Roadmap, Building Agents People Can't Stop Talking To, From Code to Content: How to Make a Viral Video", 
      "1:30–3:00 PM: Lunch",
      "7:00–9:00 PM: Communal Banquet",
    ],
    workshops: [
      "11:30 AM–12:15 PM: Base Builder Product Roadmap - A lightning round of product updates from the leads building the Base stack — Chain, Build, Ads, Account — followed by round table conversations about what's shipping next and how it all connects.",
      "11:30 AM–12:15 PM: Making Onchain Payments Work for Everyone - How tapping into the next-gen commerce stack helps creators, brands, and platforms cut out middlemen, lower fees, and find customers around the world.",
      "11:30 AM–12:15 PM: Arming the Trenches - The team behind o1 shares what it takes to support active traders and how to improve.",
      "12:30–1:15 PM: Vibe Coding Cook Sesh - Sit down with Base DevRel and your favorite vibe-coding tool to spin up a production-ready mini app or agent, no code required.",
      "12:30–1:15 PM: Base Ads Vision and Roadmap - Meet the Spindl team and learn how onchain ads can help you find the right users. Get a preview of the tools and products they're building to help projects grow sustainably on Base.",
      "12:30–1:15 PM: Building Agents People Can't Stop Talking To - Learn from XMTP and top builders on how to get the most out of AI agents. See what they enable, how to integrate them into your app, and what best practices are emerging as people grow accustomed to using them.",
      "12:30–1:15 PM: From Code to Content: How to Make a Viral Video - Boys Club breaks down what actually makes content spread. Learn how to edit, package, and distribute video in ways that build a brand and grow your audience.",
    ],
    dayActivities: [
      "7:00 AM: Yoga - Breathe deep, stretch it out. Morning and afternoon sessions taught by local instructors.",
      "8:00 AM: Guided Trail Running - Start the day with a casual, community-paced run through the nearby trails, focused on connection, momentum, and moving together.",
      "All Day: Tattoo Parlour - Choose from a selection of Basecamp inspired flash tattoos in our mini onsite tattoo parlor.",
      "All Day: Merch Trading Post",
      "11:00 AM–7:00 PM: Lawn Games",
      "11:00 AM–8:00 PM: Co-work & Co-create",
      "2:00–4:00 PM: Mushroom Lab - Forage with Spruce Peak's resident mushroom farmer Kevin, and resident chef Sean, to discover the edible secrets of the forest floor.",
      "2:00–3:00 PM: Yoga",
      "3:00–5:00 PM: Pickleball Tournament - A pickleball competition tracked with Bracky. All skill levels are welcome. Paddles and balls provided.",
      "5:00–6:30 PM: Whiskey Tasting - Savor a curated tasting led by WhistlePig, featuring the Farm Flight lineup: Farmstock, Campstock, and Homestate whiskeys.",
    ],
    nightActivities: [
      "9:00 PM: Night Hike - A guided walk under the stars. Move slowly and mindfully as you tune into the night's sights and sounds. Glow sticks will be provided.",
      "9:00–11:00 PM: Gaming - A blend of analog and digital gaming experiences, with both casual sessions and bracketed tournaments.",
      "9:00–10:30 PM: Whiskey Tasting - Savor a curated tasting led by WhistlePig, featuring the Farm Flight lineup: Farmstock, Campstock, and Homestate whiskeys.",
      "Varies: Karaoke - Who's ready to sing? Step up, cheer others on, and post these moments to the Base App.",
      "Varies: Poker - Texas Hold 'Em in the ballroom. Beginners to sharks, all are welcome.",
      "Varies: Village Green Fire Pits",
    ],
  },
  tuesday: {
    title: "Tuesday 9/16 — Day 2",
    events: [
      "8:00–10:00 AM: Breakfast",
      "10:00 AM: Jesse AMA - An open conversation with Jesse. Ask anything about Base, the ecosystem, or where we're heading.",
      "11:30 AM–12:15 PM: Workshops Round 3 - Mini Apps To Unlock The New Creator Era, Governance Roundtable: Aligning Incentives for the Onchain Economy, Let the Deals Flow: VC and Investment Landscape as Told by Investors",
      "12:30–1:15 PM: Workshops Round 4 - DeFi Deals: How to Bootstrap TVL on Base, The Base Network State, The Coining Stack: A Deep-Dive on Coining Mechanics",
      "1:30–3:00 PM: Lunch",
      "7:00 PM: Dinner: Food Truck Festival",
      "8:00 PM: Live Band Performance - Close out the day with a soundtrack under the stars.",
    ],
    workshops: [
      "11:30 AM–12:15 PM: Mini Apps To Unlock The New Creator Era - From livestreaming to IRL events to social, Base is for creators across every medium. A first look at creator-focused mini apps that make it easier to connect, earn, and grow onchain.",
      "11:30 AM–12:15 PM: Governance Roundtable: Aligning Incentives for the Onchain Economy - Explore new ways of building support with your community as we enter a new era of governance",
      "11:30 AM–12:15 PM: Let the Deals Flow: VC and Investment Landscape as Told by Investors - A workshop breaking down where capital is moving, what signals matter, and which narratives are already overhyped. Hear about what investors are excited to back next.",
      "12:30–1:15 PM: DeFi Deals: How to Bootstrap TVL on Base - A breakdown of three proven strategies to bootstrap liquidity: offchain deals, onchain incentives, and partnerships. Hear real examples and figure out which playbook fits your protocol",
      "12:30–1:15 PM: The Base Network State - Base's head of Global Builders on how we're shaping Base into a borderless, onchain society. A look at how Balaji's network state framework applies in practice, and the steps we're taking to get there.",
      "12:30–1:15 PM: The Coining Stack: A Deep-Dive on Coining Mechanics - Coining is emerging as a new engine for creator and trader value. Using real data and live examples from Zora, Paragraph, and more, this session maps out what's working, what isn't, and how others can lean in to push the space forward.",
    ],
    dayActivities: [
      "All Day: Tattoo Parlour - Choose from a selection of Basecamp inspired flash tattoos in our mini onsite tattoo parlor.",
      "All Day: Merch Trading Post",
      "11:00 AM–7:00 PM: Lawn Games",
      "11:00 AM–8:00 PM: Co-work & Co-create",
      "4:00–6:00 PM: Pickleball Tournament - A pickleball competition tracked with Bracky. All skill levels are welcome. Paddles and balls provided.",
    ],
    nightActivities: [
      "9:00–11:00 PM: Gaming - A blend of analog and digital gaming experiences, with both casual sessions and bracketed tournaments.",
      "Varies: Karaoke - Who's ready to sing? Step up, cheer others on, and post these moments to the Base App.",
      "Varies: Poker - Texas Hold 'Em in the ballroom. Beginners to sharks, all are welcome.",
      "Varies: Village Green Fire Pits",
    ],
  },
  wednesday: {
    title: "Wednesday 9/17 — Departure Day",
    events: [
      "5:00–10:00 AM: Breakfast",
    ],
  },
};

// Removed fetchBasecampScheduleDetails - using more specific tools instead

export const getFullSchedule = tool(
  async ({ day, query }: { day?: string; query?: string }) => { 
    console.log("🔄 Getting full schedule...", { day, query });
    
    // Check if this is an activity-specific question for the 4 group activities
    if (query) {
      const queryLower = query.toLowerCase();
      console.log("🔄 Activity question detected, sending Quick Actions...", queryLower);
      
      // Import centralized activity group functions
      const { hasGroupChat, generateActivityGroupQuickActions } = await import("./activityGroups.js");
      
      // Find matching activity
      const activities = ['yoga', 'running', 'pickleball', 'hiking', 'hike'];
      const activityKey = activities.find(activity => queryLower.includes(activity));
      
      if (activityKey && hasGroupChat(activityKey)) {
        // Find the activity in the schedule
        let foundActivity = '';
        
        // Search Monday activities
        const mondayData = SCHEDULE_DATA.monday as any;
        if (mondayData && mondayData.dayActivities) {
          const dayMatch = mondayData.dayActivities.find((item: string) => 
            item.toLowerCase().includes(activityKey)
          );
          if (dayMatch) foundActivity = dayMatch;
        }
        
        // Search Tuesday activities if not found
        if (!foundActivity) {
          const tuesdayData = SCHEDULE_DATA.tuesday as any;
          if (tuesdayData && tuesdayData.dayActivities) {
            const dayMatch = tuesdayData.dayActivities.find((item: string) => 
              item.toLowerCase().includes(activityKey)
            );
            if (dayMatch) foundActivity = dayMatch;
          }
        }
        
        if (foundActivity) {
          // Generate Quick Actions using centralized function
          const quickActions = generateActivityGroupQuickActions(activityKey, foundActivity);
          if (quickActions) {
            return JSON.stringify({
              contentType: "coinbase.com/actions:1.0",
              content: quickActions
            });
          }
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

export const getSpeakerInfo = tool(
  async ({ speakerName }: { speakerName: string }) => {
    console.log("🔄 Getting speaker info...", speakerName);
    
    const speaker = SPEAKERS_DATA[speakerName as keyof typeof SPEAKERS_DATA];
    
    if (!speaker) {
      return `Speaker "${speakerName}" not found. Available speakers: ${Object.keys(SPEAKERS_DATA).join(", ")}`;
    }
    
    return `${speakerName} - ${speaker.title}\n\n${speaker.bio}`;
  },
  {
    name: "GetSpeakerInfo",
    description: "Get information about a specific speaker at Basecamp 2025. Use when someone asks about speakers, their backgrounds, or who is presenting.",
    schema: z.object({
      speakerName: z.string().describe("The name of the speaker to get information about"),
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
  async ({ activity, day }: { activity: string; day?: string }) => {
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
      // Import centralized activity group functions
      const { hasGroupChat, generateActivityGroupQuickActions } = await import("./activityGroups.js");
      
      // Check if this activity has group chat functionality
      if (hasGroupChat(activityLower)) {
        // Generate Quick Actions using centralized function
        const quickActions = generateActivityGroupQuickActions(activityLower, foundActivity);
        if (quickActions) {
          return JSON.stringify({
            contentType: "coinbase.com/actions:1.0",
            content: quickActions
          });
        }
      }
      
      // Fallback to simple text response
      return `🎯 ${activity} schedule: ${foundActivity}`;
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
