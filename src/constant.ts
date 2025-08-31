import { DateTime } from "luxon";

// Note: Venue details not yet announced on official website

// URLs and handles
export const BASECAMP_URL = "https://www.basecamp2025.xyz";
export const X_HANDLE = "@base";

// Timezone - Using Eastern Time as default (can be auto-detected)
export const EVENT_TZ = "America/New_York";

//Default Reply
export const DEFAULT_REPLY =
  "Oops! I didn't understand your query. Could you please rephrase or provide more details?😅";

// Event dates (September 14-16, 2025)
export const EVENT_DATES = {
  sunday: DateTime.fromObject(
    { year: 2025, month: 9, day: 14 },
    { zone: EVENT_TZ },
  ),
  monday: DateTime.fromObject(
    { year: 2025, month: 9, day: 15 },
    { zone: EVENT_TZ },
  ),
  tuesday: DateTime.fromObject(
    { year: 2025, month: 9, day: 16 },
    { zone: EVENT_TZ },
  ),
};

// Helper function to get current event timezone date
export const eventDate = () => DateTime.now().setZone(EVENT_TZ);

// Helper function to get event date for a day
export const eventDateFor = (day: string) => {
  const normalized = day.toLowerCase().replace(/[^a-z]/g, "");
  return EVENT_DATES[normalized as keyof typeof EVENT_DATES];
};
