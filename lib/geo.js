// Client-side geo helpers for location-aware event ranking.
// Events carry venue.lat/lng for most (geocoded) records; some legacy events
// have null coords and are ranked after those with a known distance.

const EARTH_RADIUS_MI = 3958.8;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineMiles(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number' || Number.isNaN(v))) {
    return null;
  }
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function getEventCoords(event) {
  const v = event?.venue || {};
  const lat = typeof v.lat === 'number' ? v.lat : null;
  const lng = typeof v.lng === 'number' ? v.lng : null;
  return lat != null && lng != null ? { lat, lng } : null;
}

export function eventDistanceMiles(event, coords) {
  if (!coords) return null;
  const c = getEventCoords(event);
  if (!c) return null;
  return haversineMiles(coords.lat, coords.lng, c.lat, c.lng);
}

export function formatDistance(mi) {
  if (mi == null) return null;
  if (mi < 1) return '<1 mi away';
  if (mi < 10) return `${mi.toFixed(1)} mi away`;
  return `${Math.round(mi)} mi away`;
}
