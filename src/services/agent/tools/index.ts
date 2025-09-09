// Removed broadcast tool - using simple function instead
import { fetchBasecampInfo } from "./logistics.js";
import { 
  setReminder, 
  fetchAllPendingReminders, 
  cancelPendingReminder,
  cancelAllReminders,
  fetchCurrentDateTime 
} from "./reminder.js";
import { 
  fetchBasecampScheduleDetails, 
  getSpecificDaySchedule,
  getDayActivities,
  getNightActivities,
  getActivityTime
} from "./schedule.js";
import { sendWelcomeMessage, showHelp } from "./welcome.js";

export const DEFAULT_TOOLS = [
  // Welcome and help tools
  sendWelcomeMessage,
  showHelp,
  
  // Schedule tools
  fetchBasecampScheduleDetails,
  getSpecificDaySchedule,
  getDayActivities,
  getNightActivities,
  getActivityTime,
  
  // Basecamp info
  fetchBasecampInfo,
  
  // Reminder tools
  fetchCurrentDateTime,
  setReminder,
  fetchAllPendingReminders,
  cancelPendingReminder,
  cancelAllReminders,
  
  // Broadcast tools removed - using direct function call
];