/**
 * California tiny-home / park-model regulation guide content.
 * Summaries are informational only — always verify with local planning/building staff.
 * CBC size rules cite Appendix AQ / California Residential Code habitable-room standards.
 */

import { formatRegulationsDisclaimer } from "@/lib/regulations/agent";

export type ResourceLink = {
  label: string;
  href: string;
};

export type JurisdictionNote = {
  name: string;
  summary: string;
  parkModel?: string;
  links: ResourceLink[];
  cities?: JurisdictionNote[];
};

export type TinyHomeCommunity = {
  name: string;
  address: string;
  notes: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const CBC_BASELINE = {
  codeYear: "2025",
  ceilingHeight: "7 ft 6 in",
  primaryRoomSqFt: 120,
  additionalRoomSqFt: 70,
  appendix: "Appendix AQ (Tiny Houses)",
} as const;

export const GUIDE_INTRO = {
  title: "Tiny Home Regulations in California",
  subtitle: "County guide for park models, THOWs, and ADU pathways",
  lead: "California is broadly friendly to tiny living, but permission almost always turns on local zoning, building codes, and whether the unit is site-built, foundation-mounted, or a park model / tiny home on wheels (THOW). Use this guide to orient, then confirm with your city or county before you buy or place a unit.",
  buildingCodeNote: `Many jurisdictions follow the ${CBC_BASELINE.codeYear} California Building / Residential Code (effective statewide January 1, 2026; ${CBC_BASELINE.appendix} where adopted). Typical permanent-dwelling minima include a ceiling height of ${CBC_BASELINE.ceilingHeight}, one habitable room of at least ${CBC_BASELINE.primaryRoomSqFt} sq ft, and at least ${CBC_BASELINE.additionalRoomSqFt} sq ft net floor area for each additional habitable room. Local amendments and ADU ordinances can be stricter or more specific.`,
} as const;

export const PARK_MODEL_OVERVIEW = {
  title: "Are park models the same as tiny homes?",
  body: "Park models are a common form of tiny home on wheels (THOW). Because they sit on a chassis, many localities do not treat them as permanent dwellings unless they meet RVIA/ANSI standards, sit in a permitted park, or are placed on an approved foundation and used as an ADU. California often allows THOWs as ADUs where local ordinances expressly authorize moveable tiny houses.",
  livingFullTime:
    "Full-time occupancy rules vary by county. Some areas allow park models only in RV / special occupancy parks, some allow them as ADUs once wheels/tongue are removed and utilities are permitted, and some prohibit THOWs as permanent residences entirely.",
  ansiNote:
    "Where THOWs are allowed as permanent residences or ADUs, jurisdictions commonly require ANSI A119.5 compliance, DMV registration, size limits for highway movement, and skirting or residential exterior appearance.",
} as const;

export const PERMIT_OVERVIEW = {
  title: "Do you need a permit?",
  body: "Usually yes. Building permits, ADU / special-use permits, foundation permits, and sometimes Temporary Occupancy (TEM) permits apply depending on the path. Always contact the local building or planning department before delivery.",
} as const;

export const COUNTY_DIRECTORY: ResourceLink[] = [
  {
    label: "Alameda County — Code of Ordinances",
    href: "https://library.municode.com/ca/alameda_county/codes/code_of_ordinances?nodeId=TIT17ZO_CH17.04DE_17.04.010DE",
  },
  {
    label: "Alameda County — Government services",
    href: "https://www.acgov.org/services/",
  },
  {
    label: "Alpine County — ADU information sheet",
    href: "https://alpinecountyca.gov/DocumentCenter/View/4389/Accessory-Dwelling-Unit--Information-Sheet-2022_Final?bidId=",
  },
  {
    label: "Alpine County — Tiny home requirements (PDF)",
    href: "https://files.ctctcdn.com/4d29178d401/ddccfe12-c56f-48cf-8ed9-8bbec86bb521.pdf",
  },
  {
    label: "Calaveras County — Planning",
    href: "https://planning.calaverasgov.us/",
  },
  {
    label: "Calaveras County — Building",
    href: "https://building.calaverasgov.us/",
  },
  {
    label: "Colusa County — Community Development",
    href: "https://www.countyofcolusaca.gov/25/Community-Development-Department",
  },
  {
    label: "Colusa County — Zoning code",
    href: "https://www.codepublishing.com/CA/ColusaCounty/#!/ColusaCounty44.html",
  },
  {
    label: "Contra Costa County — Building regulations",
    href: "https://library.municode.com/ca/contra_costa_county/codes/ordinance_code?nodeId=TIT7BURE",
  },
  {
    label: "Contra Costa County — Code Enforcement",
    href: "https://www.contracosta.ca.gov/4725/Code-Enforcement",
  },
  {
    label: "Del Norte County — Planning",
    href: "https://www.co.del-norte.ca.us/departments/Planning/",
  },
  {
    label: "Del Norte County — ADU FAQs",
    href: "https://www.co.del-norte.ca.us/departments/Planning/FrequentlyAskedQuestionsaboutADUs",
  },
  {
    label: "El Dorado County — Planning & Building",
    href: "https://www.eldoradocounty.ca.gov/Land-Use/Planning-and-Building",
  },
  {
    label: "Fresno County — Building Safety",
    href: "https://www.fresnocountyca.gov/Departments/Public-Works-and-Planning/divisions-of-public-works-and-planning/development-services-division/building-safety",
  },
  {
    label: "Humboldt County — Tiny House Fact Sheet",
    href: "https://humboldtgov.org/DocumentCenter/View/71398/Tiny-House-Fact-Sheet",
  },
  {
    label: "Humboldt County — Planning & Building",
    href: "https://humboldtgov.org/2546/Planning-Building",
  },
  {
    label: "Imperial County — Building Division",
    href: "https://www.icpds.com/building",
  },
  {
    label: "Imperial County — Title 9 Div 10 (PDF)",
    href: "https://www.icpds.com/assets/planning/ordinances/TITLE-9-Div-10.pdf",
  },
  {
    label: "Inyo County — Building & Safety",
    href: "https://www.inyocounty.us/services/public-works/building-and-safety",
  },
  {
    label: "Kern County — Code of Ordinances",
    href: "https://library.municode.com/ca/kern_county/codes/code_of_ordinances?nodeId=TIT17BUCO_CH17.08BUCO_17.08.030CABUCODO",
  },
  {
    label: "Kings County — Community Development Agency",
    href: "https://www.countyofkingsca.gov/departments/community-development-agency/",
  },
  {
    label: "Lake County — Community Development",
    href: "https://www.lakecountyca.gov/410/Community-Development",
  },
  {
    label: "Lassen County — Planning & Building",
    href: "https://www.lassencounty.org/dept/planning-and-building-services/planning-and-building-services",
  },
  {
    label: "Los Angeles County — Moveable Tiny House guidance",
    href: "https://ladbs.org/docs/default-source/publications/information-bulletins/zoning-code/ib-p-zc-2020-021-guidelines-for-construction-of-adu.pdf?sfvrsn=4e15f653_20",
  },
  {
    label: "Madera County — Building Division",
    href: "https://www.maderacounty.com/government/community-economic-development-department/divisions/building-division",
  },
  {
    label: "Marin County — Building Code",
    href: "https://library.municode.com/ca/marin_county/codes/municipal_code?nodeId=TIT19MACOBUCO_CH19.04BURE",
  },
  {
    label: "Mariposa County — Planning",
    href: "https://www.mariposacounty.org/80/Planning",
  },
  {
    label: "Mendocino County — Planning & Building",
    href: "https://www.mendocinocounty.gov/government/planning-building-services",
  },
  {
    label: "Merced County — Planning",
    href: "https://www.countyofmerced.com/2374/Planning",
  },
  {
    label: "Modoc County — Building & Safety",
    href: "https://www.co.modoc.ca.us/departments/building_and_safety/index.php",
  },
  {
    label: "Mono County — Building regulations",
    href: "https://library.municode.com/ca/mono_county/codes/code_of_ordinances?nodeId=TIT15BUCO_CH15.04BURE",
  },
  {
    label: "Napa County — Planning, Building & Environmental Services",
    href: "https://www.countyofnapa.org/589/Planning-Building-Environmental-Services",
  },
  {
    label: "Nevada County — THOW ordinance notice",
    href: "https://readynevadacounty.org/DocumentCenter/View/53981/2024-Tiny-Homes-on-Wheels-THOW-Ordinance-Notice",
  },
  {
    label: "Orange County — Development Services",
    href: "https://ocds.ocpublicworks.com/",
  },
  {
    label: "Placer County — Tiny Homes",
    href: "https://www.placer.ca.gov/9218/Tiny-Homes-in-Placer-County",
  },
  {
    label: "Plumas County — Tiny House Information Guide",
    href: "https://www.plumascounty.us/DocumentCenter/View/42508/Tiny-House-Information-Guide?bidId=",
  },
  {
    label: "Riverside County — Building & Safety",
    href: "https://building.rctlma.org/",
  },
  {
    label: "Sacramento County",
    href: "https://www.saccounty.gov/",
  },
  {
    label: "San Benito County — Tiny Homes (AmLegal)",
    href: "https://codelibrary.amlegal.com/codes/sanbenitocounty/latest/sanbenito_ca/0-0-0-38475",
  },
  {
    label: "San Bernardino County — Land Use Services",
    href: "https://lus.sbcounty.gov/",
  },
  {
    label: "San Diego — Movable Tiny House bulletin",
    href: "https://www.sandiego.gov/sites/default/files/dsdib403.pdf",
  },
  {
    label: "San Francisco — Building",
    href: "https://www.sf.gov/topics--building",
  },
  {
    label: "San Francisco — Planning",
    href: "https://sfplanning.org/",
  },
  {
    label: "San Joaquin County — Community Development",
    href: "https://www.sjgov.org/commdev/cgi-bin/cdyn.exe",
  },
  {
    label: "San Luis Obispo County — Movable Tiny Houses",
    href: "https://www.slocounty.ca.gov/departments/planning-building/how-to-apply-for-a-permit-in-unincorporated-slo-co/land-use,-subdivision,-zoning/land-use-permit/land-use-permit/accessory-dwelling-unit/movable-tiny-houses",
  },
  {
    label: "Santa Barbara County — Planning & Development",
    href: "https://www.countyofsb.org/160/Planning-Development",
  },
  {
    label: "Santa Clara County — Planning & Development",
    href: "https://plandev.santaclaracounty.gov/home",
  },
  {
    label: "Santa Cruz County — Tiny Homes on Wheels",
    href: "https://cdi.santacruzcountyca.gov/Planning/PolicyPlanning/TinyHomes.aspx",
  },
  {
    label: "Shasta County — Building Division",
    href: "https://www.shastacounty.gov/building",
  },
  {
    label: "Sierra County — Planning",
    href: "https://www.sierracounty.ca.gov/251/Planning",
  },
  {
    label: "Siskiyou County — Planning",
    href: "https://www.siskiyoucounty.gov/planning",
  },
  {
    label: "Solano County — Building & Safety",
    href: "https://www.solanocounty.com/depts/rm/buildingnsafety/about.asp",
  },
  {
    label: "Sonoma County — Tiny Houses",
    href: "https://permitsonoma.org/regulationsandlongrangeplans/regulationsandinitiatives/housingtypes/tinyhouses",
  },
  {
    label: "Stanislaus County — Planning",
    href: "https://www.stancounty.com/planning/",
  },
  {
    label: "Sutter County — Planning & Zoning",
    href: "https://www.suttercounty.org/community/residents/home-property/planning-and-zoning",
  },
  {
    label: "Tehama County — Building & Safety",
    href: "https://www.tehama.gov/government/departments/building-and-safety/",
  },
  {
    label: "Trinity County — Departments",
    href: "https://www.trinitycounty.org/159/Departments",
  },
  {
    label: "Tulare County — Planning & Building",
    href: "https://tularecounty.ca.gov/rma/planning-building/",
  },
  {
    label: "Tuolumne County — Building Division",
    href: "https://www.tuolumnecounty.ca.gov/171/Building-Division",
  },
  {
    label: "Ventura County",
    href: "https://www.ventura.org/",
  },
  {
    label: "Yolo County — Building Services",
    href: "https://www.yolocounty.gov/government/general-government-departments/community-services/building-inspection-services",
  },
  {
    label: "Yuba County — Building Department",
    href: "http://www.yuba.gov/departments/community_development/building_department/index.php",
  },
];

export const CITY_DIRECTORY: ResourceLink[] = [
  {
    label: "Anaheim — Planning & Building",
    href: "https://www.anaheim.net/490/Planning-Building",
  },
  {
    label: "Bakersfield — Building Division",
    href: "https://www.bakersfieldcity.us/184/Building-Division",
  },
  {
    label: "Fresno — Building Safety (county)",
    href: "https://www.fresnocountyca.gov/Departments/Public-Works-and-Planning/divisions-of-public-works-and-planning/development-services-division/building-safety",
  },
  {
    label: "Long Beach — Building & Safety",
    href: "https://www.longbeach.gov/lbcd/building/",
  },
  {
    label: "Los Angeles — City",
    href: "https://lacity.gov/",
  },
  {
    label: "Oakland — Vehicular residential facilities / THOW",
    href: "https://www.oaklandca.gov/services/apply-for-vehicular-residential-facilities-occupied-recreational-vehicles-rvs-and-tiny-homes-on-wheels",
  },
  {
    label: "Sacramento — Building Division contacts",
    href: "https://www.cityofsacramento.gov/community-development/contact-cdd/building-division-contacts",
  },
  {
    label: "San Diego — Movable Tiny Homes",
    href: "https://www.sandiego.gov/sites/default/files/dsdib403.pdf",
  },
  {
    label: "San Francisco — Building codes",
    href: "https://www.sf.gov/resource--2022--current-san-francisco-building-codes",
  },
  {
    label: "San Jose — ADUs",
    href: "https://www.sanjoseca.gov/business/development-services-permit-center/accessory-dwelling-units-adus",
  },
];

export const UNCLEAR_COUNTIES: ResourceLink[] = [
  {
    label: "Amador County — Building",
    href: "https://www.amadorgov.org/departments/building",
  },
  {
    label: "Amador County — Planning",
    href: "https://www.amadorgov.org/departments/planning",
  },
  {
    label: "Butte County — Public Works",
    href: "https://www.buttecounty.net/807/Public-Works",
  },
  {
    label: "Glenn County — Planning",
    href: "https://www.countyofglenn.net/government/departments/planning-community-development-services/planning",
  },
  {
    label: "Monterey County — Code of Ordinances",
    href: "https://library.municode.com/ca/monterey_county/codes/code_of_ordinances?nodeId=TIT21ZO_CH21.64SPRE_21.64.030REACDWUNJUACDWUN",
  },
  {
    label: "San Mateo County — Planning & Building",
    href: "https://www.smcgov.org/planning",
  },
];

/** County-by-county narrative summaries for the expandable guide. */
export const COUNTY_GUIDES: JurisdictionNote[] = [
  {
    name: "Alameda County",
    summary:
      "Favorable for tiny homes generally. Units are commonly capped around 400 sq ft of floor area excluding lofts; minimum floor area may be set case-by-case by planning staff.",
    parkModel:
      "Park-model / THOW rules are not always explicit—confirm with county or city staff before relying on wheels-on occupancy.",
    links: [
      {
        label: "Code of Ordinances",
        href: "https://library.municode.com/ca/alameda_county/codes/code_of_ordinances?nodeId=TIT17ZO_CH17.04DE_17.04.010DE",
      },
      {
        label: "County services",
        href: "https://www.acgov.org/services/",
      },
    ],
    cities: [
      {
        name: "Oakland",
        summary:
          "Allows both foundation tiny homes and tiny homes on wheels through the city’s vehicular residential / THOW pathway. A permit is required.",
        links: [
          {
            label: "Apply for vehicular residential facilities",
            href: "https://www.oaklandca.gov/services/apply-for-vehicular-residential-facilities-occupied-recreational-vehicles-rvs-and-tiny-homes-on-wheels",
          },
          {
            label: "Planning & Building",
            href: "https://www.oaklandca.gov/departments/planning-and-building",
          },
        ],
      },
    ],
  },
  {
    name: "Alpine County",
    summary:
      "Allowed when meeting California Building Code minima (ceiling height, 120 / 70 sq ft habitable rooms).",
    parkModel:
      "Park models for permanent residence are typically limited to designated mobile home or special occupancy parks.",
    links: [
      {
        label: "ADU information sheet",
        href: "https://alpinecountyca.gov/DocumentCenter/View/4389/Accessory-Dwelling-Unit--Information-Sheet-2022_Final?bidId=",
      },
      {
        label: "Tiny home requirements (PDF)",
        href: "https://files.ctctcdn.com/4d29178d401/ddccfe12-c56f-48cf-8ed9-8bbec86bb521.pdf",
      },
    ],
  },
  {
    name: "Calaveras County",
    summary:
      "Defers to the 2022 California Building Code for permanent dwellings. Tiny homes that meet CBC room-size and height rules are generally workable.",
    parkModel:
      "Specific park-model permanence rules are unclear—check Building or Planning.",
    links: [
      {
        label: "Planning",
        href: "https://planning.calaverasgov.us/",
      },
      {
        label: "Building",
        href: "https://building.calaverasgov.us/",
      },
    ],
  },
  {
    name: "Colusa County",
    summary:
      "Site-built / code-compliant tiny homes are permitted under 2022 CBC minima.",
    parkModel:
      "Allowed in mobile home / special occupancy parks. Also allowed as ADUs when utilities are county-approved under permit, wheels and tongue are removed, the unit sits on an approved foundation, the exterior reads as a dwelling (not an RV), and matching skirting is installed.",
    links: [
      {
        label: "Community Development",
        href: "https://www.countyofcolusaca.gov/25/Community-Development-Department",
      },
      {
        label: "Zoning code",
        href: "https://www.codepublishing.com/CA/ColusaCounty/#!/ColusaCounty44.html",
      },
    ],
  },
  {
    name: "Del Norte County",
    summary:
      "Tiny homes that meet 2022 CBC standards are welcomed; review the county’s ADU FAQs for accessory pathways.",
    parkModel:
      "Generally expected on a permanent foundation with utility connections for permanent use.",
    links: [
      {
        label: "Planning",
        href: "https://www.co.del-norte.ca.us/departments/Planning/",
      },
      {
        label: "ADU FAQs",
        href: "https://www.co.del-norte.ca.us/departments/Planning/FrequentlyAskedQuestionsaboutADUs",
      },
    ],
  },
  {
    name: "El Dorado County",
    summary:
      "Adopted California Building Code editions with the same core habitable-room minima (≈7 ft ceilings, 120 / 70 sq ft rooms).",
    parkModel: "Exact park-model permanence rules are unclear—confirm locally.",
    links: [
      {
        label: "Planning & Building",
        href: "https://www.eldoradocounty.ca.gov/Land-Use/Planning-and-Building",
      },
    ],
  },
  {
    name: "Fresno County",
    summary:
      "Publishes a dedicated tiny-home bulletin. Typical criteria include a minimum around 100 sq ft, ANSI 119.2 or 119.5 compliance, towable (not self-propelled), detached living with cooking/sleeping, and a conventional building appearance.",
    parkModel:
      "County guidance is comparatively park-model friendly when bulletin criteria are met. The City of Fresno generally follows the same handout.",
    links: [
      {
        label: "Building Safety",
        href: "https://www.fresnocountyca.gov/Departments/Public-Works-and-Planning/divisions-of-public-works-and-planning/development-services-division/building-safety",
      },
      {
        label: "Building & Safety FAQs",
        href: "https://www.fresnocountyca.gov/Departments/Public-Works-and-Planning/divisions-of-public-works-and-planning/development-services-division/building-safety/building-and-safety-faqs",
      },
    ],
  },
  {
    name: "Humboldt County",
    summary:
      "Allows tiny homes and moveable tiny houses as permanent ADUs in inland areas. Also allowed as permanent residences in manufactured-home or special occupancy parks / villages.",
    parkModel: "Moveable units must comply with ANSI A119.5.",
    links: [
      {
        label: "Tiny House Fact Sheet",
        href: "https://humboldtgov.org/DocumentCenter/View/71398/Tiny-House-Fact-Sheet",
      },
      {
        label: "Planning & Building",
        href: "https://humboldtgov.org/2546/Planning-Building",
      },
    ],
  },
  {
    name: "Imperial County",
    summary:
      "Title 9 Division 10 recognizes tiny homes that meet California Building Code requirements, including RVs, manufactured / park models, modular, and site-built dwellings.",
    parkModel:
      "Park models are expressly contemplated in the ordinance framework.",
    links: [
      {
        label: "Building Division",
        href: "https://www.icpds.com/building",
      },
      {
        label: "Title 9 Div 10 (PDF)",
        href: "https://www.icpds.com/assets/planning/ordinances/TITLE-9-Div-10.pdf",
      },
    ],
  },
  {
    name: "Inyo County",
    summary:
      "Tiny homes fall within the dwelling-unit definition when they comply with the California Building Code.",
    links: [
      {
        label: "Building & Safety",
        href: "https://www.inyocounty.us/services/public-works/building-and-safety",
      },
    ],
  },
  {
    name: "Kern County",
    summary:
      "Follows 2022 CBC habitable-room minima for tiny homes. Bakersfield generally mirrors county building requirements.",
    parkModel:
      "Park models for permanent living are typically limited to designated RV or special occupancy parks.",
    links: [
      {
        label: "Code of Ordinances",
        href: "https://library.municode.com/ca/kern_county/codes/code_of_ordinances?nodeId=TIT17BUCO_CH17.08BUCO_17.08.030CABUCODO",
      },
      {
        label: "Bakersfield Building Division",
        href: "https://www.bakersfieldcity.us/184/Building-Division",
      },
    ],
  },
  {
    name: "Kings County",
    summary:
      "Adopted California Building Code standards that allow code-compliant tiny homes.",
    links: [
      {
        label: "Community Development Agency",
        href: "https://www.countyofkingsca.gov/departments/community-development-agency/",
      },
    ],
  },
  {
    name: "Lake County",
    summary: "Allows tiny homes under 2022 CBC standards.",
    parkModel:
      "Permanent park-model status is unclear—verify with Community Development.",
    links: [
      {
        label: "Community Development",
        href: "https://www.lakecountyca.gov/410/Community-Development",
      },
    ],
  },
  {
    name: "Lassen County",
    summary:
      "Uses 2022 CBC minima (≈7 ft ceiling, 120 / 70 sq ft rooms) for tiny homes.",
    parkModel:
      "Confirm park-model permanence with Planning & Building Services.",
    links: [
      {
        label: "Planning & Building",
        href: "https://www.lassencounty.org/dept/planning-and-building-services/planning-and-building-services",
      },
    ],
  },
  {
    name: "Los Angeles County",
    summary:
      "Implements 2022 CBC room minima and expressly addresses moveable tiny houses as permanent ADUs.",
    parkModel:
      "Typical THOW criteria include DMV licensing/registration, ANSI A119.5, not self-propelled, highway size limits, and roughly 150–430 sq ft. Long Beach and the City of Los Angeles may differ—confirm with each municipality.",
    links: [
      {
        label: "Moveable Tiny House / ADU guidance",
        href: "https://ladbs.org/docs/default-source/publications/information-bulletins/zoning-code/ib-p-zc-2020-021-guidelines-for-construction-of-adu.pdf?sfvrsn=4e15f653_20",
      },
      {
        label: "Long Beach Building & Safety",
        href: "https://www.longbeach.gov/lbcd/building/",
      },
    ],
  },
  {
    name: "Madera County",
    summary: "Follows 2022 CBC-friendly room minima for tiny living.",
    parkModel: "Park-model permanence is unclear—confirm with Building.",
    links: [
      {
        label: "Building Division",
        href: "https://www.maderacounty.com/government/community-economic-development-department/divisions/building-division",
      },
    ],
  },
  {
    name: "Marin County",
    summary:
      "Adopted 2022 CBC standards supportive of code-compliant tiny homes.",
    parkModel: "THOW permanence is unclear—ask Building.",
    links: [
      {
        label: "Building Code",
        href: "https://library.municode.com/ca/marin_county/codes/municipal_code?nodeId=TIT19MACOBUCO_CH19.04BURE",
      },
    ],
  },
  {
    name: "Mariposa County",
    summary: "Allows tiny homes meeting 2022 CBC standards.",
    parkModel:
      "Permanent park-model use generally requires a building permit in conjunction with a single-family dwelling permit.",
    links: [
      {
        label: "Planning",
        href: "https://www.mariposacounty.org/80/Planning",
      },
      {
        label: "Building",
        href: "https://www.mariposacounty.org/67/Building",
      },
    ],
  },
  {
    name: "Mendocino County",
    summary:
      "2022 CBC adopted; tiny homes allowed when room/height minima are met.",
    parkModel: "Likely follows statewide park rules—verify before delivery.",
    links: [
      {
        label: "Planning & Building",
        href: "https://www.mendocinocounty.gov/government/planning-building-services",
      },
    ],
  },
  {
    name: "Merced County",
    summary: "Follows 2022 CBC for tiny homes.",
    parkModel:
      "Permanent residence outside RV / special occupancy parks appears limited—confirm locally.",
    links: [
      {
        label: "Planning",
        href: "https://www.countyofmerced.com/2374/Planning",
      },
    ],
  },
  {
    name: "Modoc County",
    summary:
      "Uses an older (2019) CBC edition with larger habitable-room minima (often cited as ≈220 / 100 sq ft).",
    parkModel: "May be permitted—confirm with Building & Safety.",
    links: [
      {
        label: "Building & Safety",
        href: "https://www.co.modoc.ca.us/departments/building_and_safety/index.php",
      },
    ],
  },
  {
    name: "Mono County",
    summary: "2022 CBC adopted with 120 / 70 sq ft room minima.",
    parkModel: "Stance unclear—consult local officials.",
    links: [
      {
        label: "Building regulations",
        href: "https://library.municode.com/ca/mono_county/codes/code_of_ordinances?nodeId=TIT15BUCO_CH15.04BURE",
      },
    ],
  },
  {
    name: "Napa County",
    summary: "Likely allows code-compliant tiny homes under 2022 CBC.",
    parkModel:
      "RVs may be treated similarly to mobile homes for full-time living inside designated parks.",
    links: [
      {
        label: "Planning, Building & Environmental Services",
        href: "https://www.countyofnapa.org/589/Planning-Building-Environmental-Services",
      },
    ],
  },
  {
    name: "Nevada County",
    summary:
      "As of early 2025, the county allows tiny homes / THOWs under its updated ordinance pathway.",
    links: [
      {
        label: "THOW ordinance notice",
        href: "https://readynevadacounty.org/DocumentCenter/View/53981/2024-Tiny-Homes-on-Wheels-THOW-Ordinance-Notice",
      },
    ],
  },
  {
    name: "Orange County",
    summary:
      "Follows 2022 CBC (7 ft 6 in ceiling, 120 / 70 sq ft rooms). Anaheim similarly allows CBC-compliant tiny homes.",
    links: [
      {
        label: "Development Services",
        href: "https://ocds.ocpublicworks.com/",
      },
      {
        label: "Anaheim Planning & Building",
        href: "https://www.anaheim.net/490/Planning-Building",
      },
    ],
  },
  {
    name: "Placer County",
    summary:
      "Allows both conventional tiny homes and park-model / THOW pathways. Review the county’s Tiny Homes page for current criteria.",
    links: [
      {
        label: "Tiny Homes in Placer County",
        href: "https://www.placer.ca.gov/9218/Tiny-Homes-in-Placer-County",
      },
      {
        label: "Community Development",
        href: "https://www.placer.ca.gov/1678/Community-Development",
      },
    ],
  },
  {
    name: "Plumas County",
    summary: "Allows tiny homes under published county guidance.",
    parkModel:
      "THOWs are generally not allowed as permanent residences; campground / RV park use may still be viable.",
    links: [
      {
        label: "Tiny House Information Guide",
        href: "https://www.plumascounty.us/DocumentCenter/View/42508/Tiny-House-Information-Guide?bidId=",
      },
    ],
  },
  {
    name: "Riverside County",
    summary:
      "Allows tiny homes that comply with 2022 CBC including Appendix AQ.",
    links: [
      {
        label: "Building & Safety",
        href: "https://building.rctlma.org/",
      },
    ],
  },
  {
    name: "Sacramento County",
    summary: "Allows tiny homes meeting 2022 CBC standards.",
    parkModel:
      "Wheeled units typically need a permanent foundation and local code compliance. The City of Sacramento similarly allows tiny homes / park models on permanent foundations or in designated parks.",
    links: [
      {
        label: "Sacramento County",
        href: "https://www.saccounty.gov/",
      },
      {
        label: "City Building Division contacts",
        href: "https://www.cityofsacramento.gov/community-development/contact-cdd/building-division-contacts",
      },
    ],
  },
  {
    name: "San Benito County",
    summary:
      "Specific tiny-home legislation: roughly 150–400 sq ft; wheeled units limited to about 14 ft width when towed; skirting required once placed; ANSI A119.5 for park models.",
    links: [
      {
        label: "Tiny Homes ordinance",
        href: "https://codelibrary.amlegal.com/codes/sanbenitocounty/latest/sanbenito_ca/0-0-0-38475",
      },
    ],
  },
  {
    name: "San Bernardino County",
    summary: "Allows CBC-compliant tiny homes.",
    parkModel:
      "THOWs generally not permitted as permanent residences; short-term / lodging use may be a separate path.",
    links: [
      {
        label: "Land Use Services",
        href: "https://lus.sbcounty.gov/",
      },
    ],
  },
  {
    name: "San Diego County",
    summary:
      "Follows 2022 CBC. The City of San Diego publishes a Movable Tiny House bulletin for permanent THOW use—confirm county vs city jurisdiction.",
    links: [
      {
        label: "City Movable Tiny House bulletin",
        href: "https://www.sandiego.gov/sites/default/files/dsdib403.pdf",
      },
    ],
  },
  {
    name: "San Francisco",
    summary:
      "Allows tiny homes that meet 2022 CBC standards. Park models for permanent residence are typically limited to designated settings under statewide rules.",
    parkModel: "Confirm with SF Planning / DBI for ADU or park pathways.",
    links: [
      {
        label: "Building",
        href: "https://www.sf.gov/topics--building",
      },
      {
        label: "Planning",
        href: "https://sfplanning.org/",
      },
      {
        label: "Current building codes",
        href: "https://www.sf.gov/resource--2022--current-san-francisco-building-codes",
      },
    ],
  },
  {
    name: "San Joaquin County",
    summary: "2022 CBC adopted for tiny homes.",
    parkModel: "Park models generally need a designated park location.",
    links: [
      {
        label: "Community Development",
        href: "https://www.sjgov.org/commdev/cgi-bin/cdyn.exe",
      },
    ],
  },
  {
    name: "San Luis Obispo County",
    summary: "2022 CBC allows tiny homes.",
    parkModel:
      "Allowed on a permanent foundation or in designated RV / special occupancy parks. Review the county’s movable tiny house ADU materials.",
    links: [
      {
        label: "Movable Tiny Houses",
        href: "https://www.slocounty.ca.gov/departments/planning-building/how-to-apply-for-a-permit-in-unincorporated-slo-co/land-use,-subdivision,-zoning/land-use-permit/land-use-permit/accessory-dwelling-unit/movable-tiny-houses",
      },
    ],
  },
  {
    name: "Santa Barbara County",
    summary: "Allows tiny homes under 2022 CBC.",
    parkModel:
      "Allowed on permanent foundation or in designated mobile home / RV / special occupancy parks.",
    links: [
      {
        label: "Planning & Development",
        href: "https://www.countyofsb.org/160/Planning-Development",
      },
    ],
  },
  {
    name: "Santa Clara County",
    summary:
      "Allows tiny homes and park models as ADUs under 2022 CBC room minima. San Jose similarly focuses on ADU pathways.",
    parkModel: "Park models as ADUs typically require ANSI A119.5 compliance.",
    links: [
      {
        label: "Planning & Development",
        href: "https://plandev.santaclaracounty.gov/home",
      },
      {
        label: "San Jose ADUs",
        href: "https://www.sanjoseca.gov/business/development-services-permit-center/accessory-dwelling-units-adus",
      },
    ],
  },
  {
    name: "Santa Cruz County",
    summary:
      "Allows tiny homes and THOWs. County pages cover THOW permits and Vehicle License Fee considerations.",
    links: [
      {
        label: "Tiny Homes on Wheels",
        href: "https://cdi.santacruzcountyca.gov/Planning/PolicyPlanning/TinyHomes.aspx",
      },
      {
        label: "THOW permit pathway",
        href: "https://cdi.santacruzcountyca.gov/UPC/BuildingPermitsSafety/ApplyforaBuildingPermit/TinyHomesonWheels.aspx",
      },
    ],
  },
  {
    name: "Shasta County",
    summary:
      "Stricter path: often cites 2019 CBC with larger room minima (≈220 / 100 sq ft) and a practical floor near 400 sq ft.",
    parkModel:
      "Human habitation of park models typically limited to RV parks or campgrounds.",
    links: [
      {
        label: "Building Division",
        href: "https://www.shastacounty.gov/building",
      },
    ],
  },
  {
    name: "Sierra County",
    summary: "2022 CBC allows tiny homes.",
    parkModel:
      "RVs, travel trailers, and mobile homes are generally limited to temporary dwelling use.",
    links: [
      {
        label: "Planning",
        href: "https://www.sierracounty.ca.gov/251/Planning",
      },
    ],
  },
  {
    name: "Siskiyou County",
    summary: "Allows CBC-compliant tiny homes under 2022 standards.",
    parkModel: "Stance unclear—contact Building or Planning.",
    links: [
      {
        label: "Planning",
        href: "https://www.siskiyoucounty.gov/planning",
      },
    ],
  },
  {
    name: "Solano County",
    summary: "Allows tiny homes under 2022 CBC rules.",
    parkModel: "Confirm permanence with Building & Safety.",
    links: [
      {
        label: "Building & Safety",
        href: "https://www.solanocounty.com/depts/rm/buildingnsafety/about.asp",
      },
    ],
  },
  {
    name: "Sonoma County",
    summary:
      "Tiny homes are primarily framed as temporary dwellings, with cottage-housing / foundation pathways for more permanent clusters.",
    links: [
      {
        label: "Tiny Houses",
        href: "https://permitsonoma.org/regulationsandlongrangeplans/regulationsandinitiatives/housingtypes/tinyhouses",
      },
    ],
  },
  {
    name: "Stanislaus County",
    summary: "2022 CBC compliance is the baseline for likely approval.",
    links: [
      {
        label: "Planning",
        href: "https://www.stancounty.com/planning/",
      },
    ],
  },
  {
    name: "Sutter County",
    summary:
      "Allows tiny homes meeting CBC room/height minima (7 ft 6 in, 120 / 70 sq ft).",
    parkModel:
      "Park models limited to established RV parks operating with a state permit.",
    links: [
      {
        label: "Planning & Zoning",
        href: "https://www.suttercounty.org/community/residents/home-property/planning-and-zoning",
      },
    ],
  },
  {
    name: "Tehama County",
    summary:
      "Follows 2022 CBC Appendix AQ for tiny homes (7 ft 6 in, 120 / 70 sq ft).",
    parkModel: "Park models limited to designated parks.",
    links: [
      {
        label: "Building & Safety",
        href: "https://www.tehama.gov/government/departments/building-and-safety/",
      },
    ],
  },
  {
    name: "Trinity County",
    summary: "2022 CBC adopted; code-compliant tiny homes are allowed.",
    links: [
      {
        label: "County departments",
        href: "https://www.trinitycounty.org/159/Departments",
      },
    ],
  },
  {
    name: "Tulare County",
    summary:
      "Allows tiny homes under Appendix AQ of the 2022 California Residential Code.",
    links: [
      {
        label: "Planning & Building",
        href: "https://tularecounty.ca.gov/rma/planning-building/",
      },
    ],
  },
  {
    name: "Tuolumne County",
    summary:
      "2022 CBC: 7 ft 6 in ceiling, 120 sq ft primary room, 70 sq ft additional rooms.",
    links: [
      {
        label: "Building Division",
        href: "https://www.tuolumnecounty.ca.gov/171/Building-Division",
      },
    ],
  },
  {
    name: "Ventura County",
    summary: "Tiny homes allowed when they meet 2022 CBC room/height minima.",
    parkModel:
      "Full-time park-model occupancy is generally not permitted; RV park recreational use may still apply.",
    links: [
      {
        label: "Ventura County",
        href: "https://www.ventura.org/",
      },
    ],
  },
  {
    name: "Yolo County",
    summary:
      "Uses 2019 CBC-style larger room minima (≈220 / 100 sq ft) for tiny homes.",
    parkModel: "Unclear—confirm with Building Inspection Services.",
    links: [
      {
        label: "Building Services",
        href: "https://www.yolocounty.gov/government/general-government-departments/community-services/building-inspection-services",
      },
    ],
  },
  {
    name: "Yuba County",
    summary:
      "Allows tiny homes under 2019 CBC-style room minima (≈220 / 100 sq ft).",
    parkModel:
      "RVs, travel trailers, and park models are not permitted as permanent residences; short-term rental use may be a separate track.",
    links: [
      {
        label: "Building Department",
        href: "http://www.yuba.gov/departments/community_development/building_department/index.php",
      },
    ],
  },
];

export const COMMUNITIES: TinyHomeCommunity[] = [
  {
    name: "Delta Bay",
    address: "922 W Brannan Island Rd, Isleton, CA 95641",
    notes:
      "Between San Francisco and Sacramento. Amenities often include boat launch/storage, community garden, dog park, fitness center, Wi-Fi, full hookups, laundry, and a pool—useful when local rules require a designated park.",
  },
  {
    name: "Tiny House Block",
    address: "9849 Sunrise Hwy, Mt Laguna, CA 91948",
    notes:
      "Mountain setting with Wi-Fi, parking, fire pit, picnic area, and nearby hiking.",
  },
  {
    name: "Paradise Tiny Home Community",
    address: "17989 Corkill Road, Desert Hot Springs, CA 92241",
    notes:
      "Coachella Valley community with clubhouse, workout room, pool area, and outdoor fire pits.",
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "How small can a California tiny home be?",
    answer: `Under the common ${CBC_BASELINE.codeYear} CBC path, permanent residences need at least one ${CBC_BASELINE.primaryRoomSqFt} sq ft habitable room and ${CBC_BASELINE.additionalRoomSqFt} sq ft for each additional habitable room, plus about ${CBC_BASELINE.ceilingHeight} ceiling height. Local ordinances (especially for THOWs as ADUs) may set different minimums and maximums—often in the 150–400+ sq ft range.`,
  },
  {
    question: "Can I live full-time in a park model?",
    answer:
      "In many places yes—if the unit is in a permitted RV / special occupancy park, on an approved foundation, or expressly allowed as a moveable tiny house ADU. Some counties ban THOWs as permanent residences. Always verify the occupancy classification before purchase.",
  },
  {
    question: "What certifications matter?",
    answer:
      "Park models / THOWs commonly need ANSI A119.5 (and sometimes RVIA labeling). Site-built ADUs follow California Residential / Building Code and local ADU ordinances instead.",
  },
  {
    question: "Where are lower-cost placement options?",
    answer:
      "Inland and more rural counties (for example Fresno, Kern, San Bernardino) can be relatively more workable when land, utilities, and fees align—and when local bulletins explicitly welcome park models. Tiny-home communities can also reduce land acquisition friction where park residency is required.",
  },
  {
    question: "How does this relate to ADU / SB 9 checks?",
    answer:
      "State ADU law (Gov. Code Chapter 13, §§ 66310–66342) and SB 9 (§§ 65852.21 and 66411.7) create residential pathways that many cities implement locally. A parcel may be ADU-eligible while still restricting wheeled units unless a THOW ordinance exists. Use the doihave.space checker for SF pilot zoning overlays, then read this guide for statewide tiny-home context.",
  },
];

export const GUIDE_DISCLAIMER = formatRegulationsDisclaimer(
  "Ordinances change; always verify with the jurisdiction that will issue your permit.",
);
