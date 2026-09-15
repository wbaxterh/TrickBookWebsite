import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { SHOP_FIXTURES } from '../../data/shopFixtures';
import { getShop } from '../../lib/apiShops';

const SPORT_LABELS = {
  skateboarding: 'Skateboarding',
  snowboarding: 'Snowboarding',
  skiing: 'Skiing',
  surfing: 'Surfing',
  bmx: 'BMX',
  mtb: 'Mountain biking',
  scooter: 'Scootering',
  rollerblading: 'Rollerblading',
  wakeboarding: 'Wakeboarding',
};

function formatAddress(address = {}) {
  return [
    address.street,
    [address.city, address.region, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ]
    .filter(Boolean)
    .join('\n');
}

function directionsUrl(shop) {
  const address = formatAddress(shop.address);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || shop.name)}`;
}

export default function ShopDetailPage({ shop }) {
  const title = `${shop.name} | TrickBook Shops`;
  const description =
    shop.description ||
    `View sports, services, location, and contact information for ${shop.name}.`;
  const address = formatAddress(shop.address);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`https://thetrickbook.com/shops/${shop.slug}`} />
      </Head>
      <main className="min-h-screen bg-background">
        <section className="container py-8 md:py-12">
          <Link
            href="/shops"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4" /> All shops
          </Link>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex min-h-52 items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-800 to-yellow-500/40 px-6 py-12">
              {shop.imageUrl ? (
                <img
                  src={shop.imageUrl}
                  alt={`${shop.name} storefront`}
                  className="max-h-72 w-full rounded-xl object-cover"
                />
              ) : (
                <Store className="h-24 w-24 text-yellow-400" />
              )}
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-foreground md:text-4xl">{shop.name}</h1>
                    {shop.verified && (
                      <ShieldCheck
                        className="h-6 w-6 shrink-0 text-emerald-500"
                        aria-label="Verified shop"
                      />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(shop.sports || []).map((sport) => (
                      <Badge key={sport} variant="outline" className="border-yellow-500/40">
                        {SPORT_LABELS[sport] || sport}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shop.website && (
                    <Button
                      asChild
                      className="bg-yellow-400 font-bold text-black hover:bg-yellow-300"
                    >
                      <a href={shop.website} target="_blank" rel="noreferrer">
                        Visit website <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {address && (
                    <Button asChild variant="outline">
                      <a href={directionsUrl(shop)} target="_blank" rel="noreferrer">
                        Directions <MapPin className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="border-border lg:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground">What they offer</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(shop.services || []).map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-yellow-500/15 px-3 py-1.5 text-sm capitalize text-yellow-700 dark:text-yellow-300"
                    >
                      {service}
                    </span>
                  ))}
                  {!shop.services?.length && (
                    <p className="text-sm text-muted-foreground">
                      Service details are coming soon.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-bold text-foreground">Shop information</h2>
                {address && (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    <span className="whitespace-pre-line">{address}</span>
                  </div>
                )}
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground no-underline hover:text-yellow-500"
                  >
                    <Phone className="h-4 w-4 text-yellow-500" /> {shop.phone}
                  </a>
                )}
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground no-underline hover:text-yellow-500"
                  >
                    <Globe2 className="h-4 w-4 text-yellow-500" /> Website
                  </a>
                )}
                {shop.hours && (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    <span>
                      {typeof shop.hours === 'string' ? shop.hours : 'See website for hours'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  try {
    const shop = await getShop(params.slug);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return { props: { shop } };
  } catch (_error) {
    const fixture = SHOP_FIXTURES.find(
      (shop) => shop.slug === params.slug || shop._id === params.slug,
    );
    if (fixture) return { props: { shop: fixture } };
    return { notFound: true };
  }
}
