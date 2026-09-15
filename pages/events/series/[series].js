import EventHubPage from '../../../components/events/EventHubPage';
import { getEvents } from '../../../lib/apiEvents';

export default function SeriesEventsPage({ series, events }) {
  return (
    <EventHubPage
      title={`Upcoming ${series} Events`}
      description={`Find upcoming ${series} dates, locations, registration opportunities, tickets, and livestreams on TrickBook.`}
      canonicalPath={`/events/series/${encodeURIComponent(series)}`}
      events={events}
    />
  );
}

export async function getServerSideProps({ params, res }) {
  const series = String(params.series || '').trim();
  if (!series || series.length > 120) return { notFound: true };

  const { events } = await getEvents({ series });
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  return { props: { series, events } };
}
