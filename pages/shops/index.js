import { LayoutGrid, Loader2, MapPin, Navigation, Store, X } from 'lucide-react';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import ShopCard from '../../components/shops/ShopCard';
import ShopFilters from '../../components/shops/ShopFilters';
import { Button } from '../../components/ui/button';
import { SHOP_FIXTURES } from '../../data/shopFixtures';
import { getShops } from '../../lib/apiShops';
import { haversineMiles } from '../../lib/geo';

const DEFAULT_FILTERS = { q: '', sport: 'all', location: '', radius: '100', service: 'all' };
const COORDS_STORAGE_KEY = 'trickbook:user-coords';

function matches(shop, filters) {
  const query = filters.q.trim().toLowerCase();
  const address = Object.values(shop.address || {})
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase();
  if (query && !`${shop.name} ${shop.description || ''} ${address}`.toLowerCase().includes(query))
    return false;
  if (filters.location && !address.includes(filters.location.trim().toLowerCase())) return false;
  if (filters.sport !== 'all' && !shop.sports?.includes(filters.sport)) return false;
  if (filters.service !== 'all' && !shop.services?.includes(filters.service)) return false;
  return true;
}

function distanceTo(shop, coords) {
  const { lat, lng } = shop.address || {};
  return coords && typeof lat === 'number' && typeof lng === 'number'
    ? haversineMiles(coords.lat, coords.lng, lat, lng)
    : null;
}

export default function ShopsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingStarterData, setUsingStarterData] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COORDS_STORAGE_KEY);
      if (stored) setCoords(JSON.parse(stored));
    } catch (_error) {}
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const result = await getShops({
            q: filters.q,
            sport: filters.sport,
            location: filters.location,
            service: filters.service,
          });
          if (active) {
            setShops(result.shops);
            setUsingStarterData(false);
          }
        } catch (_error) {
          if (active) {
            setShops(SHOP_FIXTURES);
            setUsingStarterData(true);
          }
        } finally {
          if (active) setLoading(false);
        }
      },
      filters.q ? 300 : 0,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters.q, filters.sport, filters.location, filters.service]);

  const visibleShops = useMemo(() => {
    const list = shops
      .filter((shop) => matches(shop, filters))
      .map((shop) => ({ shop, distance: distanceTo(shop, coords) }));
    if (coords) {
      const radius = filters.radius === 'any' ? null : Number(filters.radius);
      const scoped = radius
        ? list.filter(({ distance }) => distance != null && distance <= radius)
        : list;
      scoped.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return scoped;
    }
    return list;
  }, [shops, filters, coords]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location is not available in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        window.localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(next));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError('Could not get your location. Check browser permissions.');
      },
      { timeout: 8000, maximumAge: 600000 },
    );
  };

  return (
    <>
      <Head>
        <title>Shops - Find Action Sports Shops | The Trick Book</title>
        <meta
          name="description"
          content="Find local skate, snow, surf, BMX, mountain bike, and inline shops."
        />
      </Head>
      <main className="min-h-screen bg-background">
        <section className="container py-8 md:py-12">
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-400 p-2.5 text-black">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground">Shops</h1>
                <p className="text-muted-foreground">
                  Find the local shops that keep your scene rolling.
                </p>
              </div>
            </div>
          </div>
          <ShopFilters
            filters={filters}
            onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-foreground">All shops</h2>
              {!loading && (
                <span className="text-sm text-muted-foreground">{visibleShops.length}</span>
              )}
            </div>
            {coords ? (
              <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 text-sm text-yellow-700 dark:text-yellow-300">
                <Navigation className="h-4 w-4" /> Sorted by distance
                <button
                  type="button"
                  onClick={() => {
                    setCoords(null);
                    window.localStorage.removeItem(COORDS_STORAGE_KEY);
                  }}
                  aria-label="Clear location"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                disabled={locating}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-yellow-500 hover:text-foreground disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-yellow-500" />
                )}{' '}
                Use my location
              </button>
            )}
          </div>
          {locationError && <p className="mt-3 text-sm text-red-500">{locationError}</p>}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-500" /> Loading shops
            </div>
          ) : visibleShops.length ? (
            <div className="mt-4 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleShops.map(({ shop, distance }) => (
                <ShopCard key={shop._id || shop.slug} shop={shop} distanceMi={distance} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border py-20 text-center">
              <Store className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold text-foreground">
                No shops match those filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a wider distance or clear a filter.
              </p>
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Reset filters
              </Button>
            </div>
          )}
          {usingStarterData && (
            <p className="mt-6 text-xs text-muted-foreground">
              Showing curated starter shops while the Shops API is being connected.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
