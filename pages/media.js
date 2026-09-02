import {
  ArrowDownUp,
  Compass,
  Film,
  Filter,
  Loader2,
  Play,
  Plus,
  Search,
  TrendingUp,
  Tv,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import FeedPost from '../components/media/FeedPost';
import VideoCard from '../components/media/VideoCard';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { addReaction, getFeed, getTrendingFeed, removeReaction } from '../lib/apiFeed';
import {
  CONTENT_TYPES,
  COUCH_SORT_OPTIONS,
  getCollections,
  getCouchVideos,
  getFeatured,
  SPORT_TYPES,
} from '../lib/apiMedia';

const COUCH_PAGE_SIZE = 50;

const getHeroImage = (video) =>
  video?.thumbnails?.backdrop ||
  video?.thumbnails?.poster ||
  video?.driveThumbnail ||
  video?.artwork?.backdrop ||
  video?.artwork?.poster ||
  video?.artwork?.thumbnail;

export default function Media() {
  const router = useRouter();
  const { loggedIn, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('couch');
  const [feedFilter, setFeedFilter] = useState('for-you');
  const [sportFilter, setSportFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('createdAt');

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.tab === 'feed' || router.query.tab === 'couch') {
      setActiveTab(router.query.tab);
    }
    if (typeof router.query.sport === 'string') {
      setSportFilter(router.query.sport);
    }
    if (typeof router.query.type === 'string') {
      setContentTypeFilter(router.query.type);
    }
    if (typeof router.query.sort === 'string') {
      setSortFilter(router.query.sort);
    }
  }, [router.isReady, router.query.sort, router.query.sport, router.query.tab, router.query.type]);

  // Data states
  const [featured, setFeatured] = useState(null);
  const [collections, setCollections] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [couchPage, setCouchPage] = useState(1);
  const [hasMoreCouchVideos, setHasMoreCouchVideos] = useState(false);
  const [loadingMoreCouch, setLoadingMoreCouch] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);
  const [_trendingPosts, setTrendingPosts] = useState([]);

  // Loading states
  const [loadingCouch, setLoadingCouch] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Fetch Couch data
  useEffect(() => {
    const fetchCouchData = async () => {
      setLoadingCouch(true);
      try {
        const [featuredData, collectionsData, videosData] = await Promise.all([
          getFeatured().catch(() => null),
          getCollections({ sport: sportFilter }).catch(() => []),
          getCouchVideos({
            sport: sportFilter,
            type: contentTypeFilter,
            sort: sortFilter,
            limit: COUCH_PAGE_SIZE,
            page: 1,
          }).catch(() => []),
        ]);
        setFeatured(featuredData);
        setCollections(collectionsData);
        setRecentVideos(videosData || []);
        setCouchPage(1);
        setHasMoreCouchVideos((videosData || []).length === COUCH_PAGE_SIZE);
      } catch (_error) {
      } finally {
        setLoadingCouch(false);
      }
    };

    if (activeTab === 'couch') {
      fetchCouchData();
    }
  }, [activeTab, contentTypeFilter, sortFilter, sportFilter]);

  const updateCouchFilter = (key, value) => {
    const nextQuery = { ...router.query, tab: 'couch' };
    if (value === 'all' || (key === 'sort' && value === 'createdAt')) delete nextQuery[key];
    else nextQuery[key] = value;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const loadMoreCouchVideos = async () => {
    const nextPage = couchPage + 1;
    setLoadingMoreCouch(true);
    try {
      const videos = await getCouchVideos({
        sport: sportFilter,
        type: contentTypeFilter,
        sort: sortFilter,
        limit: COUCH_PAGE_SIZE,
        page: nextPage,
      });
      setRecentVideos((current) => [...current, ...(videos || [])]);
      setCouchPage(nextPage);
      setHasMoreCouchVideos((videos || []).length === COUCH_PAGE_SIZE);
    } finally {
      setLoadingMoreCouch(false);
    }
  };

  const heroVideos = useMemo(() => {
    const seen = new Set();

    return [featured, ...recentVideos].filter((video) => {
      if (!video || !getHeroImage(video)) return false;
      if (sportFilter !== 'all' && !video.sportTypes?.includes(sportFilter)) return false;
      if (contentTypeFilter !== 'all' && video.type !== contentTypeFilter) return false;
      const id = video._id || video.slug || video.title;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [contentTypeFilter, featured, recentVideos, sportFilter]);

  useEffect(() => {
    if (heroVideos.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroVideos.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [heroVideos.length]);

  const heroVideo = heroVideos[heroIndex % Math.max(heroVideos.length, 1)];

  // Fetch Feed data
  useEffect(() => {
    const fetchFeedData = async () => {
      setLoadingFeed(true);
      try {
        if (feedFilter === 'trending') {
          const data = await getTrendingFeed({ sport: sportFilter });
          setTrendingPosts(data.posts || []);
        } else {
          const data = await getFeed({ page: 1, limit: 20 }, token);
          setFeedPosts(data.posts || []);
        }
      } catch (_error) {
      } finally {
        setLoadingFeed(false);
      }
    };

    if (activeTab === 'feed') {
      fetchFeedData();
    }
  }, [activeTab, feedFilter, sportFilter, token]);

  const handleReaction = async (postId, type, isAdding) => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (isAdding) {
      await addReaction(postId, type, token);
    } else {
      await removeReaction(postId, type, token);
    }
  };

  // Sample/placeholder data for demo
  const _sampleCollections = [
    {
      _id: '1',
      name: 'Skateboarding Classics',
      description: 'Iconic skate videos that defined the sport',
      videos: [
        {
          _id: 'v1',
          title: 'Video Days',
          releaseYear: 1991,
          sportTypes: ['skateboarding'],
          thumbnails: {},
          avgRating: 4.8,
        },
        {
          _id: 'v2',
          title: 'Yeah Right!',
          releaseYear: 2003,
          sportTypes: ['skateboarding'],
          thumbnails: {},
          avgRating: 4.9,
        },
        {
          _id: 'v3',
          title: 'Fully Flared',
          releaseYear: 2007,
          sportTypes: ['skateboarding'],
          thumbnails: {},
          avgRating: 4.7,
        },
      ],
    },
    {
      _id: '2',
      name: 'Snow Films',
      description: 'Epic snowboarding and skiing documentaries',
      videos: [
        {
          _id: 'v4',
          title: 'The Art of Flight',
          releaseYear: 2011,
          sportTypes: ['snowboarding'],
          thumbnails: {},
          avgRating: 4.9,
        },
        {
          _id: 'v5',
          title: 'The Fourth Phase',
          releaseYear: 2016,
          sportTypes: ['snowboarding'],
          thumbnails: {},
          avgRating: 4.6,
        },
      ],
    },
  ];

  const samplePosts = [
    {
      _id: 'p1',
      user: { _id: 'u1', name: 'Pro Skater', imageUri: null },
      mediaType: 'video',
      videoUrl: '',
      thumbnailUrl: '/placeholder-video.jpg',
      caption: 'Clean kickflip at the local park! First one in a while.',
      sportTypes: ['skateboarding'],
      tricks: ['Kickflip'],
      stats: { loveCount: 234, respectCount: 89, commentCount: 12 },
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      _id: 'p2',
      user: { _id: 'u2', name: 'Snow Rider', imageUri: null },
      mediaType: 'video',
      videoUrl: '',
      thumbnailUrl: '/placeholder-video.jpg',
      caption: 'Fresh powder day was insane!',
      sportTypes: ['snowboarding'],
      tricks: ['Backside 360'],
      stats: { loveCount: 567, respectCount: 234, commentCount: 45 },
      createdAt: new Date(Date.now() - 7200000),
    },
  ];

  const displayCollections = collections.length > 0 ? collections : [];
  const displayPosts = feedPosts.length > 0 ? feedPosts : samplePosts;

  return (
    <>
      <Head>
        <title>Media | Trick Book</title>
        <meta
          name="description"
          content="Watch action sports films and share clips with the community on Trick Book"
        />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header with Tabs */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between py-4">
                <TabsList className="grid grid-cols-2 w-auto">
                  <TabsTrigger
                    value="couch"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black px-6"
                  >
                    <Tv className="h-4 w-4 mr-2" />
                    The Couch
                  </TabsTrigger>
                  <TabsTrigger
                    value="feed"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black px-6"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    The Feed
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {activeTab === 'feed' && loggedIn && (
                    <Link href="/media/feed/upload">
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                        <Plus className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </Link>
                  )}
                  <Link href="/media/search">
                    <Button variant="ghost" size="icon">
                      <Search className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

        {/* The Couch Content */}
        {activeTab === 'couch' && (
          <div>
            {/* Hero Section */}
            {heroVideo ? (
              <div className="relative h-[60vh] overflow-hidden">
                <Image
                  key={heroVideo._id || heroVideo.slug}
                  src={getHeroImage(heroVideo)}
                  alt={heroVideo.title}
                  fill
                  className="object-cover animate-in fade-in duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {heroVideo.title}
                  </h1>
                  <p className="text-lg text-white/80 max-w-2xl mb-6 line-clamp-2">
                    {heroVideo.description}
                  </p>
                  <div className="flex gap-4">
                    <Link href={`/media/couch/${heroVideo.slug || heroVideo._id}`}>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                        <Play className="h-5 w-5 mr-2" fill="currentColor" />
                        Watch Now
                      </Button>
                    </Link>
                    <Link href={`/media/couch/${heroVideo.slug || heroVideo._id}`}>
                      <Button
                        variant="outline"
                        className="text-white border-white hover:bg-white/10"
                      >
                        More Info
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-[40vh] bg-gradient-to-br from-yellow-500/20 via-background to-background flex items-center">
                <div className="container mx-auto px-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">The Couch</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Your home for action sports films, documentaries, and edits. Sit back, relax,
                    and watch the best content from the community.
                  </p>
                </div>
              </div>
            )}

            {/* Browse filters */}
            <div className="container mx-auto px-4 py-6">
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {SPORT_TYPES.map((sport) => (
                  <button
                    type="button"
                    key={sport.value}
                    onClick={() => updateCouchFilter('sport', sport.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      sportFilter === sport.value
                        ? 'bg-yellow-500 text-black'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{recentVideos.length} videos</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                  <Select
                    value={contentTypeFilter}
                    onValueChange={(value) => updateCouchFilter('type', value)}
                  >
                    <SelectTrigger className="w-full sm:w-44" aria-label="Filter by content type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortFilter}
                    onValueChange={(value) => updateCouchFilter('sort', value)}
                  >
                    <SelectTrigger className="w-full sm:w-48" aria-label="Sort videos">
                      <span className="flex min-w-0 items-center gap-2">
                        <ArrowDownUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {COUCH_SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Collections and Videos */}
            <div className="container mx-auto px-4 pb-12">
              {loadingCouch ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Show collections if any */}
                  {displayCollections.map((collection) => (
                    <div key={collection._id}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{collection.name}</h2>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground">
                              {collection.description}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/media/couch/collection/${collection._id}`}
                          className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
                        >
                          See All
                        </Link>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {collection.videos?.map((video) => (
                          <VideoCard key={video._id} video={video} size="medium" />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Show recent videos */}
                  {recentVideos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">Browse The Couch</h2>
                          <p className="text-sm text-muted-foreground">
                            {
                              COUCH_SORT_OPTIONS.find((option) => option.value === sortFilter)
                                ?.label
                            }
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recentVideos.map((video) => (
                          <VideoCard key={video._id} video={video} size="medium" />
                        ))}
                      </div>
                      {hasMoreCouchVideos && (
                        <div className="flex justify-center pt-8">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={loadMoreCouchVideos}
                            disabled={loadingMoreCouch}
                          >
                            {loadingMoreCouch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state */}
                  {displayCollections.length === 0 && recentVideos.length === 0 && (
                    <div className="text-center py-16">
                      <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h2 className="text-xl font-bold text-foreground mb-2">No videos yet</h2>
                      <p className="text-muted-foreground">
                        Check back soon for action sports films and documentaries.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* The Feed Content */}
        {activeTab === 'feed' && (
          <div className="container mx-auto px-4 py-6">
            {/* Feed Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              <button
                type="button"
                onClick={() => setFeedFilter('for-you')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  feedFilter === 'for-you'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                For You
              </button>
              {loggedIn && (
                <button
                  type="button"
                  onClick={() => setFeedFilter('homies')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    feedFilter === 'homies'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Homies
                </button>
              )}
              <button
                type="button"
                onClick={() => setFeedFilter('trending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  feedFilter === 'trending'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Trending
              </button>
            </div>

            {/* Feed Posts */}
            {loadingFeed ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="text-center py-16">
                <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">No posts yet</h2>
                <p className="text-muted-foreground mb-6">
                  Be the first to share a clip with the community!
                </p>
                {loggedIn ? (
                  <Link href="/media/feed/upload">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Sign in to Post
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-6">
                {displayPosts.map((post) => (
                  <FeedPost
                    key={post._id}
                    post={post}
                    currentUserId={null}
                    onReaction={handleReaction}
                    autoPlay={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
