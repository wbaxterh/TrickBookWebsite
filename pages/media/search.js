import { Loader2, Search } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VideoCard from '../../components/media/VideoCard';
import { Button } from '../../components/ui/button';
import { getCouchVideos } from '../../lib/apiMedia';

const PAGE_SIZE = 24;

export default function MediaSearch() {
  const router = useRouter();
  const query = typeof router.query.q === 'string' ? router.query.q.trim() : '';
  const pageNumber = Math.max(1, Number.parseInt(router.query.page, 10) || 1);
  const [input, setInput] = useState('');
  const [result, setResult] = useState({ status: 'idle', videos: [] });
  const [retry, setRetry] = useState(0);

  useEffect(() => setInput(query), [query]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retry explicitly reruns the same query after a failed request.
  useEffect(() => {
    if (!router.isReady || !query) {
      setResult({ status: 'idle', videos: [] });
      return undefined;
    }
    const controller = new AbortController();
    setResult({ status: 'loading', videos: [] });
    getCouchVideos({
      q: query,
      page: pageNumber,
      limit: PAGE_SIZE,
      sort: 'title',
      signal: controller.signal,
    })
      .then((videos) => {
        if (!Array.isArray(videos)) throw new Error('Invalid catalog response');
        if (!controller.signal.aborted) setResult({ status: 'ready', videos });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ status: 'error', videos: [] });
      });
    return () => controller.abort();
  }, [router.isReady, query, pageNumber, retry]);

  const searchHref = (page) => ({
    pathname: '/media/search',
    query: { q: query, ...(page > 1 ? { page } : {}) },
  });

  const submit = (event) => {
    event.preventDefault();
    const q = input.trim();
    if (q === query && pageNumber === 1) setRetry((current) => current + 1);
    else router.push({ pathname: '/media/search', query: q ? { q } : {} });
  };

  return (
    <>
      <Head>
        <title>Search films | Trick Book</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/media?tab=couch" className="inline-flex min-h-11 items-center underline">
          Back to The Couch
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Search films</h1>
        <p className="mt-2 text-muted-foreground">
          Find films, documentaries, edits, and tutorials from The Couch by title, rider, or
          producer.
        </p>
        <search aria-label="Film catalog">
          <form onSubmit={submit} className="my-6 max-w-2xl">
            <label htmlFor="film-query" className="mb-2 block font-medium">
              Search The Couch
            </label>
            <div className="flex gap-2">
              <input
                id="film-query"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={200}
                placeholder="Film, rider, or producer"
                className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
              />
              <Button
                type="submit"
                className="min-h-11 shrink-0 bg-yellow-500 text-black hover:bg-yellow-600"
              >
                <Search size={18} aria-hidden="true" />
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </form>
        </search>
        <section aria-labelledby="film-results-heading" aria-busy={result.status === 'loading'}>
          <h2 id="film-results-heading" className="mb-4 break-words text-xl font-semibold">
            {query ? `Results for “${query}”` : 'Find your next watch'}
          </h2>
          <output className="block" aria-live="polite">
            {result.status === 'idle' && (
              <span>Enter a film title, rider, or producer to search the catalog.</span>
            )}
            {result.status === 'loading' && (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Searching films…
              </span>
            )}
            {result.status === 'ready' && (
              <span className="mb-4 block text-muted-foreground">
                {result.videos.length
                  ? `${result.videos.length} ${result.videos.length === 1 ? 'film' : 'films'} on page ${pageNumber}.`
                  : pageNumber > 1
                    ? 'No more films on this page. Go back to the previous page or try another search.'
                    : 'No films found. Try a different title, rider, or producer.'}
              </span>
            )}
          </output>
          {result.status === 'error' && (
            <div role="alert" className="rounded-lg border border-border p-4">
              <p>We couldn’t load film results. Please try again.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 min-h-11"
                onClick={() => setRetry((current) => current + 1)}
              >
                Try again
              </Button>
            </div>
          )}
          {result.status === 'ready' && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {result.videos.map((video) => (
                  <VideoCard key={video._id || video.slug} video={video} className="!w-full" />
                ))}
              </div>
              <nav aria-label="Film results pages" className="mt-6 flex flex-wrap gap-3">
                {pageNumber > 1 && (
                  <Button asChild variant="outline" className="min-h-11">
                    <Link href={searchHref(pageNumber - 1)}>Previous page</Link>
                  </Button>
                )}
                {result.videos.length === PAGE_SIZE && (
                  <Button asChild variant="outline" className="min-h-11">
                    <Link href={searchHref(pageNumber + 1)}>Next page</Link>
                  </Button>
                )}
              </nav>
            </>
          )}
        </section>
      </div>
    </>
  );
}
