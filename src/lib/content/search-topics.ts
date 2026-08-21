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
    id: "adu",
    title: "ADU & tiny homes",
    links: [
      {
        label: "County requirements by address",
        href: "/regulations",
      },
      {
        label: "THOW vs foundation pathways",
        href: "/guides/wheels-vs-foundation",
      },
      {
        label: "Statewide ADU statute floor",
        href: "/regulations",
      },
    ],
    viewAllHref: "/regulations",
    viewAllLabel: "View all regulations",
  },
  {
    id: "sb9",
    title: "SB 9 & zoning",
    links: [
      {
        label: "Single-family district requirements",
        href: "/regulations",
      },
      {
        label: "Fire and historic overlay warnings",
        href: "/regulations",
      },
      {
        label: "San Francisco lot GIS coverage",
        href: "/",
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
        label: "Application checklist after search",
        href: "/",
      },
      {
        label: "Connect with a specialist",
        href: "/#connect",
      },
      {
        label: "Partner build-out resources",
        href: "/partners",
      },
    ],
    viewAllHref: "/#connect",
    viewAllLabel: "View connect",
  },
];
