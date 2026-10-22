/**
 * Oregon tiny-home / park-model / THOW regulation guide content.
 * Informational summaries only — verify with city or county Planning/Building.
 * Doctrine backbone: src/lib/regulations/states/or.ts (classification, transport).
 */

import { formatRegulationsDisclaimer } from "@/lib/regulations/agent";
import type {
  FaqItem,
  JurisdictionNote,
  ResourceLink,
  StateTinyHomeGuideContent,
  TinyHomeCommunity,
} from "@/lib/content/state-tiny-home-guide-types";

/** Statewide framing metrics for Oregon THOW / park-model context. */
export const OR_CODE_BASELINE = {
  codeYear: "2022+",
  legalWidth: "8 ft 6 in",
  legalHeight: "14 ft 0 in",
  parkModelTypicalSqFt: "≤400",
  appendixNote:
    "Local zoning + Oregon Residential Specialty Code where adopted",
} as const;

export const GUIDE_INTRO = {
  title: "Tiny Home Regulations in Oregon",
  subtitle: "County and city guide for park models, THOWs, and companion units",
  lead: "Oregon does not treat a tiny home on wheels as an automatic ADU. Lawfulness turns on local zoning classification (RV, park model, temporary dwelling, or companion unit) plus building and occupancy rules. Use this guide to orient, then confirm with your city or county before you buy land or deliver a unit.",
  buildingCodeNote: `Statewide, Oregon legal highway width is ${OR_CODE_BASELINE.legalWidth} and height ${OR_CODE_BASELINE.legalHeight} (ORS Ch. 818 / ODOT). Over-dimension loads need permits. Park-model and THOW living area is commonly evaluated near ${OR_CODE_BASELINE.parkModelTypicalSqFt} sq ft set-up. Permanent dwelling paths follow local zoning and the Oregon Residential Specialty Code where adopted.`,
} as const;

export const PARK_MODEL_OVERVIEW = {
  title: "Are park models the same as tiny homes?",
  body: "Park models and certified THOWs are commonly evaluated in Oregon as recreational or movable units. Permanent residential occupancy, utility hookups, and long-term placement require local approval — certification seals alone are not a placement permit.",
  livingFullTime:
    "Full-time occupancy rules vary by city and county. Some areas allow one occupied recreational vehicle / THOW on a developed residential lot (for example Portland’s occupied-RV path). Unincorporated counties may authorize rural second-dwelling or long-term rental pathways where local ordinances opt in. Many places still limit park models to RV parks or temporary use.",
  ansiNote:
    "NOAH, ANSI A119.5, and RVIA documentation (data plate / VIN / seal) support certification fit but do not replace local zoning approval or ODOT over-dimension permits for delivery.",
} as const;

export const PERMIT_OVERVIEW = {
  title: "Do you need a permit?",
  body: "Usually yes for utilities, placement, or long-term occupancy. Ask Planning how the unit is classed, then confirm building, septic/sewer, and electrical requirements before delivery. Oregon over-dimension highway permits are separate from local land-use approval.",
} as const;

export const COUNTY_DIRECTORY: ResourceLink[] = [
  {
    label: "Multnomah County — Land Use Planning",
    href: "https://www.multco.us/landuse",
  },
  {
    label: "Clackamas County — Planning & Zoning",
    href: "https://www.clackamas.us/planning",
  },
  {
    label: "Washington County — Land Use & Transportation",
    href: "https://www.washingtoncountyor.gov/lut",
  },
  {
    label: "Lane County — Land Management",
    href: "https://www.lanecounty.org/government/county_departments/public_works/land_management_division",
  },
  {
    label: "Deschutes County — Community Development",
    href: "https://www.deschutes.org/cd",
  },
  {
    label: "Marion County — Planning",
    href: "https://www.co.marion.or.us/PW/Planning",
  },
  {
    label: "Jackson County — Development Services",
    href: "https://jacksoncountyor.gov/departments/development_services/",
  },
  {
    label: "Benton County — Community Development",
    href: "https://www.co.benton.or.us/cd",
  },
  {
    label: "ODOT — Over-Dimension Permits",
    href: "https://www.oregon.gov/odot/mct/pages/over-dimension.aspx",
  },
];

