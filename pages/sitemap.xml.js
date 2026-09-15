import { getEvents } from '../lib/apiEvents';
import { SPORT_OPTIONS } from '../lib/eventFormatters';
import { getSnowboardFilms } from '../lib/filmCatalog';

const escapeXml = (value) =>
  String(value).replace(
    /[<>&'"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character],
  );

export default function Sitemap() {
  return null;
}

async function getAllEvents(view) {
  const events = [];
  let cursor = null;

  do {
    const page = await getEvents({ view }, cursor);
    events.push(...page.events);
    cursor = page.nextCursor;
  } while (cursor && events.length < 50000);

  return events;
}

export async function getServerSideProps({ res }) {
  let films = [];
  let events = [];
  try {
    films = (await getSnowboardFilms({ limit: 100 })).films || [];
  } catch {}
  try {
    const [upcoming, archive] = await Promise.all([
      getAllEvents('upcoming'),
      getAllEvents('archive'),
    ]);
    events = [...upcoming, ...archive];
  } catch {}

  const eventUrls = [
    ...new Map(events.filter((event) => event.slug).map((event) => [event.slug, event])).values(),
  ].map((event) => ({
    loc: `https://thetrickbook.com/events/${event.slug}`,
    priority: '0.8',
    lastmod: event.updatedAt || event.freshness?.lastVerifiedAt || event.lastSeenAt,
  }));
  const validSports = new Set(
    SPORT_OPTIONS.filter((sport) => sport.id !== 'all').map((sport) => sport.id),
  );
  const sportUrls = [
    ...new Set(
      events.flatMap((event) => event.sports || []).filter((sport) => validSports.has(sport)),
    ),
  ].map((sport) => ({
    loc: `https://thetrickbook.com/events/sport/${encodeURIComponent(sport)}`,
    priority: '0.7',
  }));
  const regionUrls = [...new Set(events.map((event) => event.venue?.region).filter(Boolean))].map(
    (region) => ({
      loc: `https://thetrickbook.com/events/region/${encodeURIComponent(region)}`,
      priority: '0.7',
    }),
  );
  const urls = [
    { loc: 'https://thetrickbook.com/', priority: '1.0' },
    { loc: 'https://thetrickbook.com/events', priority: '0.9' },
    ...sportUrls,
    ...regionUrls,
    ...eventUrls,
    { loc: 'https://thetrickbook.com/media', priority: '0.9' },
    ...films.map((film) => ({
      loc: `https://thetrickbook.com/media/couch/${film.slug}`,
      priority: '0.8',
      lastmod: film.updatedAt,
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : ''}<priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();
  return { props: {} };
}
