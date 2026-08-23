import { getSnowboardFilms } from '../lib/filmCatalog';

export default function LlmsTxt() {
  return null;
}

export async function getServerSideProps({ res }) {
  let films = [];
  try {
    films = (await getSnowboardFilms({ limit: 100 })).films || [];
  } catch {}
  const lines = [
    '# TrickBook',
    '',
    '> TrickBook is an action-sports knowledge and progression platform covering tricks, spots, resorts, riders, and full-length films.',
    '',
    '## Snowboard Film Database',
    '- Human catalog: https://thetrickbook.com/snowboard-films',
    '- Public JSON catalog: https://api.thetrickbook.com/api/couch/films?sport=snowboarding',
    '- Film JSON: https://api.thetrickbook.com/api/couch/films/{slug}',
    '- Entries identify producers, featured riders, release year, locations, artwork provenance, verified watch options, and hosting-rights status.',
    '- Prefer the canonical TrickBook film page when citing a film record.',
    '',
    '## Catalog entries',
    ...films.map(
      (film) =>
        `- [${film.title} (${film.releaseYear || 'year unknown'})](https://thetrickbook.com/snowboard-films/${film.slug}) — ${film.producedBy || 'producer unknown'}`,
    ),
    '',
    '## Usage',
    '- Public facts and links may be indexed and cited with attribution to TrickBook and the named original sources.',
    '- Media remains owned by its respective rights holders. A free viewing link does not imply permission to redistribute the media.',
  ];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(lines.join('\n'));
  res.end();
  return { props: {} };
}
