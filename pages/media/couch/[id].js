import { ArrowLeft, ExternalLink, Heart, MapPin, MessageCircle, Play, Share2 } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import CouchComments from '../../../components/media/CouchComments';
import VideoPlayer from '../../../components/media/VideoPlayer';
import {
  addVideoReaction,
  getVideoReaction,
  getVideoStreamUrl,
  removeVideoReaction,
} from '../../../lib/apiMedia';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';
const SITE_URL = 'https://thetrickbook.com';

const safeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export default function CouchVideoPage({ initialVideo }) {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const [video, setVideo] = useState(initialVideo);
  const [stream, setStream] = useState(null);
  const [userReaction, setUserReaction] = useState({ love: false, respect: false });

  const videoId = video?._id;
  const externalWatch =
    video?.watchOptions?.find((option) => option.access === 'free') || video?.watchOptions?.[0];
  const poster = video?.thumbnails?.backdrop || video?.thumbnails?.poster || video?.driveThumbnail;
  const canonical = `${SITE_URL}/media/couch/${video.slug || video._id}`;

  useEffect(() => {
    if (!videoId) return;
    getVideoStreamUrl(videoId)
      .then(setStream)
      .catch(() => setStream(null));
    if (token) getVideoReaction(videoId, token).then(setUserReaction);
  }, [token, videoId]);

  const handleReaction = async (type) => {
    if (!token) {
      router.push('/login');
      return;
    }
    const isAdding = !userReaction[type];
    if (isAdding) await addVideoReaction(videoId, type, token);
    else await removeVideoReaction(videoId, type, token);
    setUserReaction((current) => ({ ...current, [type]: isAdding }));
    setVideo((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [`${type}Count`]: Math.max(0, (current.stats?.[`${type}Count`] || 0) + (isAdding ? 1 : -1)),
      },
    }));
  };

  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: video.title,
    description: video.description,
    dateCreated: video.releaseYear ? String(video.releaseYear) : undefined,
    image: poster ? [poster] : undefined,
    genre: ['Action sports', ...(video.sportTypes || [])],
    actor: video.riders?.map((name) => ({ '@type': 'Person', name })),
    director: video.directors?.map((name) => ({ '@type': 'Person', name })),
    productionCompany: video.producedBy
      ? { '@type': 'Organization', name: video.producedBy }
      : undefined,
    url: canonical,
    sameAs: [
      ...(video.sourceRecords || []).map((source) => source.url),
      ...(video.watchOptions || []).map((option) => option.url),
    ],
  };

  const videoSchema = externalWatch?.embedUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description: video.description,
        thumbnailUrl: poster ? [poster] : undefined,
        uploadDate: video.releaseYear ? `${video.releaseYear}-01-01` : undefined,
        embedUrl: externalWatch.embedUrl,
        url: externalWatch.url,
      }
    : null;

  return (
    <>
      <Head>
        <title>{video.seo?.title || video.title} | The Couch | TrickBook</title>
        <meta
          name="description"
          content={
            video.seo?.description || video.description?.slice(0, 155) || `Watch ${video.title}`
          }
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="video.movie" />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description?.slice(0, 200)} />
        <meta property="og:url" content={canonical} />
        {poster && <meta property="og:image" content={poster} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(movieSchema) }}
        />
        {videoSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(videoSchema) }}
          />
        )}
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Link
            href="/media?tab=couch"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to The Couch
          </Link>

          <article className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            <div>
              <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
                {externalWatch?.embedUrl ? (
                  <iframe
                    src={externalWatch.embedUrl}
                    title={`Watch ${video.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : stream?.hlsUrl || stream?.mp4Url || stream?.streamUrl ? (
                  <VideoPlayer
                    src={stream.hlsUrl || stream.mp4Url || stream.streamUrl}
                    poster={poster}
                    aspectRatio="16:9"
                  />
                ) : poster ? (
                  <img
                    src={poster}
                    alt={`${video.title} cover art`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-yellow-500/20 to-black">
                    <Play className="h-16 w-16 text-white/50" />
                  </div>
                )}
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500">
                {video.releaseYear || 'Action Sports'} {video.sportTypes?.[0] || ''}{' '}
                {video.type || 'Video'}
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">{video.title}</h1>

              <div className="mt-5 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => handleReaction('love')}
                  className={`flex items-center gap-2 ${userReaction.love ? 'text-red-500' : 'hover:text-red-500'}`}
                  aria-label="Love this video"
                >
                  <Heart className={`h-7 w-7 ${userReaction.love ? 'fill-current' : ''}`} />
                  {video.stats?.loveCount || 0}
                </button>
                <button
                  type="button"
                  onClick={() => handleReaction('respect')}
                  className={`flex items-center gap-2 ${userReaction.respect ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                  aria-label="Respect this video"
                >
                  <span className="text-2xl">🙏</span> {video.stats?.respectCount || 0}
                </button>
                <a
                  href="#comments"
                  className="flex items-center gap-2 text-muted-foreground hover:text-yellow-500"
                >
                  <MessageCircle className="h-6 w-6" /> {video.stats?.commentCount || 0}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    navigator.share?.({ title: video.title, url: canonical }) ||
                    navigator.clipboard?.writeText(canonical)
                  }
                  className="hover:text-yellow-500"
                  aria-label="Share this video"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>

              {video.description && (
                <p className="mt-7 max-w-4xl text-lg leading-8 text-muted-foreground">
                  {video.description}
                </p>
              )}
              {externalWatch && (
                <a
                  href={externalWatch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-3 font-bold text-black hover:bg-yellow-400"
                >
                  <Play className="h-5 w-5 fill-current" />
                  {externalWatch.access === 'free'
                    ? 'Watch the full film'
                    : externalWatch.label || 'View watch option'}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <aside className="space-y-7 rounded-xl border border-border bg-card p-6 lg:self-start">
              {video.producedBy && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Produced by
                  </h2>
                  <p className="mt-2 text-2xl font-black">{video.producedBy}</p>
                </div>
              )}
              {video.directors?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Filmed / Directed by
                  </h2>
                  <p className="mt-2">{video.directors.join(', ')}</p>
                </div>
              )}
              {video.riders?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Featured riders
                  </h2>
                  <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
                    {video.riders.map((rider) => (
                      <li key={rider}>{rider}</li>
                    ))}
                  </ul>
                </div>
              )}
              {video.locations?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Film locations
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {video.locations.map((location) => (
                      <li key={location} className="flex gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {location}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {video.rights?.hostingStatus === 'external_only' && (
                <p className="border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                  The Couch catalogs this film and links to its authorized viewing source. TrickBook
                  does not rehost this film.
                </p>
              )}
            </aside>
          </article>
          <CouchComments
            videoId={videoId}
            initialCount={video.stats?.commentCount || 0}
            onCountChange={(commentCount) =>
              setVideo((current) => ({
                ...current,
                stats: { ...current.stats, commentCount },
              }))
            }
          />
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  try {
    const response = await fetch(`${API_BASE_URL}/couch/videos/${encodeURIComponent(params.id)}`);
    if (response.status === 404) return { notFound: true };
    if (!response.ok) throw new Error(`Couch returned ${response.status}`);
    const initialVideo = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return { props: { initialVideo } };
  } catch {
    return { notFound: true };
  }
}
