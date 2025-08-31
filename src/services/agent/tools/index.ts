import { fetchBasecampInfo } from "./logistics.js";
import { 
  setReminder, 
  fetchAllPendingReminders, 
  cancelPendingReminder,
  cancelAllReminders,
  fetchCurrentDateTime 
} from "./reminder.js";
import { fetchBasecampScheduleDetails, getSpecificDaySchedule } from "./schedule.js";
import { sendWelcomeMessage, showHelp } from "./welcome.js";

export const DEFAULT_TOOLS = [
  // Welcome and help tools
  sendWelcomeMessage,
  showHelp,
  
  // Schedule tools
  fetchBasecampScheduleDetails,
  getSpecificDaySchedule,
  
  // Basecamp info
  fetchBasecampInfo,
  
  // Reminder tools
  fetchCurrentDateTime,
  setReminder,
  fetchAllPendingReminders,
  cancelPendingReminder,
  cancelAllReminders,
];
