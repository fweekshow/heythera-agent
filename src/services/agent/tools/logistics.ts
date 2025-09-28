import { tool } from "@langchain/core/tools";
import { RED_DOOR_URL } from "@/constant.js";

export const fetchRedDoorInfo = tool(
  () => {
    return `Red Door Life Information:

🏥 ABOUT RED DOOR LIFE:
Founded in 2005 to improve recovery outcomes for people suffering from substance use disorders and mental health issues. We've redesigned our model of care to be a partnership between clients and their professional advisors and clinicians.

📞 CONTACT INFORMATION:
• Phone: 424.242.2760
• Fax: 323.870.8200
• Email: info@reddoor.life
• Website: https://www.reddoor.life

🌟 OUR APPROACH:
• Flexible lengths of care (not the typical 30/60/90-day "car wash" model)
• Partnership-based recovery journey
• Continual learning between client and team
• Engaging groups, activities, and adventures
• Integration of recovery into chosen lifestyle

🏛️ SERVICES OFFERED:
• Residential Services & Detoxification
• IOP/Outpatient & Telehealth
• Sober Companions & At Home Services
• Family Program & Wellness Retreats

🎯 SPECIALIZED TREATMENT APPROACHES:
• The 12 Dimensions Program
• Trauma Informed Care
• Client Advocate System
• Medication Assisted Treatment
• Harm Reduction & Community Focus

📜 LICENSING & ACCREDITATION:
• Licensed by California Department of Health Care Services
• Accredited by Joint Commission (Gold Seal of Approval)
• Educated by American Society of Addiction Medicine
• 501(c)(3) Non-Profit Public Charity

For more information, visit https://www.reddoor.life/about`;
  },
  {
    name: "FetchRedDoorInfo",
    description:
      "Provides comprehensive information about Red Door Life treatment center, services, and contact details based on their official website",
  },
);
