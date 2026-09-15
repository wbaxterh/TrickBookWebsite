import EventHubPage from '../../../components/events/EventHubPage';
import { getEvents } from '../../../lib/apiEvents';

export default function OrganizerEventsPage({ organizer, events }) {
  return (
    <EventHubPage
      title={`Upcoming Events from ${organizer}`}
      description={`Find upcoming competitions, community sessions, registration opportunities, tickets, and livestreams organized by ${organizer}.`}
      canonicalPath={`/events/organizer/${encodeURIComponent(organizer)}`}
      events={events}
    />
  );
}

export async function getServerSideProps({ params, res }) {
  const organizer = String(params.organizer || '').trim();
  if (!organizer || organizer.length > 120) return { notFound: true };

  const { events } = await getEvents({ organizer });
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  return { props: { organizer, events } };
}
