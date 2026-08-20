/**
 * Published California regulations profile — use-first doctrine, building-path
 * outline, SF and statewide checklists. Pre-written CitedClaims only.
 */

import { SRC } from "@/lib/regulations/sources";
import type {
  ChecklistItem,
  CitedClaim,
  OutlineSection,
  StateProfile,
} from "@/lib/regulations/types";

const hcdClass = [SRC.hcdTinyHomesIb] as const;
const chapter13 = [
  SRC.govChapter13,
  SRC.hcdAdu,
  SRC.hcdFactSheets2026,
] as const;
const zoningSf = [SRC.datasfZoning, SRC.sfPim, SRC.sfPlanning] as const;
const ansi = [SRC.hcdTinyHomesIb, SRC.sfDbi] as const;
const cbsc = [SRC.cbscBulletin2601] as const;
const sb9 = [SRC.gov65852_21, SRC.gov66411_7, SRC.hcdSb9] as const;
const ccRs = [SRC.civ4751, SRC.civ4740] as const;

export const CA_USE_DOCTRINE: CitedClaim[] = [
  {
    text: "Lawfulness turns on how you use the structure — dwelling, studio, storage, home occupation, or retail — not merely that it looks like a tiny house. A small shop that adds traffic and parking demand in a residential zone is a commercial use problem even if the building is tiny.",
    sources: [...hcdClass],
  },
  {
    text: "California does not recognize a generic “tiny home” occupancy. A unit must fit an established class such as a CBC/CRC dwelling, factory-built housing, manufactured home, recreational vehicle, park trailer, or commercial modular (HCD IB 2016-01).",
    sources: [...hcdClass],
  },
  {
    text: "Residential occupancy triggers higher health and safety standards than storage or workshop use. Converting a studio or storage permit to housing later is a change of use — local planning must confirm the unit meets residential standards before you live in it.",
    sources: [...hcdClass, SRC.sfPlanning],
  },
];

