import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ExternalLink,
  MapPin,
  PlayCircle,
  Radio,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import EventCoverImage, { getEventImageCandidates } from '../../components/events/EventCoverImage';
import EventShareDialog from '../../components/events/EventShareDialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { getFixtureEvent } from '../../data/eventFixtures';
import { getEvent } from '../../lib/apiEvents';
import {
  formatEventRange,
  getEventAction,
  getEventLocation,
  getEventStatus,
  getPrimarySport,
  getSportMeta,
} from '../../lib/eventFormatters';

const useFixtures = process.env.NEXT_PUBLIC_EVENTS_USE_FIXTURES === 'true';
const SITE_URL = 'https://thetrickbook.com';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The detail layout conditionally renders independent event fields.
export default function EventDetailPage({ event }) {
  if (!event) {
    return (
      <div className="container py-24 text-center">
        <CalendarDays className="h-12 w-12 text-yellow-500 mx-auto" />
        <h1 className="text-2xl font-bold text-foreground mt-4">Event not found</h1>
        <p className="text-muted-foreground mt-2">This event may have moved or expired.</p>
        <Button asChild className="mt-6 bg-yellow-400 text-black hover:bg-yellow-300">
          <Link href="/events">Browse events</Link>
        </Button>
      </div>
    );
  }

  const action = getEventAction(event);
  const status = getEventStatus(event);
  const sport = getSportMeta(getPrimarySport(event));
  const canonicalUrl = `${SITE_URL}/events/${event.slug}`;
  const location = getEventLocation(event);
  const dateLabel = event.startAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: event.timezone || undefined,
      }).format(new Date(event.startAt))
    : null;
  const metaTitle = [event.title, dateLabel, location].filter(Boolean).join(' | ');
  const metaDescription =
    event.description ||
    `Find dates, location, registration, tickets, and viewing details for ${event.title}.`;
  const images = getEventImageCandidates(event);
  const structuredData = buildEventStructuredData(event, canonicalUrl, metaDescription, images);
  const sourceChecked = event.freshness?.lastVerifiedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
        new Date(event.freshness.lastVerifiedAt),
      )
    : null;

  return (
    <>
      <Head>
        <title>{metaTitle} | TrickBook Events</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The Trick Book" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta name="twitter:card" content={images[0] ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {images[0] && <meta name="twitter:image" content={images[0]} />}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content; '<' is escaped above.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      </Head>

      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-card/40">
          <div className="container py-8 md:py-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 no-underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>

            <EventCoverImage
              key={event._id || event.slug}
              event={event}
              variant="hero"
              className="mt-7"
            />

            <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-7">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-yellow-500/40">
                    <span className="mr-1">{sport.emoji}</span> {sport.label}
                  </Badge>
                  {event.disciplines?.map((discipline) => (
                    <Badge key={discipline} variant="secondary" className="capitalize">
                      {discipline.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {status && <Badge>{status.label}</Badge>}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mt-4">
                  {event.title}
                </h1>
                <div className="grid sm:grid-cols-2 gap-3 mt-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-yellow-500" />
                    {formatEventRange(event)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-yellow-500" />
                    {getEventLocation(event)}
                  </div>
                </div>
              </div>

              <Card className="border-yellow-500/30 shadow-lg">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary action
                  </p>
                  {action.url ? (
                    <Button
                      asChild
                      className="w-full mt-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
                    >
                      <a href={action.url} target="_blank" rel="noreferrer">
                        {action.label} <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full mt-3" disabled>
                      Details coming soon
                    </Button>
                  )}
                  <Button variant="outline" className="w-full mt-2" disabled>
                    <Bell className="h-4 w-4 mr-2" /> Save event
                  </Button>
                  <EventShareDialog event={event} />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Registration, ticketing, and streaming happen on the official source.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container py-10">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">About this event</h2>
                <p className="text-muted-foreground leading-7 mt-3">
                  {event.description || 'More event information is coming soon.'}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">At a glance</h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <InfoItem
                    icon={Users}
                    label="Who can enter"
                    value={
                      event.participation?.eligibilityText ||
                      event.level?.join(', ') ||
                      'Check organizer'
                    }
                  />
                  <InfoItem
                    icon={Ticket}
                    label="Registration"
                    value={
                      event.participation?.registrationStatus?.replace(/_/g, ' ') || 'Not published'
                    }
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Venue"
                    value={event.venue?.name || getEventLocation(event)}
                  />
                  <InfoItem
                    icon={Radio}
                    label="Viewing"
                    value={
                      event.spectating?.streamUrl
                        ? `Online${event.spectating.broadcaster ? ` on ${event.spectating.broadcaster}` : ''}`
                        : event.spectating?.inPerson
                          ? 'In person'
                          : 'Check organizer'
                    }
                  />
                </div>
              </div>

              {(event.externalLinks?.length > 0 || event.media?.videos?.length > 0) && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Event links</h2>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {event.externalLinks?.map((link) => (
                      <a
                        key={`${link.kind}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-border bg-card p-4 no-underline hover:border-yellow-500/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <ExternalLink className="h-4 w-4 text-yellow-500" />
                          {link.kind === 'registration' ? 'Registration' : 'Official source'}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-2">
                          {link.label || 'Open link'}
                        </p>
                      </a>
                    ))}
                    {event.media?.videos?.map((video) => (
                      <a
                        key={video.url}
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-border bg-card p-4 no-underline hover:border-yellow-500/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <PlayCircle className="h-4 w-4 text-yellow-500" /> Previous event video
                        </div>
                        <p className="text-sm font-medium text-foreground mt-2">
                          {video.label || 'Watch video'}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    {event.organizer?.verified && (
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    )}
                    <h2 className="font-bold text-foreground">Source</h2>
                  </div>
                  <p className="font-medium text-foreground mt-3">
                    {event.organizer?.name || 'Event organizer'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.sourceTrust?.replace(/_/g, ' ') || 'Source attribution pending'}
                  </p>
                  {sourceChecked && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Last checked {sourceChecked}
                    </p>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  try {
    const event = useFixtures ? getFixtureEvent(params.slug) : await getEvent(params.slug);
    if (!event) return { notFound: true };

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return {
      props: { event },
    };
  } catch (_error) {
    return { notFound: true };
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Schema.org output intentionally maps optional event fields.
function buildEventStructuredData(event, canonicalUrl, description, images) {
  const action = getEventAction(event);
  const physicalLocation = [
    event.venue?.name,
    event.venue?.address,
    event.venue?.city,
    event.venue?.region,
    event.venue?.country,
  ].some(Boolean);
  const online = Boolean(event.isOnline || event.spectating?.streamUrl);
  const schemaStatus = {
    cancelled: 'https://schema.org/EventCancelled',
    completed: 'https://schema.org/EventCompleted',
    postponed: 'https://schema.org/EventPostponed',
    rescheduled: 'https://schema.org/EventRescheduled',
    scheduled: 'https://schema.org/EventScheduled',
  }[event.status || 'scheduled'];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description,
    url: canonicalUrl,
    startDate: event.startAt,
    endDate: event.endAt || undefined,
    eventStatus: schemaStatus || 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      online && physicalLocation
        ? 'https://schema.org/MixedEventAttendanceMode'
        : online
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
    image: images.length ? images : undefined,
    organizer: event.organizer?.name
      ? {
          '@type': 'Organization',
          name: event.organizer.name,
          url: event.organizer.url || undefined,
        }
      : undefined,
    location: physicalLocation
      ? {
          '@type': 'Place',
          name: event.venue?.name || getEventLocation(event),
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.venue?.address || undefined,
            addressLocality: event.venue?.city || undefined,
            addressRegion: event.venue?.region || undefined,
            addressCountry: event.venue?.country || undefined,
          },
        }
      : online
        ? {
            '@type': 'VirtualLocation',
            url: event.spectating?.streamUrl || action.url || canonicalUrl,
          }
        : undefined,
    offers: action.url
      ? {
          '@type': 'Offer',
          url: action.url,
          availability:
            event.participation?.registrationStatus === 'sold_out'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          validFrom: event.participation?.registrationOpensAt || undefined,
        }
      : undefined,
    previousStartDate: event.previousStartAt || undefined,
  };

  return JSON.parse(JSON.stringify(data));
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-yellow-500" /> {label}
      </div>
      <p className="text-sm font-medium text-foreground mt-2 capitalize">{value}</p>
    </div>
  );
}