export const CITY_DIRECTORY: ResourceLink[] = [
  {
    label: "Portland — Occupied RVs & tiny houses on wheels",
    href: "https://www.portland.gov/ppd/zoning-land-use/zoning-code-overview/occupied-rvs-and-tiny-houses-wheels",
  },
  {
    label: "Eugene — Planning & Development",
    href: "https://www.eugene-or.gov/1135/Planning-and-Development",
  },
  {
    label: "Salem — Community Development",
    href: "https://www.cityofsalem.net/government/departments/community-development",
  },
  {
    label: "Bend — Community Development",
    href: "https://www.bendoregon.gov/government/departments/community-development",
  },
  {
    label: "Beaverton — Community Development",
    href: "https://www.beavertonoregon.gov/149/Community-Development",
  },
  {
    label: "Hillsboro — Planning",
    href: "https://www.hillsboro-oregon.gov/our-city/departments/planning",
  },
];

/** Counties where published park-model / THOW permanence guidance is thin. */
export const UNCLEAR_COUNTIES: ResourceLink[] = [
  {
    label: "Linn County — County site",
    href: "https://www.co.linn.or.us/",
  },
  {
    label: "Yamhill County — County site",
    href: "https://www.co.yamhill.or.us/",
  },
  {
    label: "Polk County — County site",
    href: "https://www.co.polk.or.us/",
  },
  {
    label: "Josephine County — Planning",
    href: "https://www.josephinecounty.gov/departments/planning",
  },
  {
    label: "Douglas County — County site",
    href: "https://www.co.douglas.or.us/",
  },
];