export const CA_OUTLINE: OutlineSection[] = [
  {
    id: "use-of-land",
    title: "Use of land (start here)",
    claims: [
      ...CA_USE_DOCTRINE,
      {
        text: "Do not skip permits. Unpermitted placement can lead to fines and code enforcement. This checker is informational only — confirm with your local Planning/Building department (or SF Planning/DBI in San Francisco) or a California-licensed land-use attorney for site-specific advice.",
        sources: [SRC.sfPlanning, SRC.sfDbi, SRC.hcdAdu],
      },
    ],
  },
  {
    id: "state-then-local",
    title: "State ADU floor, then local zoning",
    claims: [
      {
        text: "State ADU law lives in Government Code Chapter 13 (§§ 66310–66342), recodified from former § 65852.2. It sets a floor: locals cannot undercut ministerial size floors (generally not less than 850 sq ft, or 1,000 sq ft if more than one bedroom) or ignore the ministerial review clock (commonly 60 days for a complete ADU application).",
        sources: [
          SRC.govChapter13,
          SRC.gov66314,
          SRC.gov66317,
          SRC.gov66321,
          SRC.hcdFactSheets2026,
        ],
      },
      {
        text: "Your city or county zoning ordinance still lists which uses are allowed in which districts and sets setbacks, parking, access, and screening. State law limits how restrictive locals can be for ADUs — it does not replace reading the local code.",
        sources: [...chapter13, SRC.sfPlanning],
      },
      {
        text: "A tiny home on wheels is an ADU pathway only where local regulation expressly allows moveable tiny houses. Removing wheels or a tongue does not automatically create a lawful ADU; foundation-mounted residential use must still meet Chapter 13 and local standards.",
        sources: [...hcdClass, ...chapter13],
      },
    ],
  },
  {
    id: "adu",
    title: "ADU / JADU",
    claims: [
      {
        text: "Ministerial ADU and JADU paths apply in residential and mixed-use zones under Chapter 13 (including §§ 66314 and 66323). Local ordinances must be submitted to HCD and cannot shrink the state floor. § 66323 also allows more than one qualifying ADU/JADU configuration on a single lot in listed cases — do not assume a hard “one ADU per lot” ceiling.",
        sources: [SRC.gov66314, SRC.gov66323, SRC.hcdAdu],
      },
      {
        text: "Junior ADUs (JADUs) are created within the walls of a proposed or existing single-family primary dwelling (up to 500 sq ft) and include an efficiency kitchen. JADUs are permitted statewide under Chapter 13 ministerial standards without requiring a local ordinance.",
        sources: [SRC.hcdFactSheets2026, SRC.govChapter13],
      },
      {
        text: "Impact fees: local agencies generally cannot impose impact fees on ADUs under 750 square feet and JADUs. For ADUs 750 square feet or larger, impact fees must be charged proportionally in relation to the square footage of the primary dwelling unit.",
        sources: [SRC.hcdFactSheets2026, SRC.govChapter13],
      },
      {
        text: "When existing parking (such as a garage or carport) is converted to an ADU, local agencies cannot require replacement off-street parking. State law also protects existing setbacks for converted accessory structures.",
        sources: [SRC.hcdFactSheets2026, SRC.govChapter13],
      },
      {
        text: "Provisions in covenants, conditions, and restrictions (CC&Rs) or HOA governing documents that prohibit or unreasonably restrict the construction or use of an ADU or JADU on a single-family lot are void and unenforceable under California Civil Code §§ 4751 and 4740.",
        sources: [SRC.civ4751, SRC.civ4740],
      },
      {
        text: "2026 updates (among others) clarify interior livable-space measurement (SB 543), current JADU owner-occupancy rules (AB 1154), and coastal/disaster timing (AB 462). See HCD’s 2026 Housing Law Fact Sheets and ADU Handbook for the governing summary.",
        sources: [SRC.hcdFactSheets2026, SRC.hcdAdu],
      },
    ],
  },
  {
    id: "parkModel",
    title: "Park model / THOW",
    claims: [
      {
        text: "Park trailers are commonly built to ANSI A119.5 and treated as recreational / seasonal units unless a local path (special occupancy park or express THOW-as-ADU ordinance) allows residential use. Certification matters — DIY builders should ask the local building department what proof they accept.",
        sources: [...ansi],
      },
      {
        text: "Rules vary city to city across California. California jurisdictions may allow or restrict moveable tiny houses (THOWs) differently under their own local ordinances — confirm local standards with your city or county planning department.",
        sources: [...hcdClass, SRC.sfPlanningAdu, SRC.hcdAdu],
      },
    ],
  },
  {
    id: "cabin",
    title: "Cabin",
    claims: [
      {
        text: "There is no statewide “cabin” dwelling class. Seasonal or recreational cabins still must land in an HCD-recognized classification; permanent residential occupancy follows CBC/CRC (or FBH / manufactured-home) rules, not a cabin label.",
        sources: [...hcdClass, ...cbsc],
      },
    ],
  },
  {
    id: "modular",
    title: "Modular / factory-built vs manufactured",
    claims: [
      {
        text: "Factory-built housing (modular) is built to the California Building Standards Code with HCD oversight (Health & Safety Code § 19960 et seq. / Title 25). HUD Code manufactured homes (24 CFR 3280) are a different path with a HUD label — do not confuse the two.",
        sources: [...hcdClass, ...cbsc],
      },
    ],
  },
  {
    id: "building-code",
    title: "Building code baseline",
    claims: [
      {
        text: "The 2025 California Building Standards Code (Title 24) is effective statewide as of January 1, 2026. Permanent dwellings follow CBC/CRC occupancy and habitability standards; Appendix AQ (tiny houses) applies only where still adopted in the current CRC for your permit path.",
        sources: [...cbsc, ...hcdClass],
      },
    ],
  },
  {
    id: "sb9-note",
    title: "SB 9 (2021 two-unit / lot split) — separate from ADU",
    claims: [
      {
        text: "Product “SB 9” here means the 2021 Atkins two-unit and urban lot-split law (Gov. Code §§ 65852.21 and 66411.7), as amended (including SB 450). It is not the 2025 bill also numbered SB 9 that concerns ADU ordinance submission to HCD.",
        sources: [...sb9],
      },
    ],
  },
];

