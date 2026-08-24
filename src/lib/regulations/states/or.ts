/**
 * Published Oregon THOW / park-model / companion-unit profile.
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
const transportSources = [SRC.orDotOversize] as const;

export const OR_USE_DOCTRINE: CitedClaim[] = [
  {
    text: "Oregon does not treat a tiny home on wheels as an automatic ADU. Lawfulness turns on local zoning classification (RV, park model, temporary dwelling, or companion unit) plus building/occupancy rules — confirm with the city or county before buying land or delivering a unit.",
    sources: [...classSources],
  },
  {
    text: "Park-model RVs and certified THOWs are commonly evaluated as recreational / movable units. Permanent residential occupancy, utility hookups, and long-term placement require local approval — certification seals alone are not a placement permit.",
    sources: [...classSources],
  },
  {
    text: "Companion-unit or ADU-style paths apply only where the local ordinance expressly allows them. Do not assume California Chapter 13 ADU rules apply in Oregon.",
    sources: [...classSources],
  },
];

export const OR_OUTLINE: OutlineSection[] = [
  {
    id: "use-of-land",
    title: "Use of land (start here)",
    claims: [
      ...OR_USE_DOCTRINE,
      {
        text: "Do not skip permits. Unpermitted placement can lead to fines and code enforcement. This checker is informational only — confirm with local Planning/Building or an Oregon-licensed land-use professional for site-specific advice.",
        sources: [...classSources],
      },
    ],
  },
  {
    id: "classification",
    title: "THOW / park model classification",
    claims: [
      {
        text: "Ask Planning how the unit is classed: RV, park-model RV, temporary dwelling, movable tiny home, or companion unit. The class drives setbacks, utility rules, and whether permanent occupancy is allowed.",
        sources: [...classSources],
      },
      {
        text: "NOAH, ANSI A119.5, and RVIA documentation (data plate / VIN / seal) support certification fit but do not replace local zoning approval.",
        sources: [SRC.noahDwelling, SRC.rvia, SRC.hcdTinyHomesIb],
      },
    ],
  },
  {
    id: "transport",
    title: "Transport & delivery",
    claims: [
      {
        text: "Designed to reduce escort requirements; pilot-car need confirmed by state permit route. Oregon over-dimension permits and route restrictions apply — never assume a blanket “no pilot car” clearance.",
        sources: [...transportSources],
      },
    ],
  },
];

export const OR_CHECKLIST: ChecklistItem[] = [
  {
    id: "or-zoning",
    title: "Confirm local THOW / RV / park-model path",
    detail: {
      text: "Call Planning/Building and ask whether a certified THOW or park-model RV may be placed and occupied on the lot, for how long, and under which use class.",
      sources: [...classSources],
    },
  },
  {
    id: "or-utilities",
    title: "Verify utility hookups",
    detail: {
      text: "Confirm lawful water, sewer/septic, and electric connections for the intended occupancy duration. Hookup bans are a hard stop for long-term living.",
      sources: [...classSources],
    },
  },
  {
    id: "or-transport",
    title: "Hauler route & ODOT permits",
    detail: {
      text: "Complete a hauler route review and obtain any Oregon over-dimension permits before delivery. Logistics are route-qualified.",
      sources: [...transportSources],
    },
  },
  {
    id: "or-local",
    title: "Contact local Planning and Building",
    detail: {
      text: "Read the local zoning ordinance for permitted uses and development standards, then file before occupying.",
      sources: [...classSources],
    },
  },
];

export const OR_PROFILE: Extract<StateProfile, { published: true }> = {
  published: true,
  code: "OR",
  name: "Oregon",
  useDoctrine: OR_USE_DOCTRINE,
  outline: OR_OUTLINE,
  sfChecklist: [],
  caChecklist: OR_CHECKLIST,
};
