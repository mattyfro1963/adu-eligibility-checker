/**
 * Local THOW / park-model / RV / movable tiny-home placement path.
 * Generic CA ADU floor alone does NOT green placement.
 */

import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim } from "@/lib/regulations/types";
import type {
  EligibilityResult,
  EligibilityStatus,
  Parcel,
} from "@/lib/types/zoning";
import { isResidentialZoning } from "@/lib/rules/zoning-class";

const PLACE_SOURCES = [
  SRC.hcdTinyHomesIb,
  SRC.hcdAdu,
  SRC.govChapter13,
] as const;

export type PlacementContext = {
  /** When true, lot GIS / verified overlays support express tiny-home path. */
  expressLocalPath?: boolean;
  /** Authored jurisdiction note signals express THOW/PMRV/RV path. */
  jurisdictionExpressPath?: boolean;
  /** Explicit local ban or occupancy prohibition from corpus. */
  explicitBan?: boolean;
  /** Coverage is jurisdiction-only (no lot district). */
  jurisdictionFallback?: boolean;
};

/** Affirmative stance verbs for express wheeled-path inference. */
const EXPRESS_AFFIRMATIVE =
  /\b(expressly|allows|allowed|permitted|welcomed|workable|favorable)\b/gi;

/**
 * Wheeled placement keywords — plurals and “tiny house(s) on wheels”.
 * Omit bare “movable/moveable tiny” (often ADU-conversion copy, not wheels-on
 * occupancy) so “allows ADUs … movable tiny houses as ADUs” does not green.
 */
const EXPRESS_WHEELED =
  /\b(thows?|tiny homes? on wheels|tiny houses? on wheels|park[- ]models?|pmrv|rv parks?|recreational vehicles?)\b/gi;

/** Max chars between affirmative and wheeled keyword (same-sentence proximity). */
const EXPRESS_PROXIMITY_CHARS = 80;

/**
 * True when wheeled language is framed as not allowed / not permanent /
 * foundation-required (not an express wheels-on occupancy path).
 */
function hasWheeledPathNegation(text: string): boolean {
  return (
    /\b(thows?|park[- ]models?|recreational vehicles?|tiny homes? on wheels|tiny houses? on wheels).{0,48}(not allowed|not permitted|prohibited|not (?:a )?permanent)\b/.test(
      text,
    ) ||
    /\b(not allowed|not permitted|prohibited|not (?:a )?permanent).{0,48}(thows?|park[- ]models?|recreational vehicles?|tiny homes? on wheels|tiny houses? on wheels)\b/.test(
      text,
    ) ||
    /\b(park[- ]models?|thows?|wheeled units?).{0,72}permanent foundation\b/.test(
      text,
    ) ||
    /\bpermanent foundation.{0,72}(park[- ]models?|thows?|wheeled units?)\b/.test(
      text,
    )
  );
}

/**
 * True when any affirmative match and wheeled match overlap within ±window.
 */
function hasProximateKeywordPair(
  text: string,
  left: RegExp,
  right: RegExp,
  windowChars: number,
): boolean {
  const leftHits: Array<{ start: number; end: number }> = [];
  const rightHits: Array<{ start: number; end: number }> = [];
  left.lastIndex = 0;
  right.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = left.exec(text)) !== null) {
    leftHits.push({ start: m.index, end: m.index + m[0].length });
  }
  while ((m = right.exec(text)) !== null) {
    rightHits.push({ start: m.index, end: m.index + m[0].length });
  }
  for (const a of leftHits) {
    for (const b of rightHits) {
      const gap =
        a.end <= b.start
          ? b.start - a.end
          : b.end <= a.start
            ? a.start - b.end
            : 0;
      if (gap <= windowChars) return true;
    }
  }
  return false;
}

/**
 * Infer whether jurisdiction note text describes an express wheeled path.
 * Conservative: affirmative + wheeled keywords must sit within ~80 chars
 * so “allows ADUs” + distant “THOW” (e.g. Long Beach) does not false-positive.
 */
