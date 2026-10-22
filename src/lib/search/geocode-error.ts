/** In-alert next step for typed search failures (Paradox of the Active User). */

export function isGeocodeServiceFailure(message: string): boolean {
  return /unavailable|failed to (fetch|geocode)|not configured/i.test(message);
}

export function geocodeErrorNextStep(message: string): string | null {
  if (isGeocodeServiceFailure(message)) {
    return "Retry the lookup, or pick a sample CA, OR, or WA lot below.";
  }
  return "Try a CA, OR, or WA street address, or pick a sample lot below.";
}
