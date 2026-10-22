/**
 * Washington tiny-home / park-model / L&I regulation guide content.
 * Informational summaries only — verify with city or county Planning/Building.
 * Doctrine backbone: src/lib/regulations/states/wa.ts (L&I vs PMRV, transport).
 */

import { formatRegulationsDisclaimer } from "@/lib/regulations/agent";
import type {
  FaqItem,
  JurisdictionNote,
  ResourceLink,
  StateTinyHomeGuideContent,
  TinyHomeCommunity,
} from "@/lib/content/state-tiny-home-guide-types";

/** Statewide framing metrics for Washington L&I / park-trailer context. */
export const WA_CODE_BASELINE = {
  codeYear: "WSBC / L&I",
  parkTrailerMaxSqFt: 400,
  legalWidth: "8 ft 6 in",
  escortWidthTrigger: "11 ft",
  wacParkTrailer: "WAC 296-150P",
} as const;

export const GUIDE_INTRO = {
  title: "Tiny Home Regulations in Washington",
  subtitle: "County and city guide for park models, THOWs, and L&I dwellings",
  lead: "Washington does not treat a tiny home on wheels as an automatic ADU. Placement depends on local zoning and whether the unit is classed as a park-model RV, recreational vehicle, or a factory-built / L&I dwelling path. Use this guide to orient, then confirm with your city or county before you buy land or deliver a unit.",
  buildingCodeNote: `Washington distinguishes recreational park trailers (≤${WA_CODE_BASELINE.parkTrailerMaxSqFt} sq ft set-up, ANSI A119.5 under ${WA_CODE_BASELINE.wacParkTrailer}) from factory-built / L&I tiny houses built to the Washington State Building Code. Legal highway width is ${WA_CODE_BASELINE.legalWidth}; oversize loads need WSDOT permits. Local zoning controls where any class may sit.`,
} as const;

export const PARK_MODEL_OVERVIEW = {
  title: "Are park models the same as tiny homes?",
  body: "In Washington, recreational park trailers / park-model RVs (WAC 296-150P) differ from L&I factory-built tiny houses built to the state building code. Recreational seals are not the same as a permanent dwelling permit. Local jurisdictions decide occupancy duration and placement.",
  livingFullTime:
    "Many counties treat wheels-on park models as recreational or temporary unless they sit in an approved park or a local ordinance expressly allows longer occupancy. Foundation-mounted or L&I-approved tiny houses follow a different path and still need local zoning approval.",
  ansiNote:
    "NOAH residential certification differs from ANSI A119.5 recreational seals. Match the seal to the occupancy you intend, then confirm with Planning/Building and — for factory-built units — Washington L&I.",
} as const;

export const PERMIT_OVERVIEW = {
  title: "Do you need a permit?",
  body: "Usually yes for permanent or long-term occupancy. Ask whether the unit is evaluated as a park-model RV or under a factory-built / L&I dwelling path — that answer drives inspections, utilities, and land-use permits. WSDOT oversize permits for delivery are separate from local placement approval.",
} as const;

export const COUNTY_DIRECTORY: ResourceLink[] = [
  {
    label: "King County — Permits",
    href: "https://kingcounty.gov/permits",
  },
  {
    label: "Pierce County — Planning",
    href: "https://www.piercecountywa.gov/4746/Planning",
  },
  {
    label: "Snohomish County — Planning & Development Services",
    href: "https://snohomishcountywa.gov/1598/Planning-Development-Services",
  },
  {
    label: "Thurston County — Community Planning",
    href: "https://www.thurstoncountywa.gov/departments/community-planning-and-economic-development",
  },
  {
    label: "Spokane County — Building & Planning",
    href: "https://www.spokanecounty.org/1230/Building-and-Planning",
  },
  {
    label: "Clark County — Community Planning",
    href: "https://clark.wa.gov/community-planning",
  },
  {
    label: "Whatcom County — Planning & Development Services",
    href: "https://www.whatcomcounty.us/277/Planning-Development-Services",
  },
  {
    label: "WA L&I — Modular & mobile structures",
    href: "https://lni.wa.gov/licensing-permits/manufactured-modular-mobile-structures/modular-other-mobile-structures/",
  },
  {
    label: "WSDOT — Oversize / overweight permits",
    href: "https://wsdot.wa.gov/travel/commercial-vehicles/commercial-vehicle-permits",
  },
];

