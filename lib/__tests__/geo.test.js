import { eventDistanceMiles, formatDistance, getEventCoords, haversineMiles } from '../geo';

const LONG_BEACH = { lat: 33.7701, lng: -118.1937 };
const LOS_ANGELES = { lat: 34.0522, lng: -118.2437 };

describe('haversineMiles', () => {
  it('measures Los Angeles to Long Beach at roughly twenty miles', () => {
    const miles = haversineMiles(LOS_ANGELES.lat, LOS_ANGELES.lng, LONG_BEACH.lat, LONG_BEACH.lng);
    expect(miles).toBeGreaterThan(18);
    expect(miles).toBeLessThan(22);
  });

  it('is zero for the same point and symmetric', () => {
    expect(haversineMiles(1, 2, 1, 2)).toBe(0);
    expect(haversineMiles(0, 0, 10, 10)).toBeCloseTo(haversineMiles(10, 10, 0, 0), 6);
  });

  it('returns null when any coordinate is missing or not a number', () => {
    expect(haversineMiles(1, 2, null, 4)).toBeNull();
    expect(haversineMiles('1', 2, 3, 4)).toBeNull();
    expect(haversineMiles(1, 2, 3, Number.NaN)).toBeNull();
  });
});

describe('getEventCoords and eventDistanceMiles', () => {
  it('reads numeric venue coordinates and rejects the rest', () => {
    expect(getEventCoords({ venue: { lat: 1.5, lng: -2.5 } })).toEqual({ lat: 1.5, lng: -2.5 });
    expect(getEventCoords({ venue: { lat: '1.5', lng: -2.5 } })).toBeNull();
    expect(getEventCoords({ venue: { lat: 1.5 } })).toBeNull();
    expect(getEventCoords({})).toBeNull();
    expect(getEventCoords(null)).toBeNull();
  });

  it('is null without a viewer location or event coordinates', () => {
    const event = { venue: LONG_BEACH };
    expect(eventDistanceMiles(event, null)).toBeNull();
    expect(eventDistanceMiles({ venue: {} }, LOS_ANGELES)).toBeNull();
    expect(eventDistanceMiles(event, LOS_ANGELES)).toBeGreaterThan(18);
  });
});

describe('formatDistance', () => {
  it('rounds by scale', () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(0.4)).toBe('<1 mi away');
    expect(formatDistance(3.14)).toBe('3.1 mi away');
    expect(formatDistance(12.6)).toBe('13 mi away');
  });
});
