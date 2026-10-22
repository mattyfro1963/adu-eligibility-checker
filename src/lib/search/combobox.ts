/**
 * Combobox selection helpers for AddressSearch — Jakob's Law: highlight the
 * first visible match and submit that match, not the raw typed string.
 */

export function comboboxActiveIndexOnOpen(suggestionCount: number): number {
  return suggestionCount > 0 ? 0 : -1;
}

export function comboboxSubmitSelection<T>(
  listOpen: boolean,
  activeIndex: number,
  items: readonly T[],
): T | null {
  if (!listOpen || items.length === 0) {
    return null;
  }
  const index = activeIndex >= 0 ? activeIndex : 0;
  return items[index] ?? null;
}
