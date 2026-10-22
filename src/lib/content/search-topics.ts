/** Idle search topic cards — zero React. Revolut help-center pattern. */

export type SearchTopicLink = {
  label: string;
  href: string;
};

/** Lucide icon keys resolved in SearchTopicCards (lib stays React-free). */
export type SearchTopicIcon =
  "house" | "book-open" | "clipboard-list" | "sparkles";

export type SearchTopicCard = {
  id: string;
  title: string;
  icon: SearchTopicIcon;
  links: SearchTopicLink[];
  viewAllHref: string;
  viewAllLabel?: string;
};

export const SEARCH_TOPIC_CARDS: SearchTopicCard[] = [
  {
    id: "thow",
    title: "THOW & park models",
    icon: "house",
    links: [
      {
        label: "California county guides",
        href: "/regulations/california#county-guides",
      },
      {
        label: "Oregon THOW / park-model context",
        href: "/regulations/oregon",
      },
      {
        label: "Washington L&I / park trailer context",
        href: "/regulations/washington",
      },
    ],
    viewAllHref: "/regulations",
    viewAllLabel: "View regulations hub",
  },
  {
    id: "location-guides",
    title: "Location-based guides",
    icon: "book-open",
    links: [
      {
        label: "SF THOW legality",
        href: "/guides/tiny-home-on-wheels-san-francisco",
      },
      {
        label: "Tiny-home cost matrix",
        href: "/guides/tiny-home-cost-matrix",
      },
      {
        label: "Financing wheels vs foundation",
        href: "/guides/wheels-vs-foundation",
      },
    ],
    viewAllHref: "/guides",
    viewAllLabel: "View all guides",
  },
  {
    id: "next-steps",
    title: "Permits & next steps",
    icon: "clipboard-list",
    links: [
      {
        label: "Partner build-out resources",
        href: "/partners",
      },
      {
        label: "Premium planning tools",
        href: "/premium",
      },
      {
        label: "Search an address, then request a builder intro",
        href: "/",
      },
    ],
    viewAllHref: "/partners",
    viewAllLabel: "View partners",
  },
  {
    id: "premium",
    title: "Premium tools",
    icon: "sparkles",
    links: [
      {
        label: "Site planning checklist",
        href: "/premium#site-planning-checklist",
      },
      {
        label: "Zoning outreach templates",
        href: "/premium#zoning-outreach-templates",
      },
      {
        label: "ADU budgeting spreadsheet",
        href: "/premium#adu-budgeting-spreadsheet",
      },
    ],
    viewAllHref: "/premium",
    viewAllLabel: "View all premium tools",
  },
];
