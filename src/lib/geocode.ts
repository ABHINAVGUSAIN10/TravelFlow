/**
 * Geocode a place name using the Nominatim (OpenStreetMap) API.
 * Completely free, no API key required.
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Nominatim search with retry strategy:
 *  1. First try `"<query>, India"` (biases towards Indian results for common names).
 *  2. If 0 results, retry with `<query>` alone (catches cross-border places like
 *     Pangong Tso, Mechuka, etc. whose OSM entries don't include "India").
 *  3. AbortSignal.timeout(6000) prevents hung requests.
 */
async function nominatimSearch(rawQuery: string): Promise<GeoPoint | null> {
  const headers: Record<string, string> = { "Accept-Language": "en" };
  if (typeof window === "undefined") {
    headers["User-Agent"] = "TravelFlow/1.0 (college project)";
  }

  // Attempt 1: with ", India" suffix for locality bias
  const withIndia = await fetchNominatim(rawQuery + ", India", headers);
  if (withIndia) return withIndia;

  // Attempt 2: raw query (catches cross-border / niche names)
  const raw = await fetchNominatim(rawQuery, headers);
  if (raw) return raw;

  return null;
}

async function fetchNominatim(
  query: string,
  headers: Record<string, string>
): Promise<GeoPoint | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1`;

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

/** Public geocode function — used by all components and API routes */
export async function geocodePlace(query: string): Promise<GeoPoint | null> {
  return nominatimSearch(query);
}

/**
 * Reverse geocode GPS coordinates into a human-readable city name.
 * Uses Nominatim's /reverse endpoint — free, no API key required.
 * Returns the most meaningful short name (city > town > county > state).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;

    const headers: Record<string, string> = { "Accept-Language": "en" };
    if (typeof window === "undefined") {
      headers["User-Agent"] = "TravelFlow/1.0 (college project)";
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (!data || !data.address) return null;

    // Pick the most specific available place name
    const addr = data.address;
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      null
    );
  } catch {
    return null;
  }
}
