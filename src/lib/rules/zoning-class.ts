/**
 * District classifiers shared by ADU / SB 9 engines and statutory checklists.
 * Pattern-match on published district codes — never address strings.
 */

function normalizeZoning(zoning: string): string {
  return zoning.trim().toUpperCase();
}

/** Gov. Code § 65852.21 — lots zoned for single-family dwellings. */
export function isSingleFamilyZoning(zoning: string): boolean {
  const z = normalizeZoning(zoning);
  if (z === "R-1" || z === "RS" || z === "RH-1") return true;
  return z.startsWith("R-1") || z.startsWith("RH-1");
}

/**
 * Mixed-use districts that still allow residential dwellings.
 * Chapter 13 ministerial ADU rights attach here; SB 9 generally does not.
 */
export function isMixedUseZoning(zoning: string): boolean {
  const z = normalizeZoning(zoning);
  return (
    z.startsWith("NCT") ||
    z.startsWith("NC-") ||
    z.startsWith("NCD") ||
    z.startsWith("CMU") ||
    z.startsWith("WMU") ||
    z.startsWith("MUO") ||
    z.startsWith("MUG") ||
    z.startsWith("MUR") ||
    z.startsWith("UMU") ||
    z.startsWith("RTO") ||
    z.startsWith("RC-") ||
    z === "RED" ||
    z.startsWith("RED-")
  );
}

function isCommercialOrIndustrialZoning(zoning: string): boolean {
  const z = normalizeZoning(zoning);
  if (
    z === "C-1" ||
    z === "C-2" ||
    z === "C-3" ||
    z === "M-1" ||
    z === "M-2" ||
    z === "PDR"
  ) {
    return true;
  }
  return z.startsWith("C-3-") || z.startsWith("PDR-");
}

/**
 * Whether Chapter 13 ministerial ADU rights can attach: residential or
 * mixed-use districts, not commercial- or industrial-only sites.
 */
export function isResidentialZoning(zoning: string): boolean {
  if (isCommercialOrIndustrialZoning(zoning)) return false;
  const z = normalizeZoning(zoning);
  if (z === "RS" || z === "RH") return true;
  if (z.startsWith("R-") || z.startsWith("RM") || z.startsWith("RH-")) {
    return true;
  }
  return isMixedUseZoning(zoning);
}
