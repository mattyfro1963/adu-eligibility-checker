/**
 * Shared shape for CA / OR / WA tiny-home regulations guide pages.
 * Zero React — components render; content modules supply state-local strings.
 */

export type ResourceLink = {
  label: string;
  href: string;
};

/** Structured requirement seed for search results (not only /regulations prose). */
export type JurisdictionRequirementSeed = {
  id: string;
  title: string;
  tinyHomeExplanation: string;
};

export type JurisdictionNote = {
  name: string;
  summary: string;
  parkModel?: string;
  links: ResourceLink[];
  cities?: JurisdictionNote[];
  /**
   * Optional explicit requirement bullets. When omitted, search results seed
   * from `summary` / `parkModel` via `requirementsFromJurisdictionNote`.
   */
  requirements?: JurisdictionRequirementSeed[];
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

export type CodeBaselineMetric = {
  label: string;
  value: string;
};

export type GuideIntro = {
  title: string;
  subtitle: string;
  lead: string;
  buildingCodeNote: string;
};

export type ParkModelOverview = {
  title: string;
  body: string;
  livingFullTime: string;
  ansiNote: string;
};

export type PermitOverview = {
  title: string;
  body: string;
};

export type GuideAction = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

/**
 * Full page payload for RegulationsGuide. Every visible string lives here so
 * OR / WA pages never inherit California-only CTAs or statute names.
 */
export type StateTinyHomeGuideContent = {
  stateCode: "CA" | "OR" | "WA";
  stateName: string;
  /** Default activeHref for RegulationsStateNav when page does not override. */
  defaultActiveHref: string;
  eyebrow: string;
  intro: GuideIntro;
  /** Three overview metric cards (code baseline). */
  codeBaseline: {
    sectionTitle: string;
    metrics: readonly [
      CodeBaselineMetric,
      CodeBaselineMetric,
      CodeBaselineMetric,
    ];
  };
  parkModelOverview: ParkModelOverview;
  countyGuides: {
    sectionTitle: string;
    intro: string;
    counties: JurisdictionNote[];
  };
  directories: {
    title: string;
    description: string;
    countyTitle: string;
    countyDescription: string;
    countyLinks: ResourceLink[];
    cityTitle: string;
    cityDescription: string;
    cityLinks: ResourceLink[];
  };
  unclear: {
    sectionTitle: string;
    intro: string;
    links: ResourceLink[];
  };
  permitOverview: PermitOverview;
  communities: {
    title: string;
    description: string;
    intro: string;
    items: TinyHomeCommunity[];
  };
  faqs: FaqItem[];
  disclaimer: string;
  /** Header CTAs — state-local labels; product checker may still cover CA/OR/WA. */
  actions: {
    primary: GuideAction;
    secondary: GuideAction;
    jumpToCounties: GuideAction;
  };
  asideCta: {
    lead: string;
    linkLabel: string;
    href: string;
  };
};
