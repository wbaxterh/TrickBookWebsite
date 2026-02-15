import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  Award,
  BookOpen,
  Film,
  Gamepad2,
  Globe,
  Heart,
  List,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Music,
  Quote,
  Settings,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Video,
  Zap,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import VerifiedBadge from '../../components/ui/VerifiedBadge';

// Sport emoji mapping
const SPORT_EMOJIS = {
  skateboarding: '🛹',
  snowboarding: '🏂',
  skiing: '⛷️',
  bmx: '🚴',
  mtb: '🚵',
  scooter: '🛴',
  surfing: '🏄',
  wakeboarding: '🌊',
  rollerblading: '🛼',
};

export default function PublicProfile() {
  const router = useRouter();
  const { userId } = router.query;
  const { token } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [tricklists, setTricklists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [homieStatus, setHomieStatus] = useState('none'); // none, pending, homies
  const [actionLoading, setActionLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Check if this is the current user's profile
        if (token) {
          const decoded = jwt.decode(token);
          setIsOwnProfile(decoded?.userId === userId);
        }

        // Fetch public profile
        const profileRes = await axios.get(`${baseUrl}/api/user/${userId}/public`);
        setProfile(profileRes.data);

        // Fetch user stats
        const statsRes = await axios.get(`${baseUrl}/api/user/${userId}/stats`);
        setStats(statsRes.data);

        // Fetch public tricklists
        const tricklistsRes = await axios.get(
          `${baseUrl}/api/listings?userId=${userId}&public=true`,
        );
        setTricklists(Array.isArray(tricklistsRes.data) ? tricklistsRes.data : []);

        // Check homie status if logged in
        if (token && !isOwnProfile) {
          try {
            const homieRes = await axios.get(`${baseUrl}/api/users/homie-status/${userId}`, {
              headers: { 'x-auth-token': token },
            });
            setHomieStatus(homieRes.data.status);
          } catch (_e) {
            // Endpoint might not exist yet
          }
        }
      } catch (_err) {
        setError('Profile not found or is private');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token, baseUrl, isOwnProfile]);

  // Fetch user activity
  const fetchActivity = async () => {
    if (!userId || activities.length > 0) return;
    setActivitiesLoading(true);
    try {
      const activityRes = await axios.get(`${baseUrl}/api/user/${userId}/activity`);
      setActivities(activityRes.data.activities || []);
    } catch (_err) {
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  // Get activity icon
  const getActivityIcon = (type, reactionType) => {
    switch (type) {
      case 'post':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'reaction':
        return reactionType === 'love' ? (
          <Heart className="w-5 h-5 text-red-500 fill-current" />
        ) : (
          <span className="text-xl">🙏</span>
        );
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'spot':
        return <MapPin className="w-5 h-5 text-green-500" />;
      default:
        return <Zap className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleHomieAction = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      if (homieStatus === 'none') {
        await axios.post(
          `${baseUrl}/api/users/${userId}/homie-request`,
          {},
          { headers: { 'x-auth-token': token } },
        );
        setHomieStatus('pending');
      }
    } catch (_err) {
    } finally {
      setActionLoading(false);
    }
  };

  const isPremium =
    profile?.subscription?.plan === 'premium' &&
    ['active', 'canceled'].includes(profile?.subscription?.status);

  const renderAvatar = () => {
    let avatarContent;

    if (profile?.imageUri) {
      avatarContent = (
        <Image
          src={profile.imageUri}
          alt={profile.name}
          width={120}
          height={120}
          className="rounded-full object-cover border-4 border-primary"
          style={{ width: 120, height: 120 }}
        />
      );
    } else if (profile?.riderProfile?.avatarIcon) {
      const icon = profile.riderProfile.avatarIcon;
      avatarContent = (
        <div
          className={`w-[120px] h-[120px] rounded-full ${icon.bg || 'bg-primary'} flex items-center justify-center text-5xl border-4 border-primary`}
        >
          {icon.emoji}
        </div>
      );
    } else {
      avatarContent = (
        <div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-border">
          <User className="w-12 h-12 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="relative inline-block">
        {avatarContent}
        {isPremium && (
          <div className="absolute bottom-1 right-1">
            <VerifiedBadge size="xl" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "This profile doesn't exist or is private."}
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rp = profile.riderProfile || {};

  return (
    <>
      <Head>
        <title>{profile.name} - TrickBook Profile</title>
        <meta name="description" content={`${profile.name}'s rider profile on TrickBook`} />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/20 to-background pt-8 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {renderAvatar()}

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {rp.nickname && (
                    <span className="text-muted-foreground text-lg">"{rp.nickname}"</span>
                  )}
                </div>

                {rp.motto && (
                  <p className="text-muted-foreground italic flex items-center justify-center sm:justify-start gap-2 mb-3">
                    <Quote className="w-4 h-4" />
                    {rp.motto}
                  </p>
                )}

                {/* Sports badges */}
                {profile.sports && profile.sports.length > 0 && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                    {profile.sports.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-sm">
                        {SPORT_EMOJIS[sport] || '🎿'} {sport}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {isOwnProfile ? (
                    <>
                      <Link href="/messages">
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {homieStatus === 'none' && (
                        <Button onClick={handleHomieAction} disabled={actionLoading}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Homie
                        </Button>
                      )}
                      {homieStatus === 'pending' && (
                        <Button variant="outline" disabled>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Request Sent
                        </Button>
                      )}
                      {homieStatus === 'homies' && (
                        <>
                          <Button
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => {
                              // Start conversation and redirect
                              import('../../lib/apiMessages').then(({ startConversation }) => {
                                startConversation(userId, token)
                                  .then((conversation) => {
                                    router.push(`/messages/${conversation._id}`);
                                  })
                                  .catch((_err) => {});
                              });
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="secondary" disabled>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Homies
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto px-4 -mt-8">
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-red-500">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="text-2xl font-bold">{stats?.totalLove || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Love</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <span className="text-2xl">🙏</span>
                    <span className="text-2xl font-bold">{stats?.totalRespect || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Respect</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-blue-500">
                    <List className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats?.tricklistCount || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">TrickLists</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-purple-500">
                    <Video className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats?.postCount || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-green-500">
                    <MapPin className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats?.spotCount || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Spots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="tricklists">TrickLists</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* About Tab - Rider Card */}
            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rider Info Card */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Rider Info
                    </h3>
                    <div className="space-y-3">
                      {rp.riderStyle && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rider Style</span>
                          <span className="font-medium">{rp.riderStyle}</span>
                        </div>
                      )}
                      {rp.age && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age</span>
                          <span className="font-medium">{rp.age}</span>
                        </div>
                      )}
                      {rp.nationality && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Globe className="w-4 h-4" /> Nationality
                          </span>
                          <span className="font-medium">{rp.nationality}</span>
                        </div>
                      )}
                      {rp.sickestTrick && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Zap className="w-4 h-4" /> Sickest Trick
                          </span>
                          <span className="font-medium">{rp.sickestTrick}</span>
                        </div>
                      )}
                      {rp.alternateSport && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Alternate Sport</span>
                          <span className="font-medium">{rp.alternateSport}</span>
                        </div>
                      )}
                      {rp.favoriteCourse && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> Favorite Spot
                          </span>
                          <span className="font-medium">{rp.favoriteCourse}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Strengths & Weaknesses
                    </h3>
                    <div className="space-y-3">
                      {rp.greatestStrength && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Target className="w-4 h-4 text-green-500" /> Greatest Strength
                          </span>
                          <span className="font-medium text-green-500">{rp.greatestStrength}</span>
                        </div>
                      )}
                      {rp.greatestWeakness && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Target className="w-4 h-4 text-red-500" /> Greatest Weakness
                          </span>
                          <span className="font-medium text-red-500">{rp.greatestWeakness}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Favorites Card */}
                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4">Favorites</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {rp.dreamDate && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <span className="text-2xl">💕</span>
                          <div>
                            <p className="text-sm text-muted-foreground">Dream Date</p>
                            <p className="font-medium">{rp.dreamDate}</p>
                          </div>
                        </div>
                      )}
                      {rp.favoriteMovie && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <Film className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Favorite Movie</p>
                            <p className="font-medium">{rp.favoriteMovie}</p>
                          </div>
                        </div>
                      )}
                      {rp.favoriteMusic && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <Music className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Favorite Music</p>
                            <p className="font-medium">{rp.favoriteMusic}</p>
                          </div>
                        </div>
                      )}
                      {rp.favoriteReading && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <BookOpen className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Favorite Reading</p>
                            <p className="font-medium">{rp.favoriteReading}</p>
                          </div>
                        </div>
                      )}
                      {rp.otherHobbies && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 sm:col-span-2">
                          <Gamepad2 className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Other Hobbies</p>
                            <p className="font-medium">{rp.otherHobbies}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TrickLists Tab */}
            <TabsContent value="tricklists">
              {tricklists.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No public tricklists yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tricklists.map((list) => (
                    <Link key={list._id} href={`/trickbook/my-lists/${list._id}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{list.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {list.tricks?.length || 0} tricks
                              </p>
                            </div>
                            <Badge variant="outline">{list.category || 'Mixed'}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" onFocusCapture={fetchActivity}>
              {activitiesLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-yellow-500 animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading activity...</p>
                  </CardContent>
                </Card>
              ) : activities.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Posts, spots, and interactions will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <Card
                      key={`${activity.type}-${index}`}
                      className="hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          {/* Activity Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            {getActivityIcon(activity.type, activity.reactionType)}
                          </div>

                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{profile.name}</span>{' '}
                              <span className="text-muted-foreground">{activity.action}</span>
                            </p>

                            {/* Activity Details */}
                            {activity.type === 'post' && activity.data && (
                              <Link
                                href={`/media/feed/${activity.data._id}`}
                                className="block mt-2"
                              >
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                  {activity.data.thumbnailUrl && (
                                    <Image
                                      src={activity.data.thumbnailUrl}
                                      alt="Post thumbnail"
                                      width={48}
                                      height={48}
                                      className="rounded object-cover"
                                      style={{ width: 48, height: 48 }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">
                                      {activity.data.caption || 'Posted a clip'}
                                    </p>
                                    {activity.data.tricks?.length > 0 && (
                                      <p className="text-xs text-yellow-500">
                                        {activity.data.tricks.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            )}

                            {activity.type === 'reaction' && activity.data && (
                              <Link
                                href={`/media/feed/${activity.data._id}`}
                                className="block mt-2"
                              >
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                  {activity.data.thumbnailUrl && (
                                    <Image
                                      src={activity.data.thumbnailUrl}
                                      alt="Post thumbnail"
                                      width={48}
                                      height={48}
                                      className="rounded object-cover"
                                      style={{ width: 48, height: 48 }}
                                    />
                                  )}
                                  <p className="text-sm text-muted-foreground truncate">
                                    {activity.data.caption || 'A post'}
                                  </p>
                                </div>
                              </Link>
                            )}

                            {activity.type === 'comment' && activity.data && (
                              <Link
                                href={`/media/feed/${activity.data.postId}`}
                                className="block mt-2"
                              >
                                <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                  <p className="text-sm">"{activity.data.content}"</p>
                                  {activity.data.postCaption && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      on: {activity.data.postCaption}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            )}

                            {activity.type === 'spot' && activity.data && (
                              <Link
                                href={`/spots/${activity.data.state}/${activity.data.city}/${activity.data._id}`}
                                className="block mt-2"
                              >
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                  {activity.data.thumbnailUrl ? (
                                    <Image
                                      src={activity.data.thumbnailUrl}
                                      alt="Spot thumbnail"
                                      width={48}
                                      height={48}
                                      className="rounded object-cover"
                                      style={{ width: 48, height: 48 }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                      <MapPin className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{activity.data.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {activity.data.city}, {activity.data.state}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">
                              {timeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
