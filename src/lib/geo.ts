const EARTH_RADIUS_MILES = 3958.8;

/**
 * Returns distance in miles between two coordinates using the Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Sorts items by proximity to user location. Items with null coords go to end.
 * Returns a new array with a `distance` property attached to each item.
 */
export function sortByDistance<
  T extends { latitude: number | null; longitude: number | null },
>(
  items: T[],
  userLat: number,
  userLng: number
): (T & { distance: number | null })[] {
  const withDistance = items.map((item) => {
    const distance =
      item.latitude != null && item.longitude != null
        ? haversineDistance(userLat, userLng, item.latitude, item.longitude)
        : null;
    return { ...item, distance };
  });

  return withDistance.sort((a, b) => {
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });
}

/**
 * Client-side geocoding via Nominatim. Returns null on failure.
 */
export async function geocodeLocation(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "lineage.guide (https://lineage.guide)",
      },
    });

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}
