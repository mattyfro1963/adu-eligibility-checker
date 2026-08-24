/**
 * Published Washington THOW / park-model / L&I vs PMRV profile.
 * Jurisdiction packages only — no fake lot GIS.
 */

import { SRC } from "@/lib/regulations/sources";
import type {
  ChecklistItem,
  CitedClaim,
  OutlineSection,
  StateProfile,
} from "@/lib/regulations/types";

const classSources = [SRC.hcdTinyHomesIb, SRC.noahDwelling, SRC.rvia] as const;
const transportSources = [SRC.waDotOversize] as const;

export const WA_USE_DOCTRINE: CitedClaim[] = [
  {
    text: "Washington does not treat a tiny home on wheels as an automatic ADU. Placement depends on local zoning and whether the unit is classed as a park-model RV, recreational vehicle, or a factory-built / L&I dwelling path — confirm before buying land or delivering a unit.",
    sources: [...classSources],
  },
  {
    text: "Park-model RVs (often ANSI A119.5) are commonly recreational / seasonal unless local rules allow longer occupancy. L&I / factory-built paths are different from PMRV classification — do not conflate them.",
    sources: [...classSources],
  },
  {
    text: "Do not assume California Chapter 13 ADU rules apply in Washington. Local THOW-as-ADU or companion-unit ordinances are jurisdiction-specific.",
    sources: [...classSources],
  },
];

export const WA_OUTLINE: OutlineSection[] = [
  {
    id: "use-of-land",
    title: "Use of land (start here)",
    claims: [
      ...WA_USE_DOCTRINE,
      {
        text: "Do not skip permits. Unpermitted placement can lead to fines and code enforcement. This checker is informational only — confirm with local Planning/Building or a Washington-licensed land-use professional.",
        sources: [...classSources],
      },
    ],
  },
  {
    id: "classification",
    title: "L&I vs park-model RV",
    claims: [
      {
        text: "Ask whether the unit is evaluated as a park-model RV / recreational vehicle or under a factory-built / L&I dwelling path. The answer drives occupancy duration, utility rules, and inspection expectations.",
        sources: [...classSources],
      },
      {
        text: "NOAH residential certification differs from ANSI A119.5 recreational seals. Match the seal to the occupancy you intend.",
        sources: [SRC.noahDwelling, SRC.rvia],
      },
    ],
  },
  {
    id: "transport",
    title: "Transport & delivery",
    claims: [
      {
        text: "Designed to reduce escort requirements; pilot-car need confirmed by state permit route. Washington widths over 11 ft commonly increase escort risk. No pilot car on qualifying routes; route and permit confirmation required before delivery.",
        sources: [...transportSources],
      },
    ],
  },
];

export const WA_CHECKLIST: ChecklistItem[] = [
  {
    id: "wa-zoning",
    title: "Confirm local THOW / PMRV / L&I path",
    detail: {
      text: "Call Planning/Building and ask how a certified THOW or park-model RV is classed on the lot, whether permanent occupancy is allowed, and which permits apply.",
      sources: [...classSources],
    },
  },
  {
    id: "wa-utilities",
    title: "Verify utility hookups",
    detail: {
      text: "Confirm lawful water, sewer/septic, and electric connections for the intended occupancy. Hookup bans block long-term living.",
      sources: [...classSources],
    },
  },
  {
    id: "wa-transport",
    title: "Hauler route & WSDOT permits",
    detail: {
      text: "Complete a hauler route review. Prefer ≤11 ft width when possible; widths over 11 ft often raise escort requirements on Washington routes — confirm with WSDOT permits.",
      sources: [...transportSources],
    },
  },
  {
    id: "wa-local",
    title: "Contact local Planning and Building",
    detail: {
      text: "Read the local zoning ordinance for permitted uses and development standards, then file before occupying.",
      sources: [...classSources],
    },
  },
];

export const WA_PROFILE: Extract<StateProfile, { published: true }> = {
  published: true,
  code: "WA",
  name: "Washington",
  useDoctrine: WA_USE_DOCTRINE,
  outline: WA_OUTLINE,
  sfChecklist: [],
  caChecklist: WA_CHECKLIST,
};
