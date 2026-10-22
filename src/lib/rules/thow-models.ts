/**
 * Default THOW / park-model profiles for certification + transport gates.
 * Width and height are product defaults — not a live inventory.
 *
 * Active default maps to CAMBRIA 1; keep unlabeled aliases for transitional tests.
 */

export type ThowCertificationClass =
  "noah" | "ansi_a119_5" | "rvia" | "unknown";

export type ThowModelProfile = {
  id: string;
  label: string;
  /** Exterior width in feet (transport envelope). */
  widthFt: number;
  /** Road height in feet (transport envelope). */
  roadHeightFt: number;
  /** Interior / floor area in square feet. */
  sqFt: number;
  certification: ThowCertificationClass;
};

/** CAMBRIA 1 envelope — flagship / wider plan (11.4 ft). */
export const CAMBRIA_1_MODEL: ThowModelProfile = {
  id: "cambria-1",
  label: "CAMBRIA 1",
  widthFt: 11.4,
  roadHeightFt: 14,
  sqFt: 400,
  certification: "noah",
};

/** CAMBRIA 2 envelope — transport-optimized (≤11 ft). */
export const CAMBRIA_2_MODEL: ThowModelProfile = {
  id: "cambria-2",
  label: "CAMBRIA 2",
  widthFt: 11,
  roadHeightFt: 14,
  sqFt: 400,
  certification: "noah",
};

/** @deprecated Prefer CAMBRIA_1_MODEL — same envelope; unknown cert for legacy tests. */
export const DEFAULT_11_4: ThowModelProfile = {
  id: "default_11_4",
  label: "Default THOW / park model (11.4 ft)",
  widthFt: 11.4,
  roadHeightFt: 14,
  sqFt: 400,
  certification: "unknown",
};

/** @deprecated Prefer CAMBRIA_2_MODEL — alias of CAMBRIA 2 envelope. */
export const TRANSPORT_OPTIMIZED_11: ThowModelProfile = {
  ...CAMBRIA_2_MODEL,
  id: "transport_optimized_11",
  label: "Transport-optimized THOW (≤11 ft)",
};

export const THOW_MODEL_PROFILES = {
  "cambria-1": CAMBRIA_1_MODEL,
  "cambria-2": CAMBRIA_2_MODEL,
  default_11_4: DEFAULT_11_4,
  transport_optimized_11: TRANSPORT_OPTIMIZED_11,
} as const;

export type ThowModelId = keyof typeof THOW_MODEL_PROFILES;

/** Active evaluation default — CAMBRIA 1 until UI exposes plan selection. */
export const ACTIVE_THOW_MODEL: ThowModelProfile = CAMBRIA_1_MODEL;
