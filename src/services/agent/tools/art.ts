import { tool } from "@langchain/core/tools";

const ARTISTS = [
  {
    name: "Display Driver",
    collection: "https://opensea.io/collection/on-my-mind-2025",
    description: "Digital artist known for generative and interactive works",
  },
  {
    name: "Mechsicko",
    collection: "https://opensea.io/mechsicko",
    description:
      "Contemporary digital artist exploring identity and technology",
  },
  {
    name: "Henlo",
    collection: "https://opensea.io/Henlo-Fren/created",
    description: "Emerging artist working with digital mediums",
  },
  {
    name: "Shuntr",
    collection: "https://x.com/madebyshun",
    description:
      "Digital artist exploring the intersection of art and blockchain",
  },
  {
    name: "Derrick Kempf",
    collection: "https://derrickkempf.com",
    description: "Contemporary artist working across multiple mediums",
  },
  {
    name: "BasedThanos",
    collection: "https://x.com/Maximill15",
    description: "Digital artist known for unique visual style",
  },
  {
    name: "KW",
    collection: "Not yet available",
    description: "Digital artist exploring new forms of expression",
  },
];

export const fetchArtShowTool = tool(
  () => {
    return `
  Art Show: Thursday 4:30–8:00 PM

Featuring: ${JSON.stringify(ARTISTS)}

Register: https://lu.ma/gibwsgx3 

Ask me about specific artists or their collections!`;
  },
  {
    name: "FetchArtShow",
    description:
      "Retrieves a complete list of art shows scheduled for the summit or hackathon, including detailed information about each participating artist.",
  },
);

export const fetchArtistDetailsTool = tool(
  () => {
    return `Art Show Artists:

• Display Driver - Generative & interactive works
• Mechsicko - Identity & technology exploration  
• Henlo - Emerging digital artist
• Shuntr - Art & blockchain intersection
• Derrick Kempf - Multi-medium contemporary
• BasedThanos - Unique visual style
• KW - New forms of expression

Ask me about a specific artist's collection or background!`;
  },
  {
    name: "FetchArtistDetails",
    description:
      "Provides a clean, simple list of artists participating in the art show with brief descriptions.",
  },
);
