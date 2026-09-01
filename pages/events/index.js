import {
  BellPlus,
  CalendarDays,
  List,
  Loader2,
  Map as MapIcon,
  Radio,
  Sparkles,
} from 'lucide-react';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import EventCard from '../../components/events/EventCard';
import EventEmptyState from '../../components/events/EventEmptyState';
import EventFilters from '../../components/events/EventFilters';
import { Button } from '../../components/ui/button';
import { EVENT_FIXTURES } from '../../data/eventFixtures';
import { getEvents } from '../../lib/apiEvents';

const DEFAULT_FILTERS = {
  q: '',
  sport: 'all',
  discipline: 'all',
  location: '',
  radius: '100',
  date: 'all',
  intent: 'all',
  registration: 'all',
};

const SAVED_STORAGE_KEY = 'trickbook:saved-events';
const useFixtures = process.env.NEXT_PUBLIC_EVENTS_USE_FIXTURES === 'true';

function filterFixtures(events, filters, feedType) {
  const query = filters.q.trim().toLowerCase();
  const now = new Date();
  const monthEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return events.filter((event) => {
    const eventEnd = new Date(event.endAt || event.startAt);
    if (feedType === 'archive' ? eventEnd >= now : eventEnd < now) return false;
    if (query) {
      const haystack = [event.title, event.description, event.organizer?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.sport !== 'all' && !event.sports?.includes(filters.sport)) return false;
    if (filters.discipline !== 'all' && !event.disciplines?.includes(filters.discipline)) {
      return false;
    }
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

export default function EventsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [view, setView] = useState('list');
  const [feedType, setFeedType] = useState('upcoming');

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
      setSavedIds(new Set(saved));
    } catch (_error) {}
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(
      async () => {
        setLoading(true);
        setUnavailable(false);
        try {
          if (useFixtures) {
            if (active) setEvents(filterFixtures(EVENT_FIXTURES, filters, feedType));
          } else {
            const data = await getEvents({
              q: filters.q,
              sport: filters.sport,
              discipline: filters.discipline,
              location: filters.location,
              radius: filters.radius === 'any' ? '' : filters.radius,
              date: filters.date,
              intent: filters.intent,
              registration: filters.registration,
              view: feedType === 'archive' ? 'archive' : '',
            });
            if (active) setEvents(data.events);
          }
        } catch (_error) {
          if (active) {
            setEvents([]);
            setUnavailable(true);
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
  }, [filters, feedType]);

  const savedCount = useMemo(
    () => events.filter((event) => savedIds.has(event._id)).length,
    [events, savedIds],
  );

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
          <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
            <button
              type="button"
              onClick={() => setFeedType('upcoming')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${feedType === 'upcoming' ? 'bg-yellow-400 text-black' : 'text-muted-foreground'}`}
            >
              Upcoming events
            </button>
            <button
              type="button"
              onClick={() => setFeedType('archive')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${feedType === 'archive' ? 'bg-yellow-400 text-black' : 'text-muted-foreground'}`}
            >
              Event archive
            </button>
          </div>
          <EventFilters
            filters={filters}
            onChange={updateFilter}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          <div className="flex items-center justify-between gap-4 mt-8 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-foreground">
                  {feedType === 'archive' ? 'Past events' : 'For you'}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {loading
                  ? 'Checking event sources…'
                  : events.length > 0
                    ? `${events.length} ${feedType === 'archive' ? 'archived' : 'upcoming'} event${events.length === 1 ? '' : 's'}`
                    : unavailable
                      ? 'The Events API is not connected yet'
                      : feedType === 'archive'
                        ? 'No archived events found'
                        : 'No upcoming events found'}
              </p>
            </div>

            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`h-9 px-3 flex items-center gap-1.5 text-sm ${view === 'list' ? 'bg-yellow-400 text-black' : 'bg-card text-muted-foreground'}`}
              >
                <List className="h-4 w-4" /> List
              </button>
              <button
                type="button"
                onClick={() => setView('map')}
                className={`h-9 px-3 flex items-center gap-1.5 text-sm ${view === 'map' ? 'bg-yellow-400 text-black' : 'bg-card text-muted-foreground'}`}
              >
                <MapIcon className="h-4 w-4" /> Map
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 mr-3 animate-spin text-yellow-500" /> Loading events
            </div>
          ) : view === 'map' ? (
            <div className="h-[420px] rounded-2xl border border-border bg-card flex items-center justify-center text-center px-6">
              <div>
                <MapIcon className="h-10 w-10 text-yellow-500 mx-auto" />
                <h3 className="font-bold text-foreground mt-3">Event map is the next iteration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The list experience ships first; the map will use GeoJSON event venues.
                </p>
              </div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-4">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  saved={savedIds.has(event._id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <EventEmptyState
              filtered={
                Object.entries(filters).some(
                  ([key, value]) => key !== 'radius' && value && value !== 'all',
                ) && !unavailable
              }
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
