import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ExternalLink,
  Loader2,
  MapPin,
  PlayCircle,
  Radio,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

export default function EventDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = useFixtures ? getFixtureEvent(slug) : await getEvent(slug);
        if (!data) throw new Error('not found');
        if (active) setEvent(data);
      } catch (_error) {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 mr-3 animate-spin text-yellow-500" /> Loading event
      </div>
    );
  }

  if (notFound || !event) {
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
  const sourceChecked = event.freshness?.lastVerifiedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
        new Date(event.freshness.lastVerifiedAt),
      )
    : null;

  return (
    <>
      <Head>
        <title>{event.title} | TrickBook Events</title>
        <meta name="description" content={event.description || `Details for ${event.title}`} />
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
