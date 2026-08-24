/**
 * Canonical author for all law and regulation visitor copy.
 * Briefings, checklists, outlines, guides, and county directory prose
 * must be authored here — components render only.
 */

export const REGULATIONS_AGENT = {
  id: "doihave-space-regulations-expert",
  name: "doihave.space Regulations Expert",
  role: "Regulations briefing agent",
  mission:
    "Helps homeowners, investors, and developers navigate zoning ordinances, permitting processes, and building code considerations with cited official sources.",
} as const;

export type RegulationsAuthor = typeof REGULATIONS_AGENT;

const AUTHOR_PREFIX = `Authored by the ${REGULATIONS_AGENT.name}.`;

/** Visitor-facing attribution line (optional last-reviewed suffix). */
export function regulationsAgentAttribution(lastReviewed?: string): string {
  const corpusNote =
    "Pre-written cited briefing — not generative AI legal advice.";
  if (lastReviewed) {
    return `${AUTHOR_PREFIX} Last reviewed ${lastReviewed}. ${corpusNote}`;
  }
  return `${AUTHOR_PREFIX} ${corpusNote}`;
}

/** Shared disclaimer tail for receipts, guides, and the county directory. */
export function formatRegulationsDisclaimer(extra?: string): string {
  const lead =
    "Informational only — not legal advice, not a permit, and not a substitute for your local planning & building department or a licensed land-use attorney. Briefings select pre-authored cited claims; they are not live generative conclusions.";
  const body = extra ? `${lead} ${extra}` : lead;
  return `${body} ${AUTHOR_PREFIX}`;
}
