import { fetchLogisticsDetails, fetchVenueDetails, fetchHotelsDetails } from "./logistics.js";
import { addReminder, listReminders, deleteReminder } from "./reminder.js";
import { fetchScheduleDetails, fetchDaySchedule } from "./schedule.js";

export const DEFAULT_TOOLS = [
  // Schedule tools
  fetchScheduleDetails,
  fetchDaySchedule,
  
  // Logistics tools
  fetchLogisticsDetails,
  fetchVenueDetails,
  fetchHotelsDetails,
  
  // Reminder tools
  addReminder,
  listReminders,
  deleteReminder,
];
