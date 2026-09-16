import { ExternalLink, MapPin, Navigation, ShieldCheck, Star, Store } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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

function getShopImageCandidates(shop) {
  const candidates = [
    shop?.imageUrl,
    shop?.image,
    typeof shop?.image === 'object' ? shop?.image?.url : null,
  ]
    .filter(Boolean)
    .map((img) => (typeof img === 'string' ? img.trim() : ''))
    .filter(Boolean);
  return [...new Set(candidates)];
}

export default function ShopCard({ shop, distanceMi }) {
  const address = shop.address || {};
  const location =
    [address.city, address.region].filter(Boolean).join(', ') || 'Location unavailable';
  const detailUrl = `/shops/${shop.slug || shop._id}`;
  const imageAlt = shop.imageAlt || `${shop.name} storefront`;
  const hasRating = shop.reviewSummary?.rating != null;

  const imageCandidates = useMemo(() => getShopImageCandidates(shop), [shop]);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = imageCandidates[imageIndex];
  const hasValidImage = currentImage && imageIndex < imageCandidates.length;

  return (
    <Card className="group h-full overflow-hidden border-border transition-all duration-200 hover:border-yellow-500">
      <CardContent className="flex h-full flex-col p-0">
        <Link
          href={detailUrl}
          aria-label={`View ${shop.name}`}
          className="relative block aspect-[4/3] min-h-[180px] overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-800 to-yellow-500/40 no-underline"
        >
          {hasValidImage ? (
            <img
              src={currentImage}
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImageIndex((idx) => idx + 1)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store
                className="h-16 w-16 text-yellow-400 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {hasRating && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {shop.reviewSummary.rating.toFixed(1)}
            </span>
          )}
        </Link>
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
            <Link href={detailUrl} className="no-underline">
              <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-yellow-500">
                {shop.name}
              </h2>
            </Link>
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
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <Button asChild variant="outline">
              <Link href={detailUrl}>Details</Link>
            </Button>
            {shop.website ? (
              <Button asChild className="bg-yellow-400 font-bold text-black hover:bg-yellow-300">
                <a href={shop.website} target="_blank" rel="noreferrer">
                  Visit shop <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
