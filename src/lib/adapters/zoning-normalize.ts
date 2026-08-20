/**
 * Map vendor zoning strings → engine-friendly codes.
 * Keep in adapters — rules still branch on residential vs commercial prefixes.
 */

/**
 * Normalize a vendor district code so SF-tuned R-/RH-/C- checks stay valid
 * for common LA / Oakland / Regrid labels without changing the rules engine.
 */
export function normalizeVendorZoningCode(
  raw: string,
  provider: "sf-datasf" | "regrid" | "open-data",
): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  // SF DataSF already uses engine-friendly codes (RH-1, C-2, …).
  if (provider === "sf-datasf") {
    return trimmed;
  }

  const upper = trimmed.toUpperCase();

  // Common residential tokens from parcel APIs / open data.
  if (
    /\b(SINGLE[\s-]?FAMILY|R-?1|RS|RH|RL|RESIDENTIAL)\b/.test(upper) &&
    !/\b(COMMERCIAL|INDUSTRIAL|C-?\d|M-?\d)\b/.test(upper)
  ) {
    if (upper.includes("RH") || /\bRH-?\d/.test(upper)) {
      return (
        upper.match(/RH-?\d[A-Z()]*/)?.[0]?.replace(/^(RH)(\d)/, "RH-$2") ??
        "RH-1"
      );
    }
    if (/\bR-?1\b/.test(upper) || /\bRS\b/.test(upper)) {
      return "R-1";
    }
    return "R-1";
  }

  if (/\b(COMMERCIAL|C-?\d|NC-?\d|BUSINESS)\b/.test(upper)) {
    if (/\bC-?2\b/.test(upper)) return "C-2";
    if (/\bC-?3\b/.test(upper)) return "C-3";
    if (/\bC-?1\b/.test(upper)) return "C-1";
    return "C-2";
  }

  if (/\b(INDUSTRIAL|M-?\d|PDR|MANUFACTURING)\b/.test(upper)) {
    return "M-1";
  }

  return trimmed;
}
