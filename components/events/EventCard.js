import { Bell, CalendarDays, ExternalLink, MapPin, Radio, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {
  formatDiscipline,
  formatEventDate,
  getEventAction,
  getEventLocation,
  getEventStatus,
  getPrimarySport,
  getSportMeta,
} from '../../lib/eventFormatters';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const STATUS_CLASSES = {
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  live: 'bg-red-500 text-white border-red-500',
};

export default function EventCard({ event, saved = false, onToggleSave }) {
  const date = formatEventDate(event);
  const sport = getSportMeta(getPrimarySport(event));
  const status = getEventStatus(event);
  const action = getEventAction(event);
  const detailUrl = `/events/${event.slug || event._id}`;

  return (
    <Card className="group overflow-hidden border-border hover:border-yellow-500 transition-all duration-200">
      <CardContent className="p-0">
        {event.image && (
          <Link href={detailUrl} className="block relative aspect-[16/7] overflow-hidden bg-muted">
            <img
              src={event.image}
              alt={`${event.title} event`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          </Link>
        )}
        <div className="flex">
          <div className="w-20 sm:w-24 flex-shrink-0 bg-yellow-400 text-black flex flex-col items-center justify-center px-2 py-5">
            <span className="text-xs font-black tracking-[0.18em]">{date.month}</span>
            <span className="text-3xl sm:text-4xl leading-none font-black mt-1">{date.day}</span>
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
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
                  {event.disciplines?.slice(0, 2).map((discipline) => (
                    <Badge key={discipline} variant="secondary">
                      {formatDiscipline(discipline)}
                    </Badge>
                  ))}
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

              <button
                type="button"
                onClick={() => onToggleSave?.(event)}
                className={`flex-shrink-0 h-10 w-10 rounded-full border flex items-center justify-center transition-colors ${
                  saved
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : 'border-border text-muted-foreground hover:border-yellow-500 hover:text-yellow-500'
                }`}
                aria-label={
                  saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`
                }
              >
                <Bell className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
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
        </div>
      </CardContent>
    </Card>
  );
}
