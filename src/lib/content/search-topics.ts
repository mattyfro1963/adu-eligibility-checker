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
        href: "/regulations#county-guides",
      },
      {
        label: "Statewide ADU statute floor",
        href: "/regulations#overview",
      },
      {
        label: "Park models and THOW classification",
        href: "/regulations#park-models",
      },
    ],
    viewAllHref: "/regulations",
    viewAllLabel: "View all regulations",
  },
  {
    id: "sf-guides",
    title: "San Francisco guides",
    links: [
      {
        label: "THOW legality in San Francisco",
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
];