export const COUNTY_GUIDES: JurisdictionNote[] = [
  {
    name: "Multnomah County",
    summary:
      "Most Multnomah addresses fall under City of Portland rules. Unincorporated Multnomah County is more restrictive: do not assume Portland’s occupied-RV path applies outside city limits. Confirm with Multnomah County Land Use before placing a THOW on unincorporated land.",
    parkModel:
      "City of Portland allows one occupied recreational vehicle / THOW on a developed residential lot with a primary house under Zoning Code Ch. 33.260 — wheels must remain on; undeveloped lots are not eligible. Unincorporated county rules differ; contact county Land Use.",
    links: [
      {
        label: "Multnomah County Land Use",
        href: "https://www.multco.us/landuse",
      },
    ],
    cities: [
      {
        name: "Portland",
        summary:
          "Portland allows one occupied recreational vehicle / THOW on a developed residential lot with a primary house under Zoning Code Ch. 33.260 — wheels must remain on; undeveloped lots are not eligible. Parking is generally behind the street-facing façade of the primary dwelling.",
        parkModel:
          "Treated as an occupied recreational vehicle, not an ADU. Utility connections typically need permits. Short-term rental use of the occupied RV is restricted — verify current Portland Zoning Code 33.260 before relying on income use.",
        links: [
          {
            label: "Occupied RVs & THOWs (Portland.gov)",
            href: "https://www.portland.gov/ppd/zoning-land-use/zoning-code-overview/occupied-rvs-and-tiny-houses-wheels",
          },
        ],
      },
    ],
  },
  {
    name: "Clackamas County",
    summary:
      "Clackamas has been among the counties exploring second-dwelling and rural residential pathways for movable tiny homes where local ordinances allow. Urban low-density and rural residential zones can differ — confirm the parcel’s zone and adopted standards with Planning before purchase.",
    parkModel:
      "Ask whether a certified THOW or park-model RV may be placed as a second dwelling, temporary dwelling, or RV-park use only. Utility hookups (water, wastewater, electric) are typically required for long-term occupancy.",
    links: [
      {
        label: "Clackamas County Planning",
        href: "https://www.clackamas.us/planning",
      },
    ],
  },
  {
    name: "Washington County",
    summary:
      "Washington County (Oregon) land-use rules control unincorporated areas; cities such as Beaverton, Hillsboro, and Tigard apply their own codes. THOW permanence is jurisdiction-specific — start with the city if the address is incorporated.",
    parkModel:
      "Published county-wide park-model permanence guidance is limited. Confirm RV / temporary dwelling / companion-unit classification with Land Use & Transportation or the city planning desk.",
    links: [
      {
        label: "Washington County LUT",
        href: "https://www.washingtoncountyor.gov/lut",
      },
    ],
    cities: [
      {
        name: "Beaverton",
        summary:
          "City Community Development handles zoning and building for addresses inside city limits. Do not assume county rural pathways apply.",
        links: [
          {
            label: "Beaverton Community Development",
            href: "https://www.beavertonoregon.gov/149/Community-Development",
          },
        ],
      },
      {
        name: "Hillsboro",
        summary:
          "Confirm THOW / park-model / RV occupancy and utility rules with Hillsboro Planning — local standards control.",
        links: [
          {
            label: "Hillsboro Planning",
            href: "https://www.hillsboro-oregon.gov/our-city/departments/planning",
          },
        ],
      },
    ],
  },
  {
    name: "Lane County",
    summary:
      "Lane County Land Management administers unincorporated zoning; Eugene and Springfield apply city codes. Rural residential pathways for long-term RV / THOW placement may exist where the county has opted into enabling ordinances — floodplain restrictions are a hard stop where mapped.",
    parkModel:
      "Confirm whether the parcel is outside mapped floodplains and whether long-term rental or second-dwelling placement of a wheeled unit is allowed in that zone. City of Eugene rules differ from unincorporated county.",
    links: [
      {
        label: "Lane County Land Management",
        href: "https://www.lanecounty.org/government/county_departments/public_works/land_management_division",
      },
    ],
    cities: [
      {
        name: "Eugene",
        summary:
          "Eugene Planning & Development controls city lots. Ask how a park-model or THOW is classed and whether permanent occupancy or ADU/companion paths apply.",
        links: [
          {
            label: "Eugene Planning & Development",
            href: "https://www.eugene-or.gov/1135/Planning-and-Development",
          },
        ],
      },
    ],
  },
  {
    name: "Deschutes County",
    summary:
      "High-desert counties often pair rural residential placement with wildfire / defensible-space and pad requirements. Deschutes Community Development is the first call for unincorporated parcels; Bend applies city standards inside city limits.",
    parkModel:
      "Where rural second-dwelling or long-term RV placement is allowed, expect utility proof, setbacks, and wildfire defensible-space standards. Verify acreage and zone before buying land.",
    links: [
      {
        label: "Deschutes Community Development",
        href: "https://www.deschutes.org/cd",
      },
    ],
    cities: [
      {
        name: "Bend",
        summary:
          "City of Bend Community Development reviews zoning and building for city addresses. Do not assume county rural THOW pathways apply inside Bend.",
        links: [
          {
            label: "Bend Community Development",
            href: "https://www.bendoregon.gov/government/departments/community-development",
          },
        ],
      },
    ],
  },
  {
    name: "Marion County",
    summary:
      "Marion County Planning covers unincorporated areas; Salem and other cities apply municipal codes. Tiny-home and park-model permanence is not uniform — confirm the use class for the specific zone.",
    parkModel:
      "Stance on full-time park-model occupancy varies. Contact Planning or the city building department before assuming wheels-on residential use.",
    links: [
      {
        label: "Marion County Planning",
        href: "https://www.co.marion.or.us/PW/Planning",
      },
    ],
    cities: [
      {
        name: "Salem",
        summary:
          "Confirm THOW / RV / companion-unit classification with Salem Community Development for city lots.",
        links: [
          {
            label: "Salem Community Development",
            href: "https://www.cityofsalem.net/government/departments/community-development",
          },
        ],
      },
    ],
  },
  {
    name: "Jackson County",
    summary:
      "Southern Oregon county covering Medford and surrounding communities. Development Services handles planning and building for unincorporated land; cities set their own rules.",
    parkModel:
      "Published park-model permanence guidance is limited. Ask whether the unit is RV-park only, temporary dwelling, or eligible for longer occupancy with permitted utilities.",
    links: [
      {
        label: "Jackson County Development Services",
        href: "https://jacksoncountyor.gov/departments/development_services/",
      },
    ],
  },
  {
    name: "Benton County",
    summary:
      "Benton County Community Development covers unincorporated areas including much of the Corvallis region outside city limits. Local ordinances control THOW classification.",
    parkModel:
      "Confirm park-model / THOW occupancy duration and utility rules with Community Development before delivery.",
    links: [
      {
        label: "Benton County Community Development",
        href: "https://www.co.benton.or.us/cd",
      },
    ],
  },
];

