import { CalendarPlus, Download } from 'lucide-react';
import { trackCalendarAdded } from '../../lib/analytics';
import { getEventLocation } from '../../lib/eventFormatters';
import { Button } from '../ui/button';

function utcDate(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function localDate(value, timezone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone || 'UTC',
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}${parts.month}${parts.day}`;
}

function nextDate(value) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10).replace(/-/g, '');
}

function calendarDates(event) {
  if (event.timeTba) {
    const start = localDate(event.startAt, event.timezone);
    const lastDay = localDate(event.endAt || event.startAt, event.timezone);
    return { google: `${start}/${nextDate(lastDay)}`, icsStart: start, icsEnd: nextDate(lastDay) };
  }

  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return {
    google: `${utcDate(start)}/${utcDate(end)}`,
    icsStart: utcDate(start),
    icsEnd: utcDate(end),
  };
}

function eventUrl(event) {
  return `https://thetrickbook.com/events/${event.slug}`;
}

function googleCalendarUrl(event) {
  const dates = calendarDates(event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: dates.google,
    details: `${event.description || ''}\n\n${eventUrl(event)}`.trim(),
    location: getEventLocation(event),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function downloadIcs(event) {
  const dates = calendarDates(event);
  const url = eventUrl(event);
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrickBook//Events//EN',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(event._id || event.slug)}@thetrickbook.com`,
    `DTSTAMP:${utcDate(new Date())}`,
    `${event.timeTba ? 'DTSTART;VALUE=DATE' : 'DTSTART'}:${dates.icsStart}`,
    `${event.timeTba ? 'DTEND;VALUE=DATE' : 'DTEND'}:${dates.icsEnd}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(`${event.description || ''}\n\n${url}`.trim())}`,
    `LOCATION:${escapeIcs(getEventLocation(event))}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
  const objectUrl = URL.createObjectURL(
    new Blob([content], { type: 'text/calendar;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${event.slug || 'trickbook-event'}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export default function EventCalendarActions({ event }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <Button asChild variant="outline" className="px-2">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackCalendarAdded(event, 'google')}
        >
          <CalendarPlus className="h-4 w-4 mr-2" /> Google
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="px-2"
        onClick={() => {
          downloadIcs(event);
          trackCalendarAdded(event, 'ics');
        }}
      >
        <Download className="h-4 w-4 mr-2" /> .ics
      </Button>
    </div>
  );
}
