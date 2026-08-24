/**
 * Map paint tokens resolved from CSS custom properties.
 * Zero React; Mapbox needs computed color strings, not var() references.
 */

export type MapZoneKind =
  | "eligible"
  | "warning"
  | "restricted"
  | "unverified";

export type MapPaintTokens = {
  lotFill: string;
  lotStroke: string;
  envelopeFill: string;
  envelopeStroke: string;
  zoneEligible: string;
  zoneWarning: string;
  zoneRestricted: string;
  zoneUnverified: string;
  zoneFillOpacity: number;
  hatch: string;
  pinShadow: string;
};

/** SSR / pre-DOM fallbacks — keep in sync with `:root` map tokens in globals.css. */
export const MAP_PAINT_FALLBACKS: MapPaintTokens = {
  lotFill: "#ffffff",
  lotStroke: "#111827",
  envelopeFill: "#6b7280",
  envelopeStroke: "#6b7280",
  zoneEligible: "#059669",
  zoneWarning: "#f59e0b",
  zoneRestricted: "#e11d48",
  zoneUnverified: "#6b7280",
  zoneFillOpacity: 0.16,
  hatch: "#6b7280",
  pinShadow: "rgb(44 40 37 / 0.16)",
};

const VAR_KEYS = {
  lotFill: "--map-lot-fill",
  lotStroke: "--map-lot-stroke",
  envelopeFill: "--map-envelope-fill",
  envelopeStroke: "--map-envelope-stroke",
  zoneEligible: "--map-zone-eligible",
  zoneWarning: "--map-zone-warning",
  zoneRestricted: "--map-zone-restricted",
  zoneUnverified: "--map-zone-unverified",
  zoneFillOpacity: "--map-zone-fill-opacity",
  hatch: "--map-hatch",
  pinShadow: "--map-pin-shadow",
} as const;

function readVar(
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
): string {
  const value = style.getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Resolve map paint tokens from the document (or a scoped element).
 * Call from client effects / event handlers — not during SSR.
 */
export function readMapPaintTokens(
  el?: Element | null,
): MapPaintTokens {
  if (typeof window === "undefined") {
    return { ...MAP_PAINT_FALLBACKS };
  }

  const target = el ?? document.documentElement;
  const style = getComputedStyle(target);
  const opacityRaw = readVar(
    style,
    VAR_KEYS.zoneFillOpacity,
    String(MAP_PAINT_FALLBACKS.zoneFillOpacity),
  );
  const opacity = Number.parseFloat(opacityRaw);

  return {
    lotFill: readVar(style, VAR_KEYS.lotFill, MAP_PAINT_FALLBACKS.lotFill),
    lotStroke: readVar(style, VAR_KEYS.lotStroke, MAP_PAINT_FALLBACKS.lotStroke),
    envelopeFill: readVar(
      style,
      VAR_KEYS.envelopeFill,
      MAP_PAINT_FALLBACKS.envelopeFill,
    ),
    envelopeStroke: readVar(
      style,
      VAR_KEYS.envelopeStroke,
      MAP_PAINT_FALLBACKS.envelopeStroke,
    ),
    zoneEligible: readVar(
      style,
      VAR_KEYS.zoneEligible,
      MAP_PAINT_FALLBACKS.zoneEligible,
    ),
    zoneWarning: readVar(
      style,
      VAR_KEYS.zoneWarning,
      MAP_PAINT_FALLBACKS.zoneWarning,
    ),
    zoneRestricted: readVar(
      style,
      VAR_KEYS.zoneRestricted,
      MAP_PAINT_FALLBACKS.zoneRestricted,
    ),
    zoneUnverified: readVar(
      style,
      VAR_KEYS.zoneUnverified,
      MAP_PAINT_FALLBACKS.zoneUnverified,
    ),
    zoneFillOpacity: Number.isFinite(opacity)
      ? opacity
      : MAP_PAINT_FALLBACKS.zoneFillOpacity,
    hatch: readVar(style, VAR_KEYS.hatch, MAP_PAINT_FALLBACKS.hatch),
    pinShadow: readVar(style, VAR_KEYS.pinShadow, MAP_PAINT_FALLBACKS.pinShadow),
  };
}

export function mapZoneColor(
  tokens: MapPaintTokens,
  kind: MapZoneKind,
): string {
  switch (kind) {
    case "eligible":
      return tokens.zoneEligible;
    case "warning":
      return tokens.zoneWarning;
    case "restricted":
      return tokens.zoneRestricted;
    case "unverified":
      return tokens.zoneUnverified;
  }
}
