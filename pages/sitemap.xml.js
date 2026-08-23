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

export async function getServerSideProps({ res }) {
  let films = [];
  try {
    films = (await getSnowboardFilms({ limit: 100 })).films || [];
  } catch {}
  const urls = [
    { loc: 'https://thetrickbook.com/', priority: '1.0' },
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
