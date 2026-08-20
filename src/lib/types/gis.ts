export interface GeocodeResult {
  addressId: string;
  /** Full single-line place name (e.g. Mapbox `place_name`). */
  formattedAddress: string;
  /** House + street for two-line suggestion primary line. */
  streetLine: string;
  /** City / locality (Mapbox `place` context). */
  place: string;
  /** State / region (e.g. `CA` or `California`). */
  region: string;
  /** ZIP / postal code when available. */
  postcode: string;
  lat: number;
  lng: number;
}
