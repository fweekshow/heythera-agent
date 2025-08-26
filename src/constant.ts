import { DateTime } from "luxon";

// Venue and location
export const VENUE_NAME = "The Howard SF";
export const VENUE_ADDRESS = "661 Howard St, San Francisco, CA 94105";
export const VENUE_MAPS_URL =
  "https://maps.google.com/?q=661+Howard+St,+San+Francisco,+CA+94105";

// URLs and handles
export const SUMMIT_URL = "https://www.onchainsummit.io";
export const TICKETS_URL = "https://payindimes.com/events/1/tickets";
export const X_HANDLE = "@onchainsf";

// Timezone
export const SF_TZ = "America/Los_Angeles";

//Default Reply
export const DEFAULT_REPLY =
  "Oops! I didn’t understand your query. Could you please rephrase or provide more details?😅";

// Event dates (August 20-24, 2025)
export const EVENT_DATES = {
  wednesday: DateTime.fromObject(
    { year: 2025, month: 8, day: 20 },
    { zone: SF_TZ },
  ),
  thursday: DateTime.fromObject(
    { year: 2025, month: 8, day: 21 },
    { zone: SF_TZ },
  ),
  friday: DateTime.fromObject(
    { year: 2025, month: 8, day: 22 },
    { zone: SF_TZ },
  ),
  saturday: DateTime.fromObject(
    { year: 2025, month: 8, day: 23 },
    { zone: SF_TZ },
  ),
  sunday: DateTime.fromObject(
    { year: 2025, month: 8, day: 24 },
    { zone: SF_TZ },
  ),
};

// Helper function to get current SF date
export const sfDate = () => DateTime.now().setZone(SF_TZ);

// Helper function to get event date for a day
export const eventDateFor = (day: string) => {
  const normalized = day.toLowerCase().replace(/[^a-z]/g, "");
  return EVENT_DATES[normalized as keyof typeof EVENT_DATES];
};
