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
  waWacPilotEscort: {
    label: "WAC 468-38-100 — Pilot / escort vehicle requirements",
    href: "https://app.leg.wa.gov/WAC/default.aspx?cite=468-38-100",
  },
  waDotPermitForm560002: {
    label: "WSDOT Form 560-002 — Oversize / overweight permit conditions",
    href: "https://wsdot.wa.gov/publications/fulltext/forms/560-002.PDF",
  },
  waWacParkTrailer: {
    label: "WAC 296-150P — Recreational park trailers",
    href: "https://app.leg.wa.gov/wac/default.aspx?cite=296-150p&full=true",
  },
  waLniFasLaws: {
    label: "WA L&I — Manufactured / modular laws & rules",
    href: "https://lni.wa.gov/licensing-permits/manufactured-modular-mobile-structures/laws-rules",
  },
  waLniModularPortal: {
    label: "WA L&I — Modular & other mobile structures",
    href: "https://lni.wa.gov/licensing-permits/manufactured-modular-mobile-structures/modular-other-mobile-structures/",
  },
  orDotOversize: {
    label: "ODOT — Over-Dimension Permits",
    href: "https://www.oregon.gov/odot/mct/pages/over-dimension.aspx",
  },
  orDotLegalDims: {
    label: "ODOT — Legal vehicle dimensions",
    href: "https://www.oregon.gov/odot/mct/pages/legal-vehicle-dimensions.aspx",
  },
  orDotOverDimOps: {
    label: "ODOT — Over-Dimension Operations",
    href: "https://www.oregon.gov/odot/MCT/Pages/Over-Dimension-Operations-Oregon.aspx",
  },
  orDotPermittableTables: {
    label: "ODOT — Permittable dimensions & weight tables",
    href: "https://www.oregon.gov/odot/mct/pages/permittable-vehicle-dimensions-weight-tables.aspx",
  },
  orOarPilotVehicles: {
    label: "OAR 734-078-0035 — Pilot vehicles",
    href: "https://secure.sos.state.or.us/oard/viewSingleRule.action?ruleVrsnRsn=322439",
  },
  orDotPilotGuide: {
    label: "ODOT — Pilot car operations guide (PDF)",
    href: "https://www.oregon.gov/odot/MCT/Documents/pilotcarguide.pdf",
  },
  caDotOversize: {
    label: "Caltrans — Oversize / Overweight Permits",
    href: "https://dot.ca.gov/programs/traffic-operations/transportation-permits",
  },
  caCvc35100: {
    label: "Vehicle Code § 35100 — Width limit",
    href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=35100",
  },
  caDotVehicleWidths: {
    label: "Caltrans — Legal vehicle widths",
    href: "https://dot.ca.gov/programs/traffic-operations/legal-truck-access/vehicle-widths",
  },
  caDotPilotCarMaps: {
    label: "Caltrans — Single Trip Pilot Car Maps",
    href: "https://dot.ca.gov/programs/traffic-operations/transportation-permits/stpcmaps",
  },
  caDotTpmCh5: {
    label: "Caltrans TPM Ch. 5 — Routing & safety (PDF)",
    href: "https://dot.ca.gov/-/media/dot-media/programs/traffic-operations/documents/transportation-permits/tpm/2024-cvo-transportation-permits-manual-chapter-5-a11y.pdf",
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