export const CITY_DIRECTORY: ResourceLink[] = [
  {
    label: "Seattle — SDCI",
    href: "https://www.seattle.gov/sdci",
  },
  {
    label: "Tacoma — Planning & Development Services",
    href: "https://www.cityoftacoma.org/government/city_departments/planning_and_development_services",
  },
  {
    label: "Spokane — Building Services",
    href: "https://my.spokanecity.org/building/",
  },
  {
    label: "Olympia — Community Planning & Development",
    href: "https://www.olympiawa.gov/government/departments/community_planning_and_development",
  },
  {
    label: "Vancouver — Community Development",
    href: "https://www.cityofvancouver.us/community-development/",
  },
  {
    label: "Bellevue — Development Services",
    href: "https://bellevuewa.gov/city-government/departments/development-services",
  },
];

export const UNCLEAR_COUNTIES: ResourceLink[] = [
  {
    label: "Kitsap County — Department of Community Development",
    href: "https://www.kitsapgov.com/dcd",
  },
  {
    label: "Skagit County — Planning & Development Services",
    href: "https://www.skagitcounty.net/Departments/PlanningAndPermit/",
  },
  {
    label: "Island County — Planning & Community Development",
    href: "https://www.islandcountywa.gov/207/Planning-Community-Development",
  },
  {
    label: "Yakima County — Public Services / Planning",
    href: "https://www.yakimacounty.us/1088/Planning-Division",
  },
  {
    label: "Benton County (WA) — Planning",
    href: "https://www.bentoncountywa.gov/pview.aspx?id=1365&catid=45",
  },
];

