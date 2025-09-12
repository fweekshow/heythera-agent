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

export const STAFF_WALLETS = [
  "0x22209CFC1397832f32160239C902B10A624cAB1A".toLowerCase(), // Mateo
  "0x80245b9C0d2Ef322F2554922cA86Cf211a24047F".toLowerCase(), // Claudia
  "0x40680ECd7e33653A2456bCbAE92DFC9dF2C67304".toLowerCase(), // Aneri
  "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9".toLowerCase(), // Jesse
  "0xe88334fB1ACDc9eBDBcA530ce29e1a2DE42903c2".toLowerCase(), // John
  "0x14D23FF0CB6A59F8CF3B389ca94BEf75c69a68e7".toLowerCase(), // Chintan
  "0xf732FcD2C9C1Ca16F68a914401614869d39cA9d1".toLowerCase(), // Alex Chen
  "0x605807906157A721669bAC96B64851CBdF64804B".toLowerCase(), // Ryan M
  "0xBC3F713b37810538C191bA5dDf32D971EE643dDA".toLowerCase(), // Sarah W
];

// Group-related keywords for activity detection and group joining
export const GROUP_KEYWORDS = [
  // Physical Activities
  "yoga",
  "pickleball", 
  "hiking",
  "running",
  
  // Workshop Sessions
  "builder",
  "payments", 
  "trenches",
  "coding",
  "ads",
  "agents",
  "video",
  "roast",
  "mini app",
  "governance",
  "deals",
  "defi",
  "network",
  "coining",
  "students"
];

// export const AUTHORIZED_BASENAMES = [
//     "0xteo.base.eth",
//     "claudia.base.eth",
//     "jesse.base.eth",
//     "medusaxenon.base.eth",
//     "kaelis.base.eth"
//     // Add more basenames here for additional authorized users
//     // "alice.base.eth",
//     // "bob.base.eth",
//   ];