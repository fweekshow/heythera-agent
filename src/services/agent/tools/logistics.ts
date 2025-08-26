import { tool } from "@langchain/core/tools";
import { VENUE_ADDRESS, VENUE_MAPS_URL, VENUE_NAME } from "@/constant.js";

export const fetchLogisticsDetails = tool(
  () => {
    return `Onchain Summit Logistics:

Venue: ${VENUE_NAME}
Address: ${VENUE_ADDRESS}

Nearby Hotels:
• W San Francisco - 181 3rd St, San Francisco, CA 94103
  Book: https://www.marriott.com/en-us/hotels/sfoww-w-san-francisco/ 

Getting Around:
• BART: Powell Street Station (2 blocks)
• Muni: Multiple lines serve the area
• Ride-share: Drop-off at venue entrance

Ask me about specific hotels or transportation options!`;
  },
  {
    name: "FetchLogisticsDetails",
    description:
      "Retrieves complete logistics details for the Onchain Summit, including venue, nearby hotels, and transportation options",
  },
);

export const fetchVenueDetails = tool(
  () => {
    return `Venue: ${VENUE_NAME}
Address: ${VENUE_ADDRESS}

The Howard SF is located in the heart of San Francisco's SoMa district, near Union Square and the Financial District.`;
  },
  {
    name: "FetchVenueDetails",
    description:
      "Provides the venue details for the Onchain Summit, including address and map link",
  },
);

export const fetchHotelsDetails = tool(
  () => {
    return `Nearby Hotels:

W San Francisco
• Address: 181 3rd St, San Francisco, CA 94103
• Distance: Across the street from venue
• Book: https://www.marriott.com/en-us/hotels/sfoww-w-san-francisco/ 

Other options within walking distance:
• Hotel Zeppelin - 545 Post St
• Hotel G - 386 Geary St
• The Marker - 501 Geary St`;
  },
  {
    name: "FetchHotelsDetails",
    description:
      "Provides nearby hotel recommendations and booking links for the Onchain Summit venue",
  },
);
