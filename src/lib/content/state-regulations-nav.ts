/** Shared links to published-state regulations pages — zero React. */

export const STATE_REGULATION_LINKS = [
  {
    label: "California",
    href: "/regulations/california",
    code: "CA",
  },
  {
    label: "Oregon",
    href: "/regulations/oregon",
    code: "OR",
  },
  {
    label: "Washington",
    href: "/regulations/washington",
    code: "WA",
  },
] as const;

export type StateRegulationLink = (typeof STATE_REGULATION_LINKS)[number];