export const COUNTY_GUIDES: JurisdictionNote[] = [
  {
    name: "King County",
    summary:
      "King County and its cities generally expect permanent tiny dwellings on foundations that meet building and zoning codes. Wheels-on park models are commonly treated as RVs with limited permanent occupancy outside approved parks — confirm with permitting staff for the specific address.",
    parkModel:
      "Do not assume a park-model RV may be a full-time residence on a private lot. Ask whether the path is recreational / park placement, or a foundation / L&I dwelling with local permits.",
    links: [
      {
        label: "King County permits",
        href: "https://kingcounty.gov/permits",
      },
    ],
    cities: [
      {
        name: "Seattle",
        summary:
          "Seattle SDCI administers building and land use. Detached accessory dwelling units and foundation-mounted tiny houses follow city DADU / building rules. Tiny homes on wheels are generally classed as RVs and are not a substitute for a permitted dwelling on a private lot.",
        parkModel:
          "Confirm current SDCI guidance before relying on wheels-on occupancy. Sanctioned villages or transitional housing programs are separate from private-lot placement.",
        links: [
          {
            label: "Seattle SDCI",
            href: "https://www.seattle.gov/sdci",
          },
        ],
      },
      {
        name: "Bellevue",
        summary:
          "Bellevue Development Services reviews zoning and building for city lots. Confirm THOW / park-model / ADU classification locally — do not assume King County unincorporated rules apply.",
        links: [
          {
            label: "Bellevue Development Services",
            href: "https://bellevuewa.gov/city-government/departments/development-services",
          },
        ],
      },
    ],
  },
  {
    name: "Pierce County",
    summary:
      "Pierce County Planning and the Tacoma region distinguish foundation-mounted tiny dwellings from recreational park models. Permanent residential tiny homes are typically expected to meet IRC / local building standards on an approved foundation.",
    parkModel:
      "Park-model RVs may have different permit expectations than site-built or L&I dwellings. Ask Planning whether full-time occupancy on private land is allowed or limited to approved parks.",
    links: [
      {
        label: "Pierce County Planning",
        href: "https://www.piercecountywa.gov/4746/Planning",
      },
    ],
    cities: [
      {
        name: "Tacoma",
        summary:
          "City of Tacoma Planning & Development Services controls city addresses. Verify park-model vs dwelling classification before delivery.",
        links: [
          {
            label: "Tacoma Planning & Development",
            href: "https://www.cityoftacoma.org/government/city_departments/planning_and_development_services",
          },
        ],
      },
    ],
  },
  {
    name: "Snohomish County",
    summary:
      "Snohomish County Planning & Development Services covers unincorporated areas; cities such as Everett apply municipal codes. THOW permanence is not statewide — confirm zone and use class for the parcel.",
    parkModel:
      "Published park-model permanence guidance is limited. Contact PDS or the city building department before assuming wheels-on residential use.",
    links: [
      {
        label: "Snohomish County PDS",
        href: "https://snohomishcountywa.gov/1598/Planning-Development-Services",
      },
    ],
  },
  {
    name: "Thurston County",
    summary:
      "Thurston County Community Planning covers the Olympia region’s unincorporated land; Olympia, Lacey, and Tumwater set city rules. Foundation paths and recreational classifications differ — ask which applies to your unit.",
    parkModel:
      "Confirm whether a park-model RV may be occupied long-term on the lot or only in approved parks, and whether an L&I or local building path is required for a dwelling-class tiny house.",
    links: [
      {
        label: "Thurston County Community Planning",
        href: "https://www.thurstoncountywa.gov/departments/community-planning-and-economic-development",
      },
    ],
    cities: [
      {
        name: "Olympia",
        summary:
          "Olympia Community Planning & Development reviews city lots. Do not assume county unincorporated pathways apply inside city limits.",
        links: [
          {
            label: "Olympia CPD",
            href: "https://www.olympiawa.gov/government/departments/community_planning_and_development",
          },
        ],
      },
    ],
  },
  {
    name: "Spokane County",
    summary:
      "Spokane County Building & Planning administers unincorporated standards; the City of Spokane applies city codes. Eastern Washington jurisdictions often require clear dwelling vs recreational classification.",
    parkModel:
      "Ask whether the unit is a recreational park trailer under WAC 296-150P or a factory-built / local dwelling path — seals and occupancy rules differ.",
    links: [
      {
        label: "Spokane County Building & Planning",
        href: "https://www.spokanecounty.org/1230/Building-and-Planning",
      },
    ],
    cities: [
      {
        name: "Spokane",
        summary:
          "City of Spokane Building Services handles permits inside city limits. Confirm THOW / park-model / tiny-house classification before purchase.",
        links: [
          {
            label: "Spokane Building Services",
            href: "https://my.spokanecity.org/building/",
          },
        ],
      },
    ],
  },
  {
    name: "Clark County",
    summary:
      "Clark County (Washington) Community Planning covers unincorporated areas across from Portland; Vancouver and other cities apply municipal codes. Cross-state delivery still follows WSDOT rules on the Washington side.",
    parkModel:
      "Confirm local RV / park-model / dwelling classification. Do not assume Oregon city pathways (for example Portland occupied-RV rules) apply in Clark County.",
    links: [
      {
        label: "Clark County Community Planning",
        href: "https://clark.wa.gov/community-planning",
      },
    ],
    cities: [
      {
        name: "Vancouver",
        summary:
          "City of Vancouver Community Development reviews zoning and building for city addresses.",
        links: [
          {
            label: "Vancouver Community Development",
            href: "https://www.cityofvancouver.us/community-development/",
          },
        ],
      },
    ],
  },
  {
    name: "Whatcom County",
    summary:
      "Whatcom County Planning & Development Services covers Bellingham-area unincorporated land. Tiny-home and park-model rules are local — start with PDS for zone and use questions.",
    parkModel:
      "Stance on full-time park-model occupancy is not always explicit in published guides. Contact PDS before assuming permanence.",
    links: [
      {
        label: "Whatcom County PDS",
        href: "https://www.whatcomcounty.us/277/Planning-Development-Services",
      },
    ],
  },
];

