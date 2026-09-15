import { ArrowLeft, CalendarDays } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import EventCard from './EventCard';

const SITE_URL = 'https://thetrickbook.com';

export default function EventHubPage({ title, description, canonicalPath, events }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: event.title,
      url: `${SITE_URL}/events/${event.slug}`,
    })),
  };

  return (
    <>
      <Head>
        <title>{title} | TrickBook Events</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${title} | TrickBook Events`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content and the serialized data is escaped.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemList).replace(/</g, '\\u003c'),
          }}
        />
      </Head>

      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-card/40">
          <div className="container py-10 md:py-14">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-yellow-500"
            >
              <ArrowLeft className="h-4 w-4" /> All events
            </Link>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{description}</p>
          </div>
        </section>

        <section className="container py-10">
          {events.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id || event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-yellow-500" />
              <h2 className="mt-4 text-xl font-bold text-foreground">No upcoming events yet</h2>
              <p className="mt-2 text-muted-foreground">
                Check the full calendar for newly added events and other sports.
              </p>
              <Link
                href="/events"
                className="mt-5 inline-block font-semibold text-yellow-600 no-underline hover:underline dark:text-yellow-400"
              >
                Browse all events
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
