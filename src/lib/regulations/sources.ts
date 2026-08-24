/**
 * Canonical official URLs only. Catalog / statute pages — never Socrata
 * download endpoints. App and CI must not fetch these hosts.
 */

import type { SourceRef } from "@/lib/regulations/types";

export const SRC = {
  govChapter13: {
    label: "Gov. Code Chapter 13 (ADUs)",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?chapter=13&division=1.&lawCode=GOV&title=7.",
  },
  gov66314: {
    label: "Gov. Code § 66314",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66314",
  },
  gov66317: {
    label: "Gov. Code § 66317",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66317",
  },
  gov66321: {
    label: "Gov. Code § 66321",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66321",
  },
  gov66323: {
    label: "Gov. Code § 66323",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66323",
  },
  gov65852_21: {
    label: "Gov. Code § 65852.21",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=65852.21",
  },
  gov66411_7: {
    label: "Gov. Code § 66411.7",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66411.7",
  },
  gov66441_1: {
    label: "Gov. Code § 66441.1",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66441.1",
  },
  civ4751: {
    label: "Civil Code § 4751",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=4751",
  },
  civ4740: {
    label: "Civil Code § 4740",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=4740",
  },
  hcdAdu: {
    label: "HCD — Accessory Dwelling Units",
    href: "https://www.hcd.ca.gov/building-standards/adu",
  },
  hcdFactSheets2026: {
    label: "HCD Housing Law Fact Sheets 2026",
    href: "https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/housing-law-fact-sheets.pdf",
  },
  hcdSb9: {
    label: "HCD SB 9 Fact Sheet",
    href: "https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-9-fact-sheet.pdf",
  },
  hcdTinyHomesIb: {
    label: "HCD IB 2016-01 — Tiny Homes",
    href: "https://www.hcd.ca.gov/sites/default/files/docs/building-standards/ib-2016-01.pdf",
  },
  noahDwelling: {
    label: "NOAH Certified — Dwelling Standard",
    href: "https://noahcertified.org/noah-standard/dwelling/#c8",
  },
  rvia: {
    label: "RVIA — Standards & Certification",
    href: "https://www.rvia.org/",
  },
  waDotOversize: {
    label: "WSDOT — Oversize / Overweight Permits",
    href: "https://wsdot.wa.gov/travel/commercial-vehicles/commercial-vehicle-permits",
  },
  orDotOversize: {
    label: "ODOT — Over-Dimension Permits",
    href: "https://www.oregon.gov/odot/mct/pages/over-dimension.aspx",
  },
  caDotOversize: {
    label: "Caltrans — Oversize / Overweight Permits",
    href: "https://dot.ca.gov/programs/traffic-operations/transportation-permits",
  },
  cbscBulletin2601: {
    label: "CBSC Information Bulletin 26-01",
    href: "https://www.dgs.ca.gov/-/media/Divisions/BSC/06-News/Information-Bulletins/2026/BSC-Information-Bulletin-26-01-Errata.pdf",
  },
  datasfZoning: {
    label: "DataSF — Zoning Districts (3i4a-hu95)",
    href: "https://data.sfgov.org/d/3i4a-hu95",
  },
  sfPim: {
    label: "SF Property Information Map",
    href: "https://sfplanninggis.org/pim/",
  },
  sfPlanningAdu: {
    label: "SF Planning — Accessory Dwelling Units",
    href: "https://sfplanning.org/accessory-dwelling-units",
  },
  sfDbi: {
    label: "SF Department of Building Inspection",
    href: "https://sf.gov/departments/department-building-inspection",
  },
  sfPlanning: {
    label: "SF Planning Department",
    href: "https://sfplanning.org/",
  },
} as const satisfies Record<string, SourceRef>;

/** One entry per href — claim arrays may repeat the same official source. */
export function uniqueSourceRefs(sources: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.href)) return false;
    seen.add(source.href);
    return true;
  });
}
