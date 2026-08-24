/**
 * Default THOW / park-model profiles for certification + transport gates.
 * Width and height are product defaults — not a live inventory.
 */

export type ThowCertificationClass =
  | "noah"
  | "ansi_a119_5"
  | "rvia"
  | "unknown";

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

/** Default Cascadia delivery envelope (~11.4 ft wide). */
export const DEFAULT_11_4: ThowModelProfile = {
  id: "default_11_4",
  label: "Default THOW / park model (11.4 ft)",
  widthFt: 11.4,
  roadHeightFt: 13.5,
  sqFt: 399,
  certification: "unknown",
};

/** Transport-optimized envelope preferred for escort reduction. */
export const TRANSPORT_OPTIMIZED_11: ThowModelProfile = {
  id: "transport_optimized_11",
  label: "Transport-optimized THOW (≤11 ft)",
  widthFt: 11,
  roadHeightFt: 13.5,
  sqFt: 399,
  certification: "noah",
};

export const THOW_MODEL_PROFILES = {
  default_11_4: DEFAULT_11_4,
  transport_optimized_11: TRANSPORT_OPTIMIZED_11,
} as const;

export type ThowModelId = keyof typeof THOW_MODEL_PROFILES;

/** Active evaluation default until the UI exposes model selection. */
export const ACTIVE_THOW_MODEL: ThowModelProfile = DEFAULT_11_4;
