import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { trackRelatedEventClick } from '../../lib/analytics';
import {
  formatEventDate,
  getEventLocation,
  getPrimarySport,
  getSportMeta,
} from '../../lib/eventFormatters';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import EventCoverImage from './EventCoverImage';

export default function RelatedEvents({ event, events }) {
  if (!events?.length) return null;
  const sport = getSportMeta(getPrimarySport(event));

  return (
    <section aria-labelledby="related-events-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400">
            Keep exploring
          </p>
          <h2 id="related-events-heading" className="mt-1 text-2xl font-bold text-foreground">
            Related events
          </h2>
        </div>
        <Link
          href={`/events/sport/${sport.id}`}
          className="text-sm font-semibold text-yellow-600 no-underline hover:underline dark:text-yellow-400"
        >
          Browse {sport.label.toLowerCase()}
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {events.map((related) => {
          const date = formatEventDate(related);
          const sport = getSportMeta(getPrimarySport(related));
          return (
            <Card
              key={related._id || related.slug}
              className="group overflow-hidden hover:border-yellow-500"
            >
              <Link
                href={`/events/${related.slug}`}
                className="block h-full no-underline"
                onClick={() => trackRelatedEventClick(event, related)}
              >
                <EventCoverImage event={related} />
                <CardContent className="p-4">
                  <Badge variant="outline" className="border-yellow-500/40">
                    <span className="mr-1">{sport.emoji}</span> {sport.label}
                  </Badge>
                  <h3 className="mt-3 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-yellow-500">
                    {related.title}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-yellow-500" /> {date.date}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-yellow-500" /> {getEventLocation(related)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
