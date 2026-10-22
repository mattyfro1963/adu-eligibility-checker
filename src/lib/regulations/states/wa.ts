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

const classSources = [
  SRC.waWacParkTrailer,
  SRC.waLniFasLaws,
  SRC.waLniModularPortal,
  SRC.noahDwelling,
  SRC.rvia,
] as const;
const transportSources = [
  SRC.waDotOversize,
  SRC.waWacPilotEscort,
  SRC.waDotPermitForm560002,
] as const;

export const WA_USE_DOCTRINE: CitedClaim[] = [
  {
    text: "Washington does not treat a tiny home on wheels as an automatic ADU. Placement depends on local zoning and whether the unit is classed as a park-model RV, recreational vehicle, or a factory-built / L&I dwelling path — confirm before buying land or delivering a unit.",
    sources: [...classSources],
  },
  {
    text: "Recreational park trailers / park-model RVs are defined with ≤400 sq ft set-up and ANSI A119.5 under WAC 296-150P; the L&I insignia path differs from factory-built housing. Do not conflate recreational seals with a permanent dwelling permit.",
    sources: [...classSources],
  },
  {
    text: "Local THOW-as-ADU or companion-unit ordinances are jurisdiction-specific. A park-trailer / recreational classification under WAC 296-150P is not a permanent dwelling entitlement — confirm L&I vs recreational path with local Planning.",
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
        text: "CAMBRIA plans are designed to reduce pilot-car requirements. Final pilot-car requirements depend on state permit rules and the delivery route. Legal width is 8 ft 6 in; oversize loads need a WSDOT permit.",
        sources: [...transportSources],
      },
      {
        text: "Under WAC 468-38-100(1)(a), a load or vehicle exceeding 11 ft width requires two pilot/escort vehicles on two-lane highways (front and rear). CAMBRIA 1 (11.4 ft) is a known escort risk on those routes; CAMBRIA 2 (≤11 ft) avoids that automatic two-escort trigger but still needs oversize permits and route confirmation.",
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
      text: "Complete a hauler route review. Prefer ≤11 ft width when possible; widths over 11 ft trigger WAC 468-38-100(1)(a) two-escort requirements on two-lane highways — confirm with WSDOT permits.",
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
