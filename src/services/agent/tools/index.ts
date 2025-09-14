// Individual reminders removed - only organizer broadcast reminders are used
import { fetchBasecampInfo } from "./logistics.js";
import { 
  getFullSchedule,
  getSpeakerInfo
} from "./schedule.js";
import { sendWelcomeMessage, showHelp } from "./welcome.js";
// COMMENTED OUT FOR LOCAL TESTING - UNCOMMENT FOR RAILWAY DEPLOYMENT
// import { setupAutomaticBroadcastReminders } from "./autoReminders.js";

export const DEFAULT_TOOLS = [
  // Welcome and help tools
  sendWelcomeMessage,
  showHelp,
  
  // Schedule tools  
  getFullSchedule,
  getSpeakerInfo,
  
  // Basecamp info
  fetchBasecampInfo,
  
  // Individual reminder tools removed - only organizer broadcast reminders are used
  // Broadcast tools removed - using direct function call
];