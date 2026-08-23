import { ArrowLeft, ExternalLink, MapPin, Play } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { getSnowboardFilm } from '../../lib/filmCatalog';

const SITE_URL = 'https://thetrickbook.com';

export default function SnowboardFilm({ film }) {
  const canonical = `${SITE_URL}/snowboard-films/${film.slug}`;
  const watch =
    film.watchOptions?.find((option) => option.access === 'free') || film.watchOptions?.[0];
  const poster = film.thumbnails?.poster;
  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: film.title,
    description: film.description,
    dateCreated: film.releaseYear ? String(film.releaseYear) : undefined,
    image: poster ? [poster] : undefined,
    genre: ['Sports', 'Snowboarding'],
    actor: film.riders?.map((name) => ({ '@type': 'Person', name })),
    director: film.directors?.map((name) => ({ '@type': 'Person', name })),
    productionCompany: film.producedBy
      ? { '@type': 'Organization', name: film.producedBy }
      : undefined,
    url: canonical,
    sameAs: [
      ...(film.sourceRecords || []).map((source) => source.url),
      ...(film.watchOptions || []).map((option) => option.url),
    ],
  };
  const videoSchema = watch?.embedUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: film.title,
        description: film.description,
        thumbnailUrl: poster ? [poster] : undefined,
        uploadDate: film.releaseYear ? `${film.releaseYear}-01-01` : undefined,
        embedUrl: watch.embedUrl,
        url: watch.url,
      }
    : null;

  return (
    <>
      <Head>
        <title>
          {film.seo?.title || `${film.title} (${film.releaseYear}) Snowboard Film`} | TrickBook
        </title>
        <meta
          name="description"
          content={film.seo?.description || film.description.slice(0, 155)}
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="video.movie" />
        <meta property="og:title" content={film.title} />
        <meta property="og:description" content={film.description.slice(0, 200)} />
        <meta property="og:url" content={canonical} />
        {poster && <meta property="og:image" content={poster} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
        />
        {videoSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
          />
        )}
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Link
            href="/snowboard-films"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Snowboard film database
          </Link>
          <article className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div>
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                {watch?.embedUrl ? (
                  <iframe
                    src={watch.embedUrl}
                    title={`Watch ${film.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : poster ? (
                  <img
                    src={poster}
                    alt={`${film.title} snowboard film cover art`}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-400">
                {film.releaseYear} Snowboard Film
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">{film.title}</h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{film.description}</p>
              {watch && (
                <a
                  href={watch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-3 font-bold text-black"
                >
                  <Play className="h-5 w-5" />{' '}
                  {watch.access === 'free'
                    ? 'Watch the full film free'
                    : watch.label || 'View watch option'}{' '}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <aside className="space-y-6 rounded-xl border border-border bg-card p-6 lg:self-start">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Produced by
                </h2>
                <p className="mt-2 text-xl font-bold">{film.producedBy}</p>
              </div>
              {film.riders?.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Featured riders
                  </h2>
                  <ul className="mt-3 columns-2 space-y-2 text-sm">
                    {film.riders.map((rider) => (
                      <li key={rider}>{rider}</li>
                    ))}
                  </ul>
                </div>
              )}
              {film.locations?.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Film locations
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {film.locations.map((location) => (
                      <li key={location} className="flex gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {location}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                TrickBook catalogs film information and links to authorized viewing sources.
                External-only entries are not rehosted by TrickBook.
              </div>
            </aside>
          </article>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  try {
    const film = await getSnowboardFilm(params.slug);
    if (!film) return { notFound: true };
    return { props: { film } };
  } catch {
    return { notFound: true };
  }
}
