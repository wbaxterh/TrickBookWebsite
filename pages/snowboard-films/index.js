import { Search } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { getSnowboardFilms } from '../../lib/filmCatalog';

const SITE_URL = 'https://thetrickbook.com';

export default function SnowboardFilms({ catalog, query }) {
  const films = catalog?.films || [];
  return (
    <>
      <Head>
        <title>Snowboard Film Database: Full-Length Movies | TrickBook</title>
        <meta
          name="description"
          content="Explore full-length snowboarding films by year, producer, and rider. Find official free streams, trailers, and legitimate places to rent or buy."
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={`${SITE_URL}/snowboard-films`} />
        <meta property="og:title" content="The Snowboard Film Database | TrickBook" />
        <meta
          property="og:description"
          content="Full-length snowboard movies, riders, production credits, artwork, and verified watch links."
        />
        <meta property="og:url" content={`${SITE_URL}/snowboard-films`} />
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-gradient-to-b from-sky-950/40 to-background">
          <div className="container mx-auto px-4 py-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              TrickBook Film Archive
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Snowboard Film Database
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
              Discover full-length snowboard movies, the riders who shaped them, production credits,
              and verified places to watch.
            </p>
            <form className="mt-8 flex max-w-xl gap-2" action="/snowboard-films">
              <label className="sr-only" htmlFor="film-search">
                Search snowboard films
              </label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="film-search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search films, riders, or producers"
                  className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3"
                />
              </div>
              <button type="submit" className="rounded-md bg-sky-500 px-5 font-semibold text-black">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Full-length films</h2>
              <p className="text-sm text-muted-foreground">
                {catalog?.total || films.length} researched titles
              </p>
            </div>
          </div>
          {films.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {films.map((film) => (
                <Link
                  key={film.slug}
                  href={`/snowboard-films/${film.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:border-sky-500/60"
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    {film.thumbnails?.poster && (
                      <img
                        src={film.thumbnails.poster}
                        alt={`${film.title} snowboard film cover art`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                      {film.releaseYear || 'Year unknown'} · {film.producedBy}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-tight">{film.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {film.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border p-8 text-muted-foreground">
              No films matched this search.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ query, res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  try {
    const catalog = await getSnowboardFilms({ page: Number(query.page) || 1, q: query.q || '' });
    return { props: { catalog, query: query.q || '' } };
  } catch {
    return { props: { catalog: { films: [], total: 0 }, query: query.q || '' } };
  }
}