export function inferExpressThowPathFromText(text: string): boolean {
  const t = text.toLowerCase();
  if (
    /\b(not permitted|prohibited|ban thow|prohibit thow|does not allow)\b/.test(
      t,
    )
  ) {
    return false;
  }
  if (hasWheeledPathNegation(t)) {
    return false;
  }
  return hasProximateKeywordPair(
    t,
    EXPRESS_AFFIRMATIVE,
    EXPRESS_WHEELED,
    EXPRESS_PROXIMITY_CHARS,
  );
}

export function inferPlacementBanFromText(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(not permitted|prohibited entirely|ban tiny|does not allow tiny homes)\b/.test(
      t,
    ) ||
    /\b(occupancy prohibited|no permanent occupancy|undeveloped lot.{0,40}primary dwelling)\b/.test(
      t,
    )
  );
}

/**
 * Placement gate for wheeled THOW / park model / RV-class units.
 */
export function evaluatePlacement(
  parcel: Parcel | null,
  context: PlacementContext = {},
): EligibilityResult {
  const reasons: CitedClaim[] = [];

  if (context.explicitBan) {
    return {
      status: "restricted",
      reasons: [
        {
          text: "Local guidance indicates tiny-home / THOW occupancy or placement is prohibited or not permitted. Treat this lot as a weak THOW candidate unless Planning provides a written approval path.",
          sources: [...PLACE_SOURCES],
        },
      ],
    };
  }

  if (parcel && !isResidentialZoning(parcel.zoning)) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Zoning ${parcel.zoning} is not a residential or mixed-use district. Wheeled tiny-home / park-model placement typically has no clear path on commercial- or industrial-only sites — confirm any special RV park or temporary-use exception in writing.`,
          sources: [...PLACE_SOURCES],
        },
      ],
    };
  }

  const express =
    context.expressLocalPath === true ||
    context.jurisdictionExpressPath === true ||
    (parcel?.overlaysVerified === true &&
      parcel.overlays.tinyHomeFriendly === true);

  if (express) {
    reasons.push({
      text: "Local facts or published guidance support an express THOW / park-model / RV / movable tiny-home placement path. This is not an automatic ADU approval — confirm utility hookups, occupancy duration, and permits with Planning/Building before delivery.",
      sources: [...PLACE_SOURCES],
    });
  } else if (context.jurisdictionFallback || !parcel) {
    reasons.push({
      text: "Lot-level zoning was not verified, and no express local THOW / park-model / RV path was confirmed from published guidance. State ADU law alone does not green-light wheeled placement — confirm classification with Planning/Building.",
      sources: [...PLACE_SOURCES],
    });
  } else {
    reasons.push({
      text: "Residential or mixed-use zoning is present, but local THOW / park-model / RV treatment is unverified. Do not treat statewide ADU rights as a wheeled-placement green light — confirm whether the unit is classed as RV, temporary, movable tiny home, or requires foundation/ADU conversion.",
      sources: [...PLACE_SOURCES],
    });
  }

  if (
    parcel?.overlaysVerified === true &&
    (parcel.overlays.vhfhsz || parcel.overlays.fireHazard)
  ) {
    reasons.push({
      text: "Parcel is in a mapped fire hazard / VHFHSZ overlay. Fire access, defensible space, and local wildfire standards can block or condition wheeled placement even when base zoning looks workable.",
      sources: [...PLACE_SOURCES, SRC.hcdFactSheets2026],
    });
  }

  if (parcel?.overlaysVerified === true && parcel.overlays.historicDistrict) {
    reasons.push({
      text: "Historic district overlay may restrict exterior placement, screening, or temporary structures. Confirm design and occupancy rules before assuming a THOW path.",
      sources: [...PLACE_SOURCES],
    });
  }

  if (parcel?.overlaysVerified === true && parcel.overlays.coastalZone) {
    reasons.push({
      text: "Coastal Zone review (CDP / Coastal Act) may apply in addition to local zoning for wheeled placement or long-term occupancy.",
      sources: [...PLACE_SOURCES],
    });
  }

  let status: EligibilityStatus = express ? "eligible" : "warning";

  if (
    parcel?.overlaysVerified === true &&
    (parcel.overlays.vhfhsz ||
      parcel.overlays.fireHazard ||
      parcel.overlays.historicDistrict ||
      parcel.overlays.coastalZone)
  ) {
    status = "warning";
  }

  if (!express && status === "eligible") {
    status = "warning";
  }

  return { status, reasons };
}
