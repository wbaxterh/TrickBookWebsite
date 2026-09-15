import { ExternalLink, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { trackEventSpotClick } from '../../lib/analytics';
import { spotDetailHref } from '../../lib/eventSpot';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

function locationOf(spot) {
  return [spot.city, spot.state, spot.country].filter(Boolean).join(', ');
}

function mapsUrl(spot) {
  const lat = spot.latitude ?? spot.lat;
  const lng = spot.longitude ?? spot.lng;
  const query =
    lat != null && lng != null
      ? `${lat},${lng}`
      : [spot.name, locationOf(spot)].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function EventVenueSpot({ event, resolvedSpot }) {
  if (!resolvedSpot?.spot) return null;
  const { spot, match } = resolvedSpot;

  return (
    <Card className="overflow-hidden border-yellow-500/30">
      {spot.imageURL && (
        <img src={spot.imageURL} alt={spot.name} className="aspect-[16/8] w-full object-cover" />
      )}
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          TrickBook Spot
        </p>
        <h2 className="mt-2 font-bold text-foreground">{spot.name}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-yellow-500" /> {locationOf(spot)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {spot.category && <Badge variant="secondary">{spot.category}</Badge>}
          {typeof spot.rating === 'number' && spot.rating > 0 && (
            <Badge variant="outline">
              <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
              {spot.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <Button
          asChild
          className="mt-4 w-full bg-yellow-400 font-bold text-black hover:bg-yellow-300"
        >
          <Link
            href={spotDetailHref(spot)}
            onClick={() => trackEventSpotClick(event, spot, match, 'details')}
          >
            View this Spot <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="mt-2 w-full">
          <a
            href={mapsUrl(spot)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEventSpotClick(event, spot, match, 'maps')}
          >
            Open in Maps
          </a>
        </Button>
        {match === 'inferred' && (
          <p className="mt-3 text-xs text-muted-foreground">
            Matched from the published venue name and location.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
