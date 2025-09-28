// Individual reminders removed - only organizer broadcast reminders are used
import { fetchRedDoorInfo } from "./logistics.js";
import { 
  getFullSchedule,
  getFacilitatorInfo,
  getSpecificDaySchedule,
  getActivityTime
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
  getFacilitatorInfo,
  getSpecificDaySchedule,
  getActivityTime,
  
  // Red Door Life Group info
  fetchRedDoorInfo,
  
  // Individual reminder tools removed - only organizer broadcast reminders are used
  // Broadcast tools removed - using direct function call
];