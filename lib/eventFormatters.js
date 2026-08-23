export const SPORT_OPTIONS = [
  { id: 'all', label: 'All sports', emoji: '🎯' },
  { id: 'skateboarding', label: 'Skateboarding', emoji: '🛹' },
  { id: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { id: 'skiing', label: 'Skiing / Freeski', emoji: '⛷️' },
  { id: 'bmx', label: 'BMX', emoji: '🚲' },
  { id: 'mtb', label: 'Mountain biking', emoji: '🚵' },
  { id: 'scooter', label: 'Scooter', emoji: '🛴' },
  { id: 'rollerblading', label: 'Rollerblading', emoji: '🛼' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'wakeboarding', label: 'Wakeboarding', emoji: '🌊' },
];

export const INTENT_OPTIONS = [
  { id: 'all', label: 'Any intent' },
  { id: 'compete', label: 'Enter' },
  { id: 'spectate_in_person', label: 'Watch in person' },
  { id: 'spectate_online', label: 'Watch online' },
  { id: 'community', label: 'Community' },
];

export const DATE_OPTIONS = [
  { id: 'all', label: 'Any date' },
  { id: 'week', label: 'This week' },
  { id: 'weekend', label: 'This weekend' },
  { id: 'month', label: 'Next 30 days' },
];

export function getPrimarySport(event) {
  return event?.sports?.[0] || 'action-sports';
}

export function getSportMeta(sport) {
  return (
    SPORT_OPTIONS.find((option) => option.id === sport) || {
      id: sport,
      label: sport?.replace(/-/g, ' ') || 'Action sports',
      emoji: '⚡',
    }
  );
}

export function formatEventDate(event, options = {}) {
  if (!event?.startAt) return { month: 'TBA', day: '', date: 'Date TBA', time: '' };

  const date = new Date(event.startAt);
  const timezone = event.timezone || undefined;
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: timezone };
  const timeOptions = { hour: 'numeric', minute: '2-digit', timeZone: timezone };

  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: timezone })
      .format(date)
      .toUpperCase(),
    day: new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: timezone }).format(date),
    date: new Intl.DateTimeFormat('en-US', dateOptions).format(date),
    time: event.timeTba ? 'Time TBA' : new Intl.DateTimeFormat('en-US', timeOptions).format(date),
    ...options,
  };
}

export function formatEventRange(event) {
  const start = formatEventDate(event);
  if (!event?.endAt) return `${start.date} · ${start.time}`;

  const end = new Date(event.endAt);
  const startDate = new Date(event.startAt);
  const timezone = event.timezone || undefined;
  const sameDay =
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(startDate) ===
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(end);

  if (sameDay) return `${start.date} · ${start.time}`;

  const endDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(end);
  return `${start.date} – ${endDate}`;
}

export function getEventLocation(event) {
  if (event?.isOnline && !event?.venue?.city) return 'Online';
  return (
    [event?.venue?.city, event?.venue?.region, event?.venue?.country].filter(Boolean).join(', ') ||
    'Location TBA'
  );
}

export function getEventAction(event) {
  const registration = event?.participation || {};
  const spectating = event?.spectating || {};

  if (registration.registrationStatus === 'open' && registration.registrationUrl) {
    return { label: 'Register', url: registration.registrationUrl, kind: 'register' };
  }
  if (spectating.ticketUrl) {
    return { label: 'Get tickets', url: spectating.ticketUrl, kind: 'tickets' };
  }
  if (spectating.streamUrl) {
    return { label: 'Watch', url: spectating.streamUrl, kind: 'watch' };
  }
  return { label: 'View details', url: null, kind: 'details' };
}

export function getEventStatus(event) {
  if (event?.status === 'cancelled') return { label: 'Cancelled', tone: 'danger' };
  if (event?.status === 'postponed') return { label: 'Postponed', tone: 'warning' };
  if (event?.participation?.registrationStatus === 'open') {
    return { label: 'Entry open', tone: 'success' };
  }
  if (event?.participation?.registrationStatus === 'closing_soon') {
    return { label: 'Entry closing', tone: 'warning' };
  }
  if (event?.spectating?.streamStatus === 'live') return { label: 'Live now', tone: 'live' };
  if (event?.spectating?.streamUrl) return { label: 'Livestream', tone: 'info' };
  if (event?.spectating?.inPerson) return { label: 'Watch in person', tone: 'info' };
  return null;
}
