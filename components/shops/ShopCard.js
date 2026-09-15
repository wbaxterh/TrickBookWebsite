import { ExternalLink, MapPin, Navigation, ShieldCheck, Store } from 'lucide-react';
import { formatDistance } from '../../lib/geo';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const SPORT_LABELS = {
  skateboarding: 'Skateboarding',
  snowboarding: 'Snowboarding',
  skiing: 'Skiing',
  surfing: 'Surfing',
  bmx: 'BMX',
  mtb: 'Mountain biking',
  rollerblading: 'Rollerblading',
};

export default function ShopCard({ shop, distanceMi }) {
  const address = shop.address || {};
  const location =
    [address.city, address.region].filter(Boolean).join(', ') || 'Location unavailable';
  return (
    <Card className="group h-full overflow-hidden border-border transition-all duration-200 hover:border-yellow-500">
      <CardContent className="flex h-full flex-col p-0">
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-yellow-500/40">
          <Store className="h-14 w-14 text-yellow-400 transition-transform group-hover:scale-110" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap gap-2">
            {(shop.sports || []).slice(0, 2).map((sport) => (
              <Badge key={sport} variant="outline" className="border-yellow-500/40">
                {SPORT_LABELS[sport] || sport}
              </Badge>
            ))}
            {distanceMi != null && (
              <Badge
                variant="outline"
                className="border-yellow-500/40 text-yellow-700 dark:text-yellow-300"
              >
                <Navigation className="mr-1 h-3 w-3" />
                {formatDistance(distanceMi)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-yellow-500">
              {shop.name}
            </h2>
            {shop.verified && (
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-emerald-500"
                aria-label="Verified shop"
              />
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{shop.description}</p>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-yellow-500" />
            {location}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(shop.services || []).map((service) => (
              <span
                key={service}
                className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground"
              >
                {service}
              </span>
            ))}
          </div>
          <div className="mt-auto pt-5">
            {shop.website ? (
              <Button asChild className="bg-yellow-400 font-bold text-black hover:bg-yellow-300">
                <a href={shop.website} target="_blank" rel="noreferrer">
                  Visit shop <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button disabled variant="outline">
                Website unavailable
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
