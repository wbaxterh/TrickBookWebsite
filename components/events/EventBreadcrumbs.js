import Link from 'next/link';
import { getPrimarySport, getSportMeta } from '../../lib/eventFormatters';

export default function EventBreadcrumbs({ event }) {
  const sport = getSportMeta(getPrimarySport(event));
  const region = event.venue?.region;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      <Link href="/events" className="no-underline hover:text-yellow-500">
        Events
      </Link>
      <span aria-hidden="true">/</span>
      <Link href={`/events/sport/${sport.id}`} className="no-underline hover:text-yellow-500">
        {sport.label}
      </Link>
      {region && (
        <>
          <span aria-hidden="true">/</span>
          <Link
            href={`/events/region/${encodeURIComponent(region)}`}
            className="no-underline hover:text-yellow-500"
          >
            {region}
          </Link>
        </>
      )}
      <span aria-hidden="true">/</span>
      <span className="max-w-full truncate text-foreground" aria-current="page">
        {event.title}
      </span>
    </nav>
  );
}
