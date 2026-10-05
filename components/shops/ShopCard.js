import { ExternalLink, MapPin, Navigation, ShieldCheck, Star, Store, Users } from 'lucide-react';
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
  const hasGoogleRating = shop.reviewSummary?.rating != null;
  const hasTrickBookRating =
    shop.userRating?.averageRating != null && shop.userRating?.ratingCount > 0;

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
          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
            {hasTrickBookRating && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-1 text-xs font-semibold text-black backdrop-blur-sm"
                title={`TrickBook rating: ${shop.userRating.averageRating.toFixed(1)} (${shop.userRating.ratingCount} ratings)`}
              >
                <Users className="h-3 w-3" aria-hidden="true" />
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                {shop.userRating.averageRating.toFixed(1)}
                <span className="text-[10px] opacity-75">({shop.userRating.ratingCount})</span>
              </span>
            )}
            {hasGoogleRating && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                title={`Google rating: ${shop.reviewSummary.rating.toFixed(1)}`}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {shop.reviewSummary.rating.toFixed(1)}
              </span>
            )}
          </div>
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
