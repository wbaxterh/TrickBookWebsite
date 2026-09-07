import { ArrowLeft, Award, Film, Flame, Globe, MapPin } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent } from '../../components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

export default function EditorialRiderProfile({ rider }) {
  const location = [rider.nationality, rider.homeRegion].filter(Boolean).join(' · ');
  const instagram = rider.socialLinks?.find((link) => link.platform === 'instagram');

  return (
    <>
      <Head>
        <title>{`${rider.canonicalName} | Riders | TrickBook`}</title>
        <meta
          name="description"
          content={rider.biography?.slice(0, 155) || `${rider.canonicalName} on TrickBook.`}
        />
      </Head>
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <Link
          href="/riders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All riders
        </Link>

        <div className="mb-8 flex items-start gap-5">
          {rider.heroImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rider.heroImage.url}
              alt={rider.heroImage.alt || rider.canonicalName}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-4xl font-bold text-black">
              {rider.canonicalName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-bold">{rider.canonicalName}</h1>
            <p className="mt-1 font-medium capitalize text-yellow-600">
              {rider.primarySport}
              {rider.stance ? ` · ${rider.stance}` : ''}
              {rider.disciplines?.length ? ` · ${rider.disciplines.join(', ')}` : ''}
            </p>
            {location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {location}
              </p>
            )}
          </div>
          {rider.rep?.score > 0 && (
            <div className="shrink-0 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-center">
              <p className="flex items-center gap-1 text-3xl font-bold text-yellow-500">
                <Flame className="h-6 w-6" /> {rider.rep.score}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rep
              </p>
            </div>
          )}
        </div>

        {rider.biography && (
          <p className="mb-8 max-w-3xl text-lg leading-relaxed">{rider.biography}</p>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {rider.sponsors?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-semibold">Sponsors</h2>
                <div className="flex flex-wrap gap-2">
                  {rider.sponsors.map((sponsor) => (
                    <span
                      key={sponsor}
                      className="rounded-full border border-input px-3 py-1 text-sm"
                    >
                      {sponsor}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {rider.notableResults?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Award className="h-5 w-5 text-yellow-500" /> Notable results
                </h2>
                <ul className="space-y-2 text-sm">
                  {rider.notableResults.map((result) => (
                    <li
                      key={`${result.event}-${result.year}`}
                      className="flex justify-between gap-3"
                    >
                      <span>
                        {result.event}
                        {result.year ? ` (${result.year})` : ''}
                      </span>
                      <span className="shrink-0 font-medium text-yellow-600">
                        {result.placement}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {rider.couchCredits?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Film className="h-5 w-5 text-yellow-500" /> Watch on the Couch
                </h2>
                <ul className="space-y-2 text-sm">
                  {rider.couchCredits.map((credit) => (
                    <li key={credit.filmId}>
                      {credit.filmSlug ? (
                        <Link
                          href={`/media/couch/${credit.filmSlug}`}
                          className="hover:text-yellow-500"
                        >
                          {credit.filmTitle
                            ? `${credit.filmTitle} — ${credit.context || 'featured rider'}`
                            : credit.context || credit.creditedName}
                        </Link>
                      ) : (
                        credit.context || credit.creditedName
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {rider.rep?.breakdown && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Flame className="h-5 w-5 text-yellow-500" /> Rep breakdown
                </h2>
                <ul className="space-y-2 text-sm">
                  {[
                    ['Video parts & film credits', rider.rep.breakdown.parts, 40],
                    ['Contest results & awards', rider.rep.breakdown.results, 35],
                    ['Social & web presence', rider.rep.breakdown.social, 10],
                    ['Years active', rider.rep.breakdown.longevity, 10],
                    ['Independent sourcing', rider.rep.breakdown.evidence, 5],
                  ].map(([label, value, cap]) => (
                    <li key={label}>
                      <div className="flex justify-between gap-3">
                        <span>{label}</span>
                        <span className="shrink-0 font-medium text-yellow-600">
                          {value}/{cap}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-yellow-500"
                          style={{ width: `${Math.min(100, (value / cap) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(instagram || rider.officialWebsite) && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Globe className="h-5 w-5 text-yellow-500" /> Links
                </h2>
                <ul className="space-y-2 text-sm">
                  {instagram && (
                    <li>
                      <a href={instagram.url} target="_blank" rel="noopener noreferrer">
                        Instagram
                      </a>
                    </li>
                  )}
                  {rider.officialWebsite && (
                    <li>
                      <a href={rider.officialWebsite} target="_blank" rel="noopener noreferrer">
                        Official website
                      </a>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {rider.sourceEvidence?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Editorial profile compiled from{' '}
            {rider.sourceEvidence.map((source, index) => (
              <span key={source.url}>
                {index > 0 && ', '}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.publisher || new URL(source.url).hostname}
                </a>
              </span>
            ))}
            .
            {rider.claimStatus === 'unclaimed' &&
              ' Are you this rider? Contact us to claim your profile.'}
          </p>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/riders/editorial/${encodeURIComponent(params.slug)}`,
    );
    if (response.status === 404) return { notFound: true };
    if (!response.ok) throw new Error(`Riders API returned ${response.status}`);
    const rider = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return { props: { rider } };
  } catch {
    return { notFound: true };
  }
}
