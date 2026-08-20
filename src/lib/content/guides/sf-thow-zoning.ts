/**
 * SF THOW legality guide — lawful pathways + hard limits (not lifestyle “loopholes”).
 * Zero React. Claims cite SRC / official catalog pages only.
 */

import { SRC } from "@/lib/regulations/sources";
import type { GuideMeta, GuideSection } from "@/lib/content/guides/types";

const hcdClass = [SRC.hcdTinyHomesIb] as const;
const chapter13 = [
  SRC.govChapter13,
  SRC.hcdAdu,
  SRC.hcdFactSheets2026,
] as const;
const sfLocal = [SRC.sfPlanningAdu, SRC.sfPlanning, SRC.sfDbi] as const;
const zoning = [SRC.datasfZoning, SRC.sfPim] as const;

export const SF_THOW_META: GuideMeta = {
  slug: "tiny-home-on-wheels-san-francisco",
  title:
    "Is a Tiny Home on Wheels Legal in San Francisco? Rules, Permits, and Loopholes.",
  description:
    "San Francisco THOW / park-model pathways, state ADU floors, and hard limits — with official sources.",
  eyebrow: "San Francisco · THOW zoning",
  lastReviewed: "2026-08-20",
};

export const SF_THOW_INTRO = {
  lead: "In San Francisco, a tiny home on wheels is not a free-floating occupancy class. Lawfulness turns on use (dwelling vs recreation), HCD classification, local zoning, and whether State ADU Law’s ministerial path applies to a foundation-mounted ADU — or a locally authorized moveable tiny house. “Loopholes” here means lawful pathways and hard stops, not workarounds that dodge permits.",
  disclaimer:
    "Informational only — not legal advice. Confirm with SF Planning and the Department of Building Inspection before purchase, delivery, or occupancy.",
} as const;

export const SF_THOW_SECTIONS: GuideSection[] = [
  {
    id: "classification",
    title: "Start with classification, not square footage",
    claims: [
      {
        text: "California does not recognize a generic “tiny home” occupancy. A wheeled unit must fit an established class such as a recreational vehicle, park trailer (commonly ANSI A119.5), manufactured home, factory-built housing, or a CBC/CRC dwelling once it is treated as permanent housing.",
        sources: [...hcdClass],
      },
      {
        text: "Residential occupancy triggers higher health and safety standards than storage, workshop, or seasonal recreation. Converting a studio or storage permit to housing later is a change of use — SF Planning must confirm residential standards before you live in it.",
        sources: [...hcdClass, SRC.sfPlanning],
      },
    ],
  },
  {
    id: "state-adu-floor",
    title: "State ADU floor (Gov. Code Chapter 13)",
    claims: [
      {
        text: "State ADU law in Government Code Chapter 13 (§§ 66310–66342) sets a floor: locals generally cannot undercut ministerial size floors (commonly not less than 850 sq ft, or 1,000 sq ft if more than one bedroom) or ignore the ministerial review clock for a complete ADU application.",
        sources: [
          SRC.govChapter13,
          SRC.gov66314,
          SRC.gov66317,
          SRC.gov66321,
          SRC.hcdFactSheets2026,
        ],
      },
      {
        text: "A tiny home on wheels is an ADU pathway only where local regulation expressly allows moveable tiny houses. Removing wheels or a tongue does not automatically create a lawful ADU; foundation-mounted residential use must still meet Chapter 13 and SF development standards.",
        sources: [...hcdClass, ...chapter13, ...sfLocal],
      },
    ],
  },
  {
    id: "sf-pathways",
    title: "Lawful SF pathways (what “loopholes” actually means)",
    claims: [
      {
        text: "Pathway A — Permanent-foundation ADU: Site-built, modular, or other CBC/CRC-compliant accessory dwelling on an approved foundation under SF’s ADU program and State ADU Law. This is the primary residential path for most SF lots in the pilot.",
        sources: [...sfLocal, ...chapter13],
      },
      {
        text: "Pathway B — Park / special-occupancy placement: Park trailers and many THOWs are treated as recreational or seasonal units unless a permitted special occupancy / manufactured-home park path (or an express local THOW-as-ADU ordinance) authorizes residential use.",
        sources: [...hcdClass, SRC.sfDbi],
      },
      {
        text: "Pathway C — Confirm the lot: Zoning district, overlays (historic, coastal, fire), access, and setbacks come from the SF Planning Code and parcel facts. State ADU law limits how restrictive locals can be for ADUs — it does not replace reading this lot’s district on DataSF / PIM.",
        sources: [...zoning, SRC.sfPlanning],
      },
    ],
  },
  {
    id: "hard-limits",
    title: "Hard limits (not optional)",
    claims: [
      {
        text: "Unpermitted placement can lead to fines and code enforcement. Do not skip Planning / DBI permits for foundation work, utility connections, or change of use to dwelling occupancy.",
        sources: [SRC.sfPlanning, SRC.sfDbi, SRC.hcdAdu],
      },
      {
        text: "Commercial-only or non-residential districts generally do not carry statewide ADU rights. A retail or home-occupation use in a small structure is still a land-use problem if the district does not allow that use.",
        sources: [SRC.gov66314, SRC.datasfZoning, ...hcdClass],
      },
      {
        text: "Historic, coastal, and fire / VHFHSZ overlays can add objective standards or Coastal Act review even when a base residential ADU path exists. Resolve overlays before treating a wheeled unit as ready to occupy.",
        sources: [SRC.sfPim, SRC.hcdFactSheets2026, SRC.govChapter13],
      },
      {
        text: "CC&Rs or HOA rules that prohibit or unreasonably restrict ADUs or JADUs on a single-family lot are void and unenforceable under Civil Code §§ 4751 and 4740 — but that does not legalize an unpermitted THOW or waive Building Code compliance.",
        sources: [SRC.civ4751, SRC.civ4740, ...chapter13],
      },
    ],
  },
  {
    id: "permits-checklist",
    title: "Permits buyers should expect",
    claims: [
      {
        text: "Ask SF Planning whether the proposal is an ADU, JADU, temporary occupancy, or park-model path — then ask DBI which building, foundation, electrical, plumbing, and inspection sequence applies.",
        sources: [...sfLocal],
      },
      {
        text: "Impact fees: local agencies generally cannot impose impact fees on ADUs under 750 square feet and JADUs; larger ADUs may be charged proportionally. Garage conversions generally cannot require replacement off-street parking under State ADU Law.",
        sources: [SRC.hcdFactSheets2026, SRC.govChapter13],
      },
    ],
  },
];
