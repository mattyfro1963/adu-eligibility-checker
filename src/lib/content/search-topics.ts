/** Idle search topic cards — zero React. Revolut help-center pattern. */

export type SearchTopicLink = {
  label: string;
  href: string;
};

export type SearchTopicCard = {
  id: string;
  title: string;
  links: SearchTopicLink[];
  viewAllHref: string;
  viewAllLabel?: string;
};

export const SEARCH_TOPIC_CARDS: SearchTopicCard[] = [
  {
    id: "thow",
    title: "THOW & park models",
    links: [
      {
        label: "County requirements by address",
        href: "/regulations#county-guides",
      },
      {
        label: "Certification & size expectations",
        href: "/regulations#park-models",
      },
      {
        label: "Optional ADU pathway (not automatic)",
        href: "/regulations#overview",
      },
    ],
    viewAllHref: "/regulations",
    viewAllLabel: "View all regulations",
  },
  {
    id: "location-guides",
    title: "Location-based guides",
    links: [
      {
        label: "THOW legality",
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
