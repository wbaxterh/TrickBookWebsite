import {
  Bell,
  CalendarDays,
  ExternalLink,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  formatEventDate,
  getEventAction,
  getEventLocation,
  getEventStatus,
  getPrimarySport,
  getSportMeta,
} from '../../lib/eventFormatters';
import { formatDistance } from '../../lib/geo';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import EventCoverImage from './EventCoverImage';

const STATUS_CLASSES = {
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  live: 'bg-red-500 text-white border-red-500',
};

export default function EventCard({ event, saved = false, onToggleSave, distanceMi = null }) {
  const date = formatEventDate(event);
  const sport = getSportMeta(getPrimarySport(event));
  const status = getEventStatus(event);
  const action = getEventAction(event);
  const detailUrl = `/events/${event.slug || event._id}`;
  const distanceLabel = formatDistance(distanceMi);

  return (
    <Card className="group h-full overflow-hidden border-border hover:border-yellow-500 transition-all duration-200">
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative">
          <Link href={detailUrl} className="block no-underline" aria-label={`View ${event.title}`}>
            <EventCoverImage key={event._id || event.slug} event={event} />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex min-w-14 flex-col items-center rounded-lg bg-yellow-400 px-2.5 py-2 text-black shadow-lg">
            <span className="text-[10px] font-black leading-none tracking-[0.16em]">
              {date.month}
            </span>
            <span className="mt-1 text-2xl font-black leading-none">{date.day}</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave?.(event)}
            className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition-colors ${
              saved
                ? 'border-yellow-400 bg-yellow-400 text-black'
                : 'border-white/50 bg-black/70 text-white hover:border-yellow-400 hover:text-yellow-400'
            }`}
            aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          >
            <Bell className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="border-yellow-500/40">
                <span className="mr-1">{sport.emoji}</span>
                {sport.label}
              </Badge>
              {status && (
                <Badge variant="outline" className={STATUS_CLASSES[status.tone]}>
                  {status.tone === 'live' && <Radio className="h-3 w-3 mr-1" />}
                  {status.label}
                </Badge>
              )}
              {distanceLabel && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/40 text-yellow-700 dark:text-yellow-300"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  {distanceLabel}
                </Badge>
              )}
            </div>

            <Link href={detailUrl} className="no-underline">
              <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-yellow-500 transition-colors line-clamp-2">
                {event.title}
              </h2>
            </Link>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-yellow-500" />
                {date.date} · {date.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-yellow-500" />
                {getEventLocation(event)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              {event.organizer?.verified && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <span>{event.organizer?.name || 'Event organizer'}</span>
              {event.organizer?.verified && <span>· Verified source</span>}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {action.url ? (
              <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold">
                <a href={action.url} target="_blank" rel="noreferrer">
                  {action.label}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold">
                <Link href={detailUrl}>{action.label}</Link>
              </Button>
            )}
            {action.url && (
              <Button asChild variant="outline">
                <Link href={detailUrl}>Details</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