export const COMMUNITIES: TinyHomeCommunity[] = [
  {
    name: "Verify local RV / tiny-home parks",
    address: "Oregon — jurisdiction-specific",
    notes:
      "When zoning requires a designated park, use county or city planning directories and Oregon Parks / private park operators to confirm current residency and hookup rules. Availability changes; do not rely on outdated listings.",
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "Does Oregon treat a THOW as an ADU automatically?",
    answer:
      "No. Oregon does not treat a tiny home on wheels as an automatic ADU. Lawfulness turns on local zoning classification (RV, park model, temporary dwelling, or companion unit) plus building and occupancy rules. Confirm with the city or county before buying land or delivering a unit.",
  },
  {
    question: "Can I live full-time in a park model in Oregon?",
    answer:
      "Sometimes — for example Portland’s one occupied recreational vehicle / THOW path on a developed residential lot, or rural county pathways where local ordinances expressly allow longer-term placement. Many jurisdictions still limit park models to RV parks or temporary use. Always verify occupancy classification.",
  },
  {
    question: "What certifications matter in Oregon?",
    answer:
      "NOAH, ANSI A119.5, and RVIA documentation support certification fit. They do not replace local zoning approval. Delivery may also need ODOT over-dimension permits when width or height exceeds legal dimensions (8 ft 6 in / 14 ft 0 in).",
  },
  {
    question: "How do transport rules affect delivery?",
    answer:
      "Oregon legal width is 8 ft 6 in and height 14 ft 0 in. Anything over needs an over-dimension permit. Pilot-vehicle needs are route- and attachment-specific — never assume a blanket no-pilot clearance. Complete a hauler route review before delivery.",
  },
  {
    question: "Where should I start before buying land?",
    answer:
      "Identify whether the parcel is city or unincorporated county, ask Planning how a certified THOW or park-model RV is classed on that lot, confirm utility hookups for the intended occupancy duration, then complete transport permits. This guide is informational only.",
  },
];

export const GUIDE_DISCLAIMER = formatRegulationsDisclaimer(
  "Oregon pages summarize published statewide doctrine and selected local guides — local zoning controls placement. Ordinances change; verify with the jurisdiction that will issue your permit.",
);

export const OR_GUIDE_CONTENT: StateTinyHomeGuideContent = {
  stateCode: "OR",
  stateName: "Oregon",
  defaultActiveHref: "/regulations/oregon",
  eyebrow: "Oregon · Cascadia THOW context",
  intro: GUIDE_INTRO,
  codeBaseline: {
    sectionTitle: "Statewide baseline (not local zoning)",
    metrics: [
      { label: "Legal highway width", value: OR_CODE_BASELINE.legalWidth },
      { label: "Legal highway height", value: OR_CODE_BASELINE.legalHeight },
      {
        label: "Park-model living area (typical)",
        value: `${OR_CODE_BASELINE.parkModelTypicalSqFt} sq ft set-up`,
      },
    ],
  },
  parkModelOverview: PARK_MODEL_OVERVIEW,
  countyGuides: {
    sectionTitle: "What counties and cities allow tiny houses?",
    intro:
      "Oregon permission is local. Expand a county for short summaries and official planning links. Coverage focuses on major metros and documented pathways — many rural counties remain unclear until you call Planning.",
    counties: COUNTY_GUIDES,
  },
  directories: {
    title: "Official resource directories",
    description: "County planning links and major city resources",
    countyTitle: "County & state resource directory",
    countyDescription:
      "Direct links to planning, land use, and ODOT over-dimension materials.",
    countyLinks: COUNTY_DIRECTORY,
    cityTitle: "Major cities",
    cityDescription:
      "City rules can differ from the surrounding county—check both.",
    cityLinks: CITY_DIRECTORY,
  },
  unclear: {
    sectionTitle: "Counties with unclear park-model rules",
    intro:
      "Published guidance for park models / THOWs is thin in these counties. Contact planning or building staff before assuming permanence.",
    links: UNCLEAR_COUNTIES,
  },
  permitOverview: PERMIT_OVERVIEW,
  communities: {
    title: "Park & community placement",
    description: "When local rules require a designated park",
    intro:
      "If zoning requires an RV or special-occupancy park, verify current availability and residency rules with the operator and the local jurisdiction. Listings change; confirm before delivery.",
    items: COMMUNITIES,
  },
  faqs: FAQS,
  disclaimer: GUIDE_DISCLAIMER,
  actions: {
    primary: {
      label: "Check an Oregon address",
      href: "/",
    },
    secondary: {
      label: "Washington regulations",
      href: "/regulations/washington",
      variant: "outline",
    },
    jumpToCounties: {
      label: "Jump to county guides",
      href: "#county-guides",
    },
  },
  asideCta: {
    lead: "Ready to screen an Oregon lot for THOW placement?",
    linkLabel: "Open the lot eligibility checker",
    href: "/",
  },
};
