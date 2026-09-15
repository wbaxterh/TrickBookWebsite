import EventHubPage from '../../../components/events/EventHubPage';
import { getEvents } from '../../../lib/apiEvents';
import { getSportMeta, SPORT_OPTIONS } from '../../../lib/eventFormatters';

const VALID_SPORTS = new Set(
  SPORT_OPTIONS.filter((sport) => sport.id !== 'all').map((sport) => sport.id),
);

export default function SportEventsPage({ sport, events }) {
  const sportMeta = getSportMeta(sport);
  return (
    <EventHubPage
      title={`Upcoming ${sportMeta.label} Events`}
      description={`Find upcoming ${sportMeta.label.toLowerCase()} competitions, community sessions, premieres, registration opportunities, tickets, and livestreams on TrickBook.`}
      canonicalPath={`/events/sport/${sport}`}
      events={events}
    />
  );
}

export async function getServerSideProps({ params, res }) {
  if (!VALID_SPORTS.has(params.sport)) return { notFound: true };

  const { events } = await getEvents({ sport: params.sport });
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  return { props: { sport: params.sport, events } };
}
