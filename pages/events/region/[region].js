import EventHubPage from '../../../components/events/EventHubPage';
import { getEvents } from '../../../lib/apiEvents';

export default function RegionEventsPage({ region, events }) {
  return (
    <EventHubPage
      title={`Upcoming Action Sports Events in ${region}`}
      description={`Find upcoming action sports competitions, community sessions, registration opportunities, tickets, and livestreams in ${region}.`}
      canonicalPath={`/events/region/${encodeURIComponent(region)}`}
      events={events}
    />
  );
}

export async function getServerSideProps({ params, res }) {
  const region = String(params.region || '').trim();
  if (!region || region.length > 80) return { notFound: true };

  const { events } = await getEvents({ location: region });
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  return { props: { region, events } };
}
