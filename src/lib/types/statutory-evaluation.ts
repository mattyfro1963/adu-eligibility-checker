export type StatutorySeverity = "blocking" | "caution" | "info";

/** pass/fail only when lot GIS ran; unverified when jurisdiction context. */
export type StatutoryOutcome = "pass" | "fail" | "unverified";

export interface StatutoryEvaluation {
  ruleId: string;
  program: "adu" | "sb9";
  title: string;
  outcome: StatutoryOutcome;
  severity: StatutorySeverity;
  /** Display citation label (e.g. Gov. Code § 65852.21). */
  citation: string;
  description: string;
}
