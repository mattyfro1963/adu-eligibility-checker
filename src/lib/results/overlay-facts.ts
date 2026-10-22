/**
 * Overlay row labels — empty/false GIS flags must not read as “Clear.”
 */

export function overlayFactLabel(
  detected: boolean,
  undetermined: boolean,
): string {
  if (detected) return "Detected";
  if (undetermined) return "Not verified";
  return "Not shown on mapped layers";
}
