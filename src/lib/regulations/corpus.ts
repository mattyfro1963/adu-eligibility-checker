import { formatRegulationsDisclaimer } from "@/lib/regulations/agent";

/** Version stamp for search receipts and briefing provenance. */

export const CORPUS_VERSION = "2026.08.20-ca-v4";
export const LAST_REVIEWED = "2026-08-20";

export const RECEIPT_DISCLAIMER = formatRegulationsDisclaimer(
  "SF Planning and DBI remain linked sources for covered pilot lots.",
);
