/**
 * Premium downloadable tools catalog for /premium.
 * Display-only pricing; checkout and file hosting are not wired yet.
 * Zero React.
 */

export type PremiumToolIcon = "checklist" | "mail" | "spreadsheet";

export interface PremiumTool {
  id: string;
  title: string;
  description: string;
  format: string;
  priceLabel: string;
  includes: string[];
  icon: PremiumToolIcon;
}

export const PREMIUM_TOOLS_INTRO = {
  eyebrow: "Downloadable tools",
  title: "Premium tools for parcel decisions",
  subtitle:
    "Practical checklists, outreach templates, and budgeting sheets for homeowners, investors, and developers navigating California ADU and SB 9 projects.",
  honestyNote:
    "These tools are forthcoming downloadables with suggested prices shown for planning only. Join the waitlist to be notified when checkout opens — no payment is collected on this page, and nothing here is legal advice.",
} as const;

export const PREMIUM_TOOLS: PremiumTool[] = [
  {
    id: "site-planning-checklist",
    title: "Site planning checklist",
    description:
      "A step-by-step PDF checklist to walk a parcel from first site notes through overlay awareness before you talk to planning staff or a designer.",
    format: "PDF checklist",
    priceLabel: "$29",
    icon: "checklist",
    includes: [
      "Lot constraints and access worksheet",
      "Overlay and setback prompt list",
      "Pre-meeting questions for planning / building",
      "Printable one-page field form",
    ],
  },
  {
    id: "zoning-outreach-templates",
    title: "Zoning outreach email templates",
    description:
      "A doc pack of concise, professional emails for contacting planning departments, HOAs, and consultants — without inventing legal conclusions.",
    format: "Doc pack",
    priceLabel: "$19",
    icon: "mail",
    includes: [
      "Planning inquiry templates",
      "Follow-up and clarification scripts",
      "HOA / neighbor notice starters",
      "Consultant scoping request outline",
    ],
  },
  {
    id: "adu-budgeting-spreadsheet",
    title: "ADU budgeting spreadsheet",
    description:
      "A structured spreadsheet to model soft costs, hard costs, and contingency bands for ADU or tiny-home pathways so you can compare options before committing.",
    format: "Spreadsheet",
    priceLabel: "$39",
    icon: "spreadsheet",
    includes: [
      "Soft vs hard cost categories",
      "Contingency and fee placeholders",
      "Scenario comparison columns",
      "Notes fields for local fee research",
    ],
  },
];

export function getPremiumToolById(id: string): PremiumTool | undefined {
  return PREMIUM_TOOLS.find((tool) => tool.id === id);
}
