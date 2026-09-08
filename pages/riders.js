import { Search, Users } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import UserAvatar from '../components/UserAvatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { getEditorialRiders, getRiders } from '../lib/apiRiders';

const SPORTS = ['', 'Skateboarding', 'BMX', 'Snowboarding', 'Surfing', 'Wakeboarding'];

export default function Riders() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('');
  const [riders, setRiders] = useState([]);
  const [proRiders, setProRiders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        // The pro section is additive — if it fails, the community directory
        // still renders.
        const [memberResult, proResult] = await Promise.allSettled([
          getRiders({ q: query, sport, page }),
          getEditorialRiders({ q: query, sport }),
        ]);
        if (memberResult.status === 'rejected') throw memberResult.reason;
        const data = memberResult.value;
        setRiders(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
        setProRiders(proResult.status === 'fulfilled' ? proResult.value.items || [] : []);
      } catch (_error) {
        setError('The rider directory could not be loaded. Try again in a moment.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, sport, page]);

  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <>
      <Head>
        <title>Riders | TrickBook</title>
        <meta name="description" content="Discover action-sports riders on TrickBook." />
      </Head>
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Riders</h1>
          </div>
          <p className="text-muted-foreground">
            Discover the people progressing action sports on TrickBook.
          </p>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="relative">
            <span className="sr-only">Search riders</span>
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              className="pl-10"
              placeholder="Search riders, nicknames, or locations"
            />
          </label>
          <select
            aria-label="Filter by sport"
            value={sport}
            onChange={(event) => {
              setSport(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3"
          >
            {SPORTS.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'All sports'}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="py-16 text-center text-muted-foreground">Loading riders…</p>}
        {error && <p className="py-16 text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <p className="mb-4 text-sm text-muted-foreground">{total + proRiders.length} riders</p>
        )}
        {!loading && !error && riders.length === 0 && proRiders.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No riders match those filters yet.
          </p>
        )}

        {!loading && !error && (riders.length > 0 || proRiders.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proRiders.map((rider) => (
              <Link href={`/riders/${rider.slug}`} key={rider.slug} className="no-underline">
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-yellow-500">
                  <CardContent className="flex gap-4 p-5">
                    {rider.profileImage?.url || rider.heroImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(rider.profileImage || rider.heroImage).url}
                        alt={(rider.profileImage || rider.heroImage).alt || rider.canonicalName}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-black">
                        {rider.canonicalName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate text-lg font-semibold">{rider.canonicalName}</h2>
                        {rider.rep?.score > 0 && (
                          <span
                            className="shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-bold text-yellow-600"
                            title="Rep score"
                          >
                            {rider.rep.score} rep
                          </span>
                        )}
                      </div>
                      {(rider.nationality || rider.homeRegion) && (
                        <p className="truncate text-sm text-muted-foreground">
                          {[rider.nationality, rider.homeRegion].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {rider.biography && (
                        <p className="mt-2 line-clamp-2 text-sm">{rider.biography}</p>
                      )}
                      <p className="mt-3 text-xs font-medium capitalize text-yellow-600">
                        {rider.primarySport}
                        {rider.sponsors?.length
                          ? ` · ${rider.sponsors.slice(0, 3).join(' · ')}`
                          : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {riders.map((rider) => (
              <Link href={`/profile/${rider._id}`} key={rider._id} className="no-underline">
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-yellow-500">
                  <CardContent className="flex gap-4 p-5">
                    <UserAvatar user={rider} size={64} />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">
                        {rider.riderProfile?.nickname || rider.name}
                      </h2>
                      {rider.riderProfile?.nickname && (
                        <p className="truncate text-sm text-muted-foreground">{rider.name}</p>
                      )}
                      {rider.bio && <p className="mt-2 line-clamp-2 text-sm">{rider.bio}</p>}
                      {!rider.bio && rider.riderProfile?.riderStyle && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {rider.riderProfile.riderStyle}
                          {rider.riderProfile?.nationality
                            ? ` · ${rider.riderProfile.nationality}`
                            : ''}
                        </p>
                      )}
                      <p className="mt-3 text-xs font-medium text-yellow-600">
                        {(rider.sports || []).join(' · ') || 'Action sports'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {pages}
            </span>
            <Button variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
