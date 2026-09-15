import { generateSpotSlug, getSpotData, searchSpots } from './apiSpots';
import { haversineMiles } from './geo';

const US_STATE_NAMES = {
  al: 'alabama',
  ak: 'alaska',
  az: 'arizona',
  ar: 'arkansas',
  ca: 'california',
  co: 'colorado',
  ct: 'connecticut',
  de: 'delaware',
  fl: 'florida',
  ga: 'georgia',
  hi: 'hawaii',
  id: 'idaho',
  il: 'illinois',
  in: 'indiana',
  ia: 'iowa',
  ks: 'kansas',
  ky: 'kentucky',
  la: 'louisiana',
  me: 'maine',
  md: 'maryland',
  ma: 'massachusetts',
  mi: 'michigan',
  mn: 'minnesota',
  ms: 'mississippi',
  mo: 'missouri',
  mt: 'montana',
  ne: 'nebraska',
  nv: 'nevada',
  nh: 'new hampshire',
  nj: 'new jersey',
  nm: 'new mexico',
  ny: 'new york',
  nc: 'north carolina',
  nd: 'north dakota',
  oh: 'ohio',
  ok: 'oklahoma',
  or: 'oregon',
  pa: 'pennsylvania',
  ri: 'rhode island',
  sc: 'south carolina',
  sd: 'south dakota',
  tn: 'tennessee',
  tx: 'texas',
  ut: 'utah',
  vt: 'vermont',
  va: 'virginia',
  wa: 'washington',
  wv: 'west virginia',
  wi: 'wisconsin',
  wy: 'wyoming',
  dc: 'washington dc',
};

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function samePlace(left, right) {
  if (!left || !right) return true;
  return normalize(left) === normalize(right);
}

function sameRegion(left, right) {
  if (!left || !right) return true;
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  if (normalizedLeft === normalizedRight) return true;
  return (
    US_STATE_NAMES[normalizedLeft] === normalizedRight ||
    US_STATE_NAMES[normalizedRight] === normalizedLeft
  );
}

function nameScore(venueName, spotName) {
  if (venueName === spotName) return 10;
  if (
    Math.min(venueName.length, spotName.length) >= 6 &&
    (venueName.includes(spotName) || spotName.includes(venueName))
  ) {
    return 7;
  }
  return 0;
}

function distanceScore(event, spot) {
  const distance = haversineMiles(
    event.venue?.lat,
    event.venue?.lng,
    spot.latitude ?? spot.lat,
    spot.longitude ?? spot.lng,
  );
  if (distance != null && distance <= 1) return 4;
  if (distance != null && distance <= 5) return 2;
  return 0;
}

function matchScore(event, spot) {
  const venueName = normalize(event.venue?.name);
  const spotName = normalize(spot.name);
  if (!venueName || !spotName) return 0;
  if (!samePlace(event.venue?.city, spot.city) || !sameRegion(event.venue?.region, spot.state))
    return 0;

  let score = nameScore(venueName, spotName);
  if (event.venue?.city && spot.city) score += 3;
  if (event.venue?.region && spot.state) score += 2;
  return score + distanceScore(event, spot);
}

export function spotDetailHref(spot) {
  const slug = generateSpotSlug(spot.name || 'spot');
  const state = generateSpotSlug(spot.state || 'unknown');
  return `/spots/${state}/${slug}?id=${spot._id}`;
}

export async function resolveEventSpot(event) {
  const spotId = event.venue?.spotId || event.spotId;
  if (spotId) {
    const spot = await getSpotData(spotId);
    return spot ? { spot, match: 'explicit' } : null;
  }

  if (!event.venue?.name) return null;
  const result = await searchSpots(event.venue.name, event.venue.city || '', '', '', 1, 10);
  const ranked = (result.spots || [])
    .map((spot) => ({ spot, score: matchScore(event, spot) }))
    .filter((candidate) => candidate.score >= 10)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length || (ranked[1] && ranked[0].score - ranked[1].score < 2)) return null;
  return { spot: ranked[0].spot, match: 'inferred' };
}
