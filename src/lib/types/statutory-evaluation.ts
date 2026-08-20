export type StatutorySeverity = "blocking" | "caution" | "info";

export interface StatutoryEvaluation {
  ruleId: string;
  program: "adu" | "sb9";
  title: string;
  passed: boolean;
  severity: StatutorySeverity;
  /** Display citation label (e.g. Gov. Code § 65852.21). */
  citation: string;
  description: string;
}
