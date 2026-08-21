/** Shared navigation — zero React. Search engine is primary; all else is secondary. */

export type SiteNavItem = {
  href: string;
  label: string;
  /** Compact header label on small screens when `label` is long. */
  shortLabel?: string;
  description?: string;
};

/** Footer-only resource links — subordinate to the checker engine. */
export const RESOURCE_NAV: SiteNavItem[] = [
  {
    href: "/guides",
    label: "Guides",
    description: "SF technical buyer guides",
  },
  {
    href: "/regulations",
    label: "Regulations",
    shortLabel: "Regs",
    description: "Statewide tiny-home context",
  },
  {
    href: "/partners",
    label: "Partners",
    description: "Build-out & affiliate resources",
  },
  {
    href: "/premium",
    label: "Premium",
    description: "Downloadable planning tools",
  },
  {
    href: "/",
    label: "Connect",
    description: "Search an address first, then request a builder intro",
  },
];

/** Compact header links — checker home is the wordmark, not a duplicate nav item. */
export const HEADER_NAV: SiteNavItem[] = RESOURCE_NAV.filter(
  (item) => item.href !== "/",
);

/** @deprecated Use RESOURCE_NAV — kept for any lingering imports during migration. */
export const PRIMARY_NAV: SiteNavItem[] = [
  { href: "/", label: "Checker", description: "ADU & SB 9 parcel eligibility" },
  ...RESOURCE_NAV,
];

export const SECONDARY_NAV: SiteNavItem[] = [];

export const FOOTER_NAV: SiteNavItem[] = RESOURCE_NAV;

export function isActiveNavPath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isEngineRoute(pathname: string): boolean {
  return pathname === "/";
}
