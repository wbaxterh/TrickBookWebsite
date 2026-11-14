import { ArrowRight, MapPin, Puzzle } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

const actionClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500';

export default function ChromeExtensionPage() {
  return (
    <>
      <Head>
        <title>Chrome Extension — Currently Unavailable | TrickBook</title>
        <meta
          name="description"
          content="The TrickBook Chrome extension is currently unavailable. Browse spots or add a spot directly on TrickBook instead."
        />
        <link rel="canonical" href="https://thetrickbook.com/chrome-extension" />
      </Head>
      <section
        aria-labelledby="extension-title"
        className="container mx-auto max-w-3xl px-4 py-12 md:py-20"
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
          <Puzzle className="mb-5 h-10 w-10 text-yellow-500" aria-hidden="true" />
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Chrome extension</p>
          <h1 id="extension-title" className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Currently unavailable
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground">
            The TrickBook Chrome extension is not available to download or install right now. We
            don’t have a return date to share.
          </p>
          <p className="mb-6 text-base leading-relaxed text-muted-foreground">
            You can still find places to ride and add a spot directly on TrickBook. No extension
            needed.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/spots"
              className={`${actionClass} bg-yellow-500 text-black hover:bg-yellow-400`}
            >
              <MapPin className="h-4 w-4" aria-hidden="true" /> Browse spots
            </Link>
            <Link
              href="/spots/add"
              className={`${actionClass} border border-border text-foreground hover:bg-muted`}
            >
              Add a spot <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Adding a spot requires signing in.</p>
        </div>
      </section>
    </>
  );
}
