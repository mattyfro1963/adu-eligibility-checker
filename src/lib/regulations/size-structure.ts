/**
 * Canonical size and structure limits for California tiny-home search results.
 * Pre-written CitedClaims only — components render, never invent statute prose.
 */

import {
  CBC_BASELINE,
  TINY_HOME_SIZE_STRUCTURE,
} from "@/lib/content/ca-tiny-home-regulations";
import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim, SizeStructureBriefing } from "@/lib/regulations/types";

const cbscSources = [SRC.cbscBulletin2601, SRC.hcdTinyHomesIb] as const;
const chapter13Sources = [
  SRC.govChapter13,
  SRC.gov66317,
  SRC.gov66321,
  SRC.hcdFactSheets2026,
  SRC.hcdAdu,
] as const;
const thowSources = [SRC.hcdTinyHomesIb, SRC.hcdAdu] as const;

/** CRC habitable-room minima for permanent dwelling paths. */
export const CA_CRC_SIZE_CLAIM: CitedClaim = {
  text: `Permanent dwelling paths follow the ${CBC_BASELINE.codeYear} California Building / Residential Code (${CBC_BASELINE.appendix} where adopted). Typical habitable-room minima include a ceiling height of ${CBC_BASELINE.ceilingHeight}, one habitable room of at least ${CBC_BASELINE.primaryRoomSqFt} sq ft, and at least ${CBC_BASELINE.additionalRoomSqFt} sq ft net floor area for each additional habitable room. Local amendments can be stricter.`,
  sources: [...cbscSources],
};

/** Chapter 13 ministerial size floors — cap on local restrictiveness, not a construction minimum. */
export const CA_CHAPTER13_SIZE_CLAIM: CitedClaim = {
  text: `When the unit is treated as an ADU under Government Code Chapter 13, locals generally cannot set a maximum size below ${TINY_HOME_SIZE_STRUCTURE.aduMinisterialSqFt} sq ft (or ${TINY_HOME_SIZE_STRUCTURE.aduMinisterialMultiBedSqFt} sq ft if more than one bedroom). Compact and tiny ADUs may be smaller — this is a floor on how restrictive local ordinances can be, not a required minimum unit size.`,
  sources: [...chapter13Sources],
};

/** JADU and impact-fee thresholds. */
export const CA_JADU_FEE_CLAIM: CitedClaim = {
  text: `Junior ADUs (JADUs) are created within the walls of a primary dwelling (up to ${TINY_HOME_SIZE_STRUCTURE.jaduMaxSqFt} sq ft) with an efficiency kitchen. Impact fees: local agencies generally cannot impose impact fees on ADUs under ${TINY_HOME_SIZE_STRUCTURE.impactFeeExemptSqFt} sq ft and JADUs; larger ADUs may be charged only proportionally.`,
  sources: [SRC.hcdFactSheets2026, SRC.govChapter13],
};

/** THOW / park-trailer structure path vs foundation ADU. */
export const CA_STRUCTURE_PATH_CLAIM: CitedClaim = {
  text: `Structure path matters: ${TINY_HOME_SIZE_STRUCTURE.structurePaths.foundation}. ${TINY_HOME_SIZE_STRUCTURE.structurePaths.thow}. ${TINY_HOME_SIZE_STRUCTURE.structurePaths.factoryBuilt}. ${TINY_HOME_SIZE_STRUCTURE.structurePaths.hudManufactured}. Removing wheels or a tongue does not by itself create a lawful ADU.`,
  sources: [...thowSources, ...cbscSources],
};

/** Combined size/structure claim for parcel briefing summary. */
export const CA_SIZE_STRUCTURE_SUMMARY_CLAIM: CitedClaim = {
  text: `${CA_CRC_SIZE_CLAIM.text} ${CA_CHAPTER13_SIZE_CLAIM.text}`,
  sources: [...cbscSources, ...chapter13Sources],
};

/** Structured payload for the always-visible ResultsCard panel. */
export function buildSizeStructureBriefing(): SizeStructureBriefing {
  return {
    stats: {
      codeYear: TINY_HOME_SIZE_STRUCTURE.codeYear,
      appendix: TINY_HOME_SIZE_STRUCTURE.appendix,
      ceilingHeight: TINY_HOME_SIZE_STRUCTURE.ceilingHeight,
      primaryRoomSqFt: TINY_HOME_SIZE_STRUCTURE.primaryRoomSqFt,
      additionalRoomSqFt: TINY_HOME_SIZE_STRUCTURE.additionalRoomSqFt,
      aduMinisterialSqFt: TINY_HOME_SIZE_STRUCTURE.aduMinisterialSqFt,
      aduMinisterialMultiBedSqFt:
        TINY_HOME_SIZE_STRUCTURE.aduMinisterialMultiBedSqFt,
      jaduMaxSqFt: TINY_HOME_SIZE_STRUCTURE.jaduMaxSqFt,
      impactFeeExemptSqFt: TINY_HOME_SIZE_STRUCTURE.impactFeeExemptSqFt,
      parkTrailerTypicalSqFtRange:
        TINY_HOME_SIZE_STRUCTURE.parkTrailerTypicalSqFtRange,
    },
    crcClaim: CA_CRC_SIZE_CLAIM,
    chapter13Claim: CA_CHAPTER13_SIZE_CLAIM,
    jaduFeeClaim: CA_JADU_FEE_CLAIM,
    structurePathClaim: CA_STRUCTURE_PATH_CLAIM,
  };
}
