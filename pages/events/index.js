import {
  BellPlus,
  CalendarDays,
  LayoutList,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  Sparkles,
  X,
} from 'lucide-react';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EventCard from '../../components/events/EventCard';
import EventEmptyState from '../../components/events/EventEmptyState';
import EventFilters from '../../components/events/EventFilters';
import { Button } from '../../components/ui/button';
import { EVENT_FIXTURES } from '../../data/eventFixtures';
import { getEvents } from '../../lib/apiEvents';
import { eventDistanceMiles } from '../../lib/geo';

const DEFAULT_FILTERS = {
  q: '',
  sport: 'all',
  location: '',
  radius: '100',
  date: 'all',
  intent: 'all',
  registration: 'all',
};

const SAVED_STORAGE_KEY = 'trickbook:saved-events';
const COORDS_STORAGE_KEY = 'trickbook:user-coords';
const useFixtures = process.env.NEXT_PUBLIC_EVENTS_USE_FIXTURES === 'true';

// "For you" ranks a window of upcoming events client-side by distance, so pull a
// few pages rather than just the first 20 before ranking.
const FORYOU_PAGES = 3;
const FORYOU_LIMIT = 30;

function filterFixtures(events, filters) {
  const query = filters.q.trim().toLowerCase();
  const now = new Date();
  const monthEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return events.filter((event) => {
    if (query) {
      const haystack = [event.title, event.description, event.organizer?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.sport !== 'all' && !event.sports?.includes(filters.sport)) return false;
    if (filters.intent !== 'all' && !event.intents?.includes(filters.intent)) return false;
    if (filters.registration === 'open' && event.participation?.registrationStatus !== 'open') {
      return false;
    }
    if (filters.date === 'month') {
      const start = new Date(event.startAt);
      if (start < now || start > monthEnd) return false;
    }
    return true;
  });
}

// Map UI filters to API params. `radius` is applied client-side (the API has no
// distance query), so it's intentionally omitted here.
function toApiFilters(filters) {
  return {
    q: filters.q,
    sport: filters.sport,
    location: filters.location,
    date: filters.date,
    intent: filters.intent,
    registration: filters.registration,
  };
}

export default function EventsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState('foryou');
  const [savedIds, setSavedIds] = useState(new Set());
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // For You: a ranked window of upcoming events.
  const [forYouRaw, setForYouRaw] = useState([]);
  const [forYouLoading, setForYouLoading] = useState(true);
  const [forYouUnavailable, setForYouUnavailable] = useState(false);

  // All Events: the full paginated list.
  const [allEvents, setAllEvents] = useState([]);
  const [allCursor, setAllCursor] = useState(null);
  const [allTotal, setAllTotal] = useState(null);
  const [allLoading, setAllLoading] = useState(true);
  const [allLoadingMore, setAllLoadingMore] = useState(false);
  const [allUnavailable, setAllUnavailable] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
      setSavedIds(new Set(saved));
    } catch (_error) {}
    try {
      const stored = window.localStorage.getItem(COORDS_STORAGE_KEY);
      if (stored) setCoords(JSON.parse(stored));
    } catch (_error) {}
  }, []);

  // Fetch the "For you" window whenever filters change.
  useEffect(() => {
    let active = true;
    const timer = setTimeout(
      async () => {
        setForYouLoading(true);
        setForYouUnavailable(false);
        try {
          if (useFixtures) {
            if (active) setForYouRaw(filterFixtures(EVENT_FIXTURES, filters));
            return;
          }
          const api = toApiFilters(filters);
          const acc = [];
          let cursor = null;
          let pages = 0;
          do {
            const data = await getEvents(api, cursor);
            acc.push(...data.events);
            cursor = data.nextCursor;
            pages += 1;
          } while (cursor && pages < FORYOU_PAGES);
          if (active) setForYouRaw(acc);
        } catch (_error) {
          if (active) {
            setForYouRaw([]);
            setForYouUnavailable(true);
          }
        } finally {
          if (active) setForYouLoading(false);
        }
      },
      filters.q ? 300 : 0,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters]);

  // Fetch first page of "All events" whenever filters change.
  const allActiveRef = useRef(0);
  useEffect(() => {
    const runId = allActiveRef.current + 1;
    allActiveRef.current = runId;
    const timer = setTimeout(
      async () => {
        setAllLoading(true);
        setAllUnavailable(false);
        try {
          if (useFixtures) {
            const list = filterFixtures(EVENT_FIXTURES, filters);
            if (allActiveRef.current === runId) {
              setAllEvents(list);
              setAllCursor(null);
              setAllTotal(list.length);
            }
            return;
          }
          const data = await getEvents(toApiFilters(filters), null);
          if (allActiveRef.current === runId) {
            setAllEvents(data.events);
            setAllCursor(data.nextCursor);
            setAllTotal(data.totalCount);
          }
        } catch (_error) {
          if (allActiveRef.current === runId) {
            setAllEvents([]);
            setAllCursor(null);
            setAllTotal(null);
            setAllUnavailable(true);
          }
        } finally {
          if (allActiveRef.current === runId) setAllLoading(false);
        }
      },
      filters.q ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (!allCursor || allLoadingMore) return;
    setAllLoadingMore(true);
    try {
      const data = await getEvents(toApiFilters(filters), allCursor);
      setAllEvents((current) => [...current, ...data.events]);
      setAllCursor(data.nextCursor);
      if (data.totalCount != null) setAllTotal(data.totalCount);
    } catch (_error) {
      setAllCursor(null);
    } finally {
      setAllLoadingMore(false);
    }
  }, [allCursor, allLoadingMore, filters]);

  // Rank the For You window by distance (when we know the user's location),
  // otherwise keep the server's date order. Radius filters out far events only
  // when we can measure the distance.
  const forYouRanked = useMemo(() => {
    const withDistance = forYouRaw.map((event) => ({
      event,
      mi: eventDistanceMiles(event, coords),
    }));
    if (coords) {
      const radius = filters.radius && filters.radius !== 'any' ? Number(filters.radius) : null;
      const scoped = radius
        ? withDistance.filter((x) => x.mi != null && x.mi <= radius)
        : withDistance;
      scoped.sort(
        (a, b) => (a.mi ?? Number.POSITIVE_INFINITY) - (b.mi ?? Number.POSITIVE_INFINITY),
      );
      return scoped.slice(0, FORYOU_LIMIT);
    }
    return withDistance.slice(0, FORYOU_LIMIT);
  }, [forYouRaw, coords, filters.radius]);

  const savedCount = useMemo(() => {
    const list = activeTab === 'foryou' ? forYouRanked.map((x) => x.event) : allEvents;
    return list.filter((event) => savedIds.has(event._id)).length;
  }, [activeTab, forYouRanked, allEvents, savedIds]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const toggleSave = (event) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(event._id)) next.delete(event._id);
      else next.add(event._id);
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not available in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        window.localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(next));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError('Could not get your location. Check browser permissions.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  };

  const clearLocation = () => {
    setCoords(null);
    setLocationError('');
    window.localStorage.removeItem(COORDS_STORAGE_KEY);
  };

  const isForYou = activeTab === 'foryou';
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'radius' && value && value !== 'all',
  );

  return (
    <>
      <Head>
        <title>Events - Find Action Sports Events | The Trick Book</title>
        <meta
          name="description"
          content="Find action sports competitions, community sessions, registration opportunities, tickets, and livestreams near you."
        />
      </Head>

      <main className="min-h-screen bg-background">
        <section className="border-b border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(252,241,80,0.16),transparent_45%)]" />
          <div className="container relative py-12 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-700 dark:text-yellow-300">
                <Radio className="h-3.5 w-3.5" /> The action-sports calendar
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mt-5">
                Know what&apos;s happening. <span className="text-yellow-500">Go ride.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-5 max-w-2xl">
                Find competitions to enter, events to attend, and live action to watch across every
                TrickBook sport.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold" disabled>
                  <BellPlus className="h-4 w-4 mr-2" /> Create event alert
                </Button>
                {savedCount > 0 && (
                  <div className="h-10 px-4 rounded-md border border-border flex items-center text-sm text-muted-foreground">
                    {savedCount} saved in these results
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12">
          <EventFilters
            filters={filters}
            onChange={updateFilter}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          {/* For You / All Events tab switch */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <div className="inline-flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab('foryou')}
                className={`h-10 px-4 flex items-center gap-2 text-sm font-semibold transition-colors ${
                  isForYou
                    ? 'bg-yellow-400 text-black'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-4 w-4" /> For you
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`h-10 px-4 flex items-center gap-2 text-sm font-semibold transition-colors ${
                  !isForYou
                    ? 'bg-yellow-400 text-black'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutList className="h-4 w-4" /> All events
                {allTotal != null && (
                  <span
                    className={`text-xs ${!isForYou ? 'text-black/70' : 'text-muted-foreground'}`}
                  >
                    {allTotal}
                  </span>
                )}
              </button>
            </div>

            {/* Location control (drives For You ranking) */}
            {coords ? (
              <div className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-sm text-yellow-700 dark:text-yellow-300">
                <Navigation className="h-4 w-4" /> Sorted by distance
                <button
                  type="button"
                  onClick={clearLocation}
                  className="ml-1 text-muted-foreground hover:text-foreground"
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
                className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-yellow-500 transition-colors disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-yellow-500" />
                )}
                Use my location
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mt-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                {isForYou ? (
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                ) : (
                  <LayoutList className="h-5 w-5 text-yellow-500" />
                )}
                <h2 className="text-xl font-bold text-foreground">
                  {isForYou ? 'For you' : 'All events'}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isForYou
                  ? forYouLoading
                    ? 'Checking event sources…'
                    : forYouUnavailable
                      ? 'The Events API is not connected yet'
                      : coords
                        ? `${forYouRanked.length} event${forYouRanked.length === 1 ? '' : 's'} near you`
                        : `${forYouRanked.length} upcoming event${forYouRanked.length === 1 ? '' : 's'} · turn on location to sort by distance`
                  : allLoading
                    ? 'Loading all events…'
                    : allUnavailable
                      ? 'The Events API is not connected yet'
                      : `Showing ${allEvents.length}${allTotal != null ? ` of ${allTotal}` : ''} events`}
              </p>
            </div>
          </div>

          {locationError && <p className="text-sm text-red-500 mb-4">{locationError}</p>}

          {isForYou ? (
            forYouLoading ? (
              <LoadingBlock />
            ) : forYouRanked.length > 0 ? (
              <div className="grid gap-4">
                {forYouRanked.map(({ event, mi }) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    saved={savedIds.has(event._id)}
                    onToggleSave={toggleSave}
                    distanceMi={mi}
                  />
                ))}
              </div>
            ) : (
              <EventEmptyState
                filtered={hasActiveFilters && !forYouUnavailable}
                onReset={() => setFilters(DEFAULT_FILTERS)}
              />
            )
          ) : allLoading ? (
            <LoadingBlock />
          ) : allEvents.length > 0 ? (
            <>
              <div className="grid gap-4">
                {allEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    saved={savedIds.has(event._id)}
                    onToggleSave={toggleSave}
                    distanceMi={eventDistanceMiles(event, coords)}
                  />
                ))}
              </div>
              {allCursor && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={allLoadingMore}
                    variant="outline"
                    className="min-w-[180px]"
                  >
                    {allLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…
                      </>
                    ) : (
                      'Load more events'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EventEmptyState
              filtered={hasActiveFilters && !allUnavailable}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          )}

          {useFixtures && (
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Development fixture mode is enabled. Events
              are curated examples, not a live feed.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function LoadingBlock() {
  return (
    <div className="py-24 flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-6 w-6 mr-3 animate-spin text-yellow-500" /> Loading events
    </div>
  );
}