export const SF_CHECKLIST: ChecklistItem[] = [
  {
    id: "sf-use",
    title: "Name the primary use",
    detail: {
      text: "Decide whether the unit will be a dwelling, home occupation, studio, storage, or retail. If you might convert a studio or storage use to housing later, plan a change of use with SF Planning so residential safety standards apply before occupancy.",
      sources: [...hcdClass, SRC.sfPlanning],
    },
  },
  {
    id: "sf-zoning",
    title: "Read this lot’s zoning district",
    detail: {
      text: "Confirm the zoning district from this check (DataSF Zoning Districts) and what uses that district allows under the SF Planning Code. Setbacks, lot size, parking, access, and screening come from local standards — state ADU law does not replace them.",
      sources: [...zoningSf],
    },
  },
  {
    id: "sf-state-adu",
    title: "Apply the state ADU floor (if the use is an ADU)",
    detail: {
      text: "If the proposal is an ADU, Chapter 13 sets ministerial floors (locals generally cannot restrict size below 850 sq ft, or 1,000 sq ft with more than one bedroom) and review timing (including the 60-day clock for complete applications). THOWs count as an ADU pathway only where local regulation expressly allows them.",
      sources: [
        SRC.govChapter13,
        SRC.gov66317,
        SRC.gov66321,
        SRC.hcdFactSheets2026,
        SRC.sfPlanningAdu,
      ],
    },
  },
  {
    id: "sf-fees-parking",
    title: "Check impact fees and garage-conversion parking",
    detail: {
      text: "Ask Planning about impact fees: ADUs under 750 sq ft are generally exempt, and larger units may be charged only proportionally. If converting a garage or carport, State ADU Law generally bars requiring replacement parking for spaces lost to that conversion.",
      sources: [...chapter13],
    },
  },
  {
    id: "sf-jadu-ccrs",
    title: "Confirm JADU path and private CC&Rs",
    detail: {
      text: "If proposing a junior ADU, confirm Chapter 13 / HCD JADU standards (efficiency kitchen, shared utilities, owner-occupancy rules). Civil Code § 4751 makes private CC&Rs that unreasonably restrict ADUs/JADUs unenforceable; § 4740 addresses rental restrictions in governing documents.",
      sources: [...chapter13, ...ccRs],
    },
  },
  {
    id: "sf-pim",
    title: "Look up the lot on SF PIM",
    detail: {
      text: "Use the Property Information Map for block/lot (APN), historic status, and related parcel facts. Ask Planning about definitions such as accessory use as they apply to your proposal.",
      sources: [SRC.sfPim, SRC.sfPlanning],
    },
  },
  {
    id: "sf-safety",
    title: "Meet safety / certification standards",
    detail: {
      text: "Residential THOWs are commonly held to ANSI A119.5 (see HCD IB 2016-01). Ask SF DBI what certification or inspections they accept for DIY builds; factory units typically carry listed certification. Stick-built ADUs follow CBC/CRC with DBI inspections, not ANSI alone.",
      sources: [...ansi, ...cbsc],
    },
  },
  {
    id: "sf-file",
    title: "File with Planning and DBI",
    detail: {
      text: "Obtain the required Planning and building permits before delivery or occupancy. Do not live in a unit permitted only as storage or a studio.",
      sources: [SRC.sfPlanningAdu, SRC.sfDbi],
    },
  },
  {
    id: "sf-ask",
    title: "Confirm with Planning staff",
    detail: {
      text: "Planning staff can explain how the code applies to your exact proposal. This checker is not a permit, approval, or legal advice.",
      sources: [SRC.sfPlanning, SRC.sfDbi],
    },
  },
];

export const CA_CHECKLIST: ChecklistItem[] = [
  {
    id: "ca-use",
    title: "Name the primary use",
    detail: {
      text: "Identify dwelling, home occupation, studio, storage, or retail first. A later switch to residential occupancy is a change of use that must meet higher safety standards.",
      sources: [...hcdClass],
    },
  },
  {
    id: "ca-state-adu",
    title: "Check the state ADU floor",
    detail: {
      text: "If the use is an ADU, Government Code Chapter 13 (§§ 66310–66342) sets the statewide ministerial floor and timing. Confirm your city or county ordinance against HCD guidance — lot-level zoning coverage in this tool is a California pilot (DataSF-backed for covered lots).",
      sources: [...chapter13],
    },
  },
  {
    id: "ca-fees-parking",
    title: "Check impact fees and garage-conversion parking",
    detail: {
      text: "Under State ADU Law as summarized by HCD, ADUs under 750 sq ft are generally exempt from impact fees, and larger ADUs may be charged only proportionally. Garage or carport conversions generally cannot trigger a local requirement to replace the lost parking spaces.",
      sources: [...chapter13],
    },
  },
  {
    id: "ca-jadu-ccrs",
    title: "Confirm JADU path and private CC&Rs",
    detail: {
      text: "Junior ADUs follow Chapter 13 / HCD standards (typically within the primary dwelling, efficiency kitchen, shared utilities, and current owner-occupancy rules). Civil Code § 4751 voids unreasonable private ADU/JADU bans in CC&Rs; § 4740 addresses rental restrictions — read both with your HOA documents.",
      sources: [...chapter13, ...ccRs],
    },
  },
  {
    id: "ca-safety",
    title: "Plan safety / certification",
    detail: {
      text: "Residential park trailers commonly need ANSI A119.5 certification (HCD IB 2016-01). Site-built and factory-built dwellings follow the 2025 California Building Standards Code path effective January 1, 2026.",
      sources: [...ansi, ...cbsc],
    },
  },
  {
    id: "ca-local",
    title: "Contact local Planning and Building",
    detail: {
      text: "Read your local zoning ordinance for permitted uses and development standards, then file before occupying. Skipping permits risks fines and code enforcement.",
      sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb],
    },
  },
];

export const CA_PROFILE: Extract<StateProfile, { published: true }> = {
  published: true,
  code: "CA",
  name: "California",
  useDoctrine: CA_USE_DOCTRINE,
  outline: CA_OUTLINE,
  sfChecklist: SF_CHECKLIST,
  caChecklist: CA_CHECKLIST,
};