export const COMMUNITIES: TinyHomeCommunity[] = [
  {
    name: "Verify local RV / tiny-home parks",
    address: "Washington — jurisdiction-specific",
    notes:
      "When zoning requires a designated park or mobile-home community, confirm residency, hookups, and park-model acceptance with the operator and local jurisdiction. Availability and rules change.",
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "Does Washington treat a THOW as an ADU automatically?",
    answer:
      "No. Washington does not treat a tiny home on wheels as an automatic ADU. Placement depends on local zoning and whether the unit is a park-model RV, recreational vehicle, or factory-built / L&I dwelling. Local THOW-as-ADU or companion-unit ordinances are jurisdiction-specific.",
  },
  {
    question: "What is the difference between L&I tiny houses and park models?",
    answer:
      "L&I factory-built tiny houses are built to the Washington State Building Code (typically ≤400 sq ft dwelling definition in L&I materials). Recreational park trailers follow WAC 296-150P / ANSI A119.5 and are primarily for temporary, recreational, or seasonal use. Local zoning still controls where either may sit.",
  },
  {
    question: "Can I live full-time in a park model in Washington?",
    answer:
      "Often only in approved parks or where a local ordinance expressly allows longer occupancy. Many jurisdictions expect permanent tiny dwellings on foundations with building permits. Always verify occupancy classification before purchase.",
  },
  {
    question: "How do transport rules affect delivery?",
    answer:
      "Legal width is 8 ft 6 in; oversize loads need a WSDOT permit. Under WAC 468-38-100(1)(a), loads over 11 ft width generally require two pilot/escort vehicles on two-lane highways. Prefer route-qualified hauler review — never assume a blanket no-escort clearance.",
  },
  {
    question: "Where should I start before buying land?",
    answer:
      "Identify city vs unincorporated county, ask Planning how a certified THOW or park-model RV is classed, confirm utility hookups, and complete WSDOT permits for delivery. For factory-built dwellings, review Washington L&I modular / FAS guidance. This guide is informational only.",
  },
];

export const GUIDE_DISCLAIMER = formatRegulationsDisclaimer(
  "Washington pages summarize published statewide doctrine and selected local guides — local zoning controls placement. Ordinances change; verify with the jurisdiction that will issue your permit.",
);

export const WA_GUIDE_CONTENT: StateTinyHomeGuideContent = {
  stateCode: "WA",
  stateName: "Washington",
  defaultActiveHref: "/regulations/washington",
  eyebrow: "Washington · Cascadia THOW context",
  intro: GUIDE_INTRO,
  codeBaseline: {
    sectionTitle: "Statewide baseline (L&I / transport)",
    metrics: [
      {
        label: "Park trailer max set-up",
        value: `≤${WA_CODE_BASELINE.parkTrailerMaxSqFt} sq ft (WAC 296-150P)`,
      },
      { label: "Legal highway width", value: WA_CODE_BASELINE.legalWidth },
      {
        label: "Two-escort width trigger",
        value: `>${WA_CODE_BASELINE.escortWidthTrigger} on two-lane highways`,
      },
    ],
  },
  parkModelOverview: PARK_MODEL_OVERVIEW,
  countyGuides: {
    sectionTitle: "What counties and cities allow tiny houses?",
    intro:
      "Washington permission is local and often splits foundation dwellings from recreational park models. Expand a county for short summaries and official links. Coverage focuses on major metros — many counties remain unclear until you call Planning.",
    counties: COUNTY_GUIDES,
  },
  directories: {
    title: "Official resource directories",
    description: "County planning links, L&I, and major cities",
    countyTitle: "County & state resource directory",
    countyDescription:
      "Direct links to planning, L&I modular guidance, and WSDOT permits.",
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
      "If zoning requires an RV or mobile-home park, verify current availability and residency rules with the operator and the local jurisdiction.",
    items: COMMUNITIES,
  },
  faqs: FAQS,
  disclaimer: GUIDE_DISCLAIMER,
  actions: {
    primary: {
      label: "Check a Washington address",
      href: "/",
    },
    secondary: {
      label: "Oregon regulations",
      href: "/regulations/oregon",
      variant: "outline",
    },
    jumpToCounties: {
      label: "Jump to county guides",
      href: "#county-guides",
    },
  },
  asideCta: {
    lead: "Ready to screen a Washington lot for THOW placement?",
    linkLabel: "Open the lot eligibility checker",
    href: "/",
  },
};
