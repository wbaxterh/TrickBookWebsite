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
const PAGE_SIZE = 24;

function Pager({ page, pages, onPrev, onNext }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={onPrev}>
        Previous
      </Button>
      <span className="text-sm">
        Page {page} of {pages}
      </span>
      <Button variant="outline" disabled={page >= pages} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}

export default function Riders() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('');

  // Community members (`/riders`) and editorial pros (`/riders/editorial`) are
  // two separate collections with independent totals, so each paginates on its
  // own. Merging them into one paginator would either hide most pros or require
  // arbitrary cross-collection offsets the API doesn't support.
  const [riders, setRiders] = useState([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberPages, setMemberPages] = useState(1);
  const [memberTotal, setMemberTotal] = useState(0);

  const [proRiders, setProRiders] = useState([]);
  const [proPage, setProPage] = useState(1);
  const [proPages, setProPages] = useState(1);
  const [proTotal, setProTotal] = useState(0);

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
          getRiders({ q: query, sport, page: memberPage, limit: PAGE_SIZE }),
          getEditorialRiders({ q: query, sport, page: proPage, limit: PAGE_SIZE }),
        ]);
        if (memberResult.status === 'rejected') throw memberResult.reason;
        const data = memberResult.value;
        setRiders(data.items || []);
        setMemberPages(data.pages || 1);
        setMemberTotal(data.total || 0);
        if (proResult.status === 'fulfilled') {
          setProRiders(proResult.value.items || []);
          setProPages(proResult.value.pages || 1);
          setProTotal(proResult.value.total || 0);
        } else {
          setProRiders([]);
          setProPages(1);
          setProTotal(0);
        }
      } catch (_error) {
        setError('The rider directory could not be loaded. Try again in a moment.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, sport, memberPage, proPage]);

  // Any change to the search or sport filter restarts both directories at
  // page 1 so the new results are shown from the top.
  const updateQuery = (value) => {
    setQuery(value);
    setMemberPage(1);
    setProPage(1);
  };

  const updateSport = (value) => {
    setSport(value);
    setMemberPage(1);
    setProPage(1);
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
            onChange={(event) => updateSport(event.target.value)}
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
          <p className="mb-4 text-sm text-muted-foreground">{memberTotal + proTotal} riders</p>
        )}
        {!loading && !error && riders.length === 0 && proRiders.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No riders match those filters yet.
          </p>
        )}

        {!loading && !error && proRiders.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">
              Pro riders
              <span className="ml-2 text-sm font-normal text-muted-foreground">{proTotal}</span>
            </h2>
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
                          <h3 className="truncate text-lg font-semibold">{rider.canonicalName}</h3>
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
            </div>
            <Pager
              page={proPage}
              pages={proPages}
              onPrev={() => setProPage((p) => Math.max(1, p - 1))}
              onNext={() => setProPage((p) => Math.min(proPages, p + 1))}
            />
          </section>
        )}

        {!loading && !error && riders.length > 0 && (
          <section>
            {proRiders.length > 0 && (
              <h2 className="mb-4 text-xl font-semibold">
                Community
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {memberTotal}
                </span>
              </h2>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {riders.map((rider) => (
                <Link href={`/profile/${rider._id}`} key={rider._id} className="no-underline">
                  <Card className="h-full transition hover:-translate-y-0.5 hover:border-yellow-500">
                    <CardContent className="flex gap-4 p-5">
                      <UserAvatar user={rider} size={64} />
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">
                          {rider.riderProfile?.nickname || rider.name}
                        </h3>
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
            <Pager
              page={memberPage}
              pages={memberPages}
              onPrev={() => setMemberPage((p) => Math.max(1, p - 1))}
              onNext={() => setMemberPage((p) => Math.min(memberPages, p + 1))}
            />
          </section>
        )}
      </main>
    </>
  );
}
