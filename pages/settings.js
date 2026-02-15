import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  AlertCircle,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Crown,
  Eye,
  FileText,
  FolderTree,
  LayoutDashboard,
  Loader2,
  MapPin,
  Monitor,
  Moon,
  Save,
  Settings,
  Shield,
  Sun,
  Trash2,
  Tv,
  User,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/toast';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import {
  cancelSubscription,
  createCheckoutSession,
  getSubscription,
  getUsage,
  reactivateSubscription,
} from '../lib/apiPayments';

// Sport categories
const SPORT_CATEGORIES = [
  { id: 'skateboarding', name: 'Skateboarding', emoji: '🛹' },
  { id: 'snowboarding', name: 'Snowboarding', emoji: '🏂' },
  { id: 'skiing', name: 'Skiing', emoji: '⛷️' },
  { id: 'bmx', name: 'BMX', emoji: '🚴' },
  { id: 'mtb', name: 'Mountain Biking', emoji: '🚵' },
  { id: 'scooter', name: 'Scooter', emoji: '🛴' },
  { id: 'surfing', name: 'Surfing', emoji: '🏄' },
  { id: 'wakeboarding', name: 'Wakeboarding', emoji: '🌊' },
  { id: 'rollerblading', name: 'Rollerblading', emoji: '🛼' },
];

// Avatar icons
const DEFAULT_AVATARS = [
  { id: 'skater1', emoji: '🛹', bg: 'bg-yellow-500' },
  { id: 'snowboarder', emoji: '🏂', bg: 'bg-blue-500' },
  { id: 'fire', emoji: '🔥', bg: 'bg-orange-500' },
  { id: 'lightning', emoji: '⚡', bg: 'bg-purple-500' },
  { id: 'skull', emoji: '💀', bg: 'bg-gray-700' },
  { id: 'alien', emoji: '👽', bg: 'bg-green-500' },
  { id: 'robot', emoji: '🤖', bg: 'bg-cyan-500' },
  { id: 'devil', emoji: '😈', bg: 'bg-red-500' },
  { id: 'cool', emoji: '😎', bg: 'bg-indigo-500' },
  { id: 'crown', emoji: '👑', bg: 'bg-amber-500' },
  { id: 'rocket', emoji: '🚀', bg: 'bg-pink-500' },
  { id: 'ghost', emoji: '👻', bg: 'bg-slate-500' },
];

// Rider styles
const RIDER_STYLES = [
  'Freestyle',
  'Street',
  'Vert',
  'Park',
  'Downhill',
  'Flatground',
  'Technical',
  'Flow',
  'All-Mountain',
  'Backcountry',
];

export default function SettingsPage() {
  const router = useRouter();
  const { token, logOut, name, email, imageUri, setImageUri, setName, role } =
    useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Subscription state
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'active' });
  const [usage, setUsage] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    sports: [],
    riderProfile: {
      nickname: '',
      age: '',
      nationality: '',
      riderStyle: '',
      motto: '',
      sickestTrick: '',
      alternateSport: '',
      greatestStrength: '',
      greatestWeakness: '',
      dreamDate: '',
      favoriteMovie: '',
      favoriteMusic: '',
      favoriteReading: '',
      favoriteCourse: '',
      otherHobbies: '',
      avatarType: 'icon',
      avatarIcon: null,
    },
  });

  // Network settings
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Avatar upload
  const [uploadPreview, setUploadPreview] = useState(null);
  const [_uploadedFile, setUploadedFile] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle tab query parameter (e.g., ?tab=billing)
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const decoded = jwt.decode(token);
    if (decoded?.userId) {
      setUserId(decoded.userId);
      fetchUserData(decoded.userId);
      fetchSubscriptionData();
    }
  }, [token, fetchSubscriptionData, fetchUserData, router.push]);

  const fetchSubscriptionData = async () => {
    try {
      const [subData, usageData] = await Promise.all([
        getSubscription(token),
        getUsage(token).catch(() => null),
      ]);
      setSubscription(subData.subscription || { plan: 'free', status: 'active' });
      setUsage(usageData);
    } catch (_error) {}
  };

  const fetchUserData = async (uid) => {
    try {
      const response = await axios.get(`${baseUrl}/api/user/${uid}`, {
        headers: { 'x-auth-token': token },
      });

      const user = response.data;
      setProfileData({
        name: user.name || '',
        sports: user.sports || [],
        riderProfile: {
          nickname: user.riderProfile?.nickname || '',
          age: user.riderProfile?.age || '',
          nationality: user.riderProfile?.nationality || '',
          riderStyle: user.riderProfile?.riderStyle || '',
          motto: user.riderProfile?.motto || '',
          sickestTrick: user.riderProfile?.sickestTrick || '',
          alternateSport: user.riderProfile?.alternateSport || '',
          greatestStrength: user.riderProfile?.greatestStrength || '',
          greatestWeakness: user.riderProfile?.greatestWeakness || '',
          dreamDate: user.riderProfile?.dreamDate || '',
          favoriteMovie: user.riderProfile?.favoriteMovie || '',
          favoriteMusic: user.riderProfile?.favoriteMusic || '',
          favoriteReading: user.riderProfile?.favoriteReading || '',
          favoriteCourse: user.riderProfile?.favoriteCourse || '',
          otherHobbies: user.riderProfile?.otherHobbies || '',
          avatarType: user.riderProfile?.avatarType || 'icon',
          avatarIcon: user.riderProfile?.avatarIcon || null,
        },
      });
      setNetworkEnabled(user.network || false);

      if (user.imageUri) {
        setUploadPreview(user.imageUri);
      }
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${baseUrl}/api/user/${userId}`,
        {
          name: profileData.name,
          sports: profileData.sports,
          riderProfile: profileData.riderProfile,
        },
        { headers: { 'x-auth-token': token } },
      );

      // Update context
      setName(profileData.name);

      addToast('Profile updated successfully!', 'success');
    } catch (_err) {
      addToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
        setProfileData((prev) => ({
          ...prev,
          riderProfile: {
            ...prev.riderProfile,
            avatarType: 'upload',
            avatarIcon: null,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconSelect = (icon) => {
    setProfileData((prev) => ({
      ...prev,
      riderProfile: {
        ...prev.riderProfile,
        avatarType: 'icon',
        avatarIcon: icon,
      },
    }));
    setUploadPreview(null);
    setUploadedFile(null);
  };

  const toggleSport = (sportId) => {
    setProfileData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter((s) => s !== sportId)
        : [...prev.sports, sportId],
    }));
  };

  const updateRiderProfile = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      riderProfile: {
        ...prev.riderProfile,
        [field]: value,
      },
    }));
  };

  const handleNetworkToggle = async (checked) => {
    setNetworkLoading(true);
    try {
      await axios.put(
        `${baseUrl}/api/users/${userId}/network`,
        { network: checked },
        { headers: { 'x-auth-token': token } },
      );
      setNetworkEnabled(checked);
    } catch (_err) {
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleLogout = () => {
    logOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      try {
        await axios.delete(`${baseUrl}/api/users/${userId}`, {
          headers: { 'x-auth-token': token },
        });
        alert('Your account has been deleted.');
        logOut();
        router.push('/');
      } catch (_error) {
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const renderAvatar = () => {
    if (uploadPreview) {
      return (
        <Image
          src={uploadPreview}
          alt="Profile"
          width={100}
          height={100}
          className="rounded-full object-cover"
          style={{ width: 100, height: 100 }}
        />
      );
    }

    if (profileData.riderProfile.avatarIcon) {
      const icon = profileData.riderProfile.avatarIcon;
      return (
        <div
          className={`w-[100px] h-[100px] rounded-full ${icon.bg || 'bg-primary'} flex items-center justify-center text-4xl`}
        >
          {icon.emoji}
        </div>
      );
    }

    return (
      <div className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center">
        <User className="w-10 h-10 text-muted-foreground" />
      </div>
    );
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - TrickBook</title>
      </Head>

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <Link href={`/profile/${userId}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="billing">
                <CreditCard className="w-4 h-4 mr-1" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a photo or choose an icon</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {renderAvatar()}

                    <div className="flex-1 space-y-4">
                      <label className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                          <Camera className="w-4 h-4" />
                          <span>Upload Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_AVATARS.map((avatar) => (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => handleIconSelect(avatar)}
                            className={`w-10 h-10 rounded-full ${avatar.bg} flex items-center justify-center text-lg transition-all hover:scale-110 ${
                              profileData.riderProfile.avatarIcon?.id === avatar.id
                                ? 'ring-2 ring-primary ring-offset-2'
                                : ''
                            }`}
                          >
                            {avatar.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input value={email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nickname</label>
                      <Input
                        placeholder='"The Kid"'
                        value={profileData.riderProfile.nickname}
                        onChange={(e) => updateRiderProfile('nickname', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rider Style</label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        value={profileData.riderProfile.riderStyle}
                        onChange={(e) => updateRiderProfile('riderStyle', e.target.value)}
                      >
                        <option value="">Select style...</option>
                        {RIDER_STYLES.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motto</label>
                    <Input
                      placeholder='"Try anything once"'
                      value={profileData.riderProfile.motto}
                      onChange={(e) => updateRiderProfile('motto', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sports */}
              <Card>
                <CardHeader>
                  <CardTitle>Sports</CardTitle>
                  <CardDescription>Select all the sports you ride</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {SPORT_CATEGORIES.map((sport) => (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => toggleSport(sport.id)}
                        className={`p-2 rounded-lg border-2 transition-all text-center ${
                          profileData.sports.includes(sport.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-xl">{sport.emoji}</div>
                        <div className="text-xs mt-1">{sport.name}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rider Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Rider Details</CardTitle>
                  <CardDescription>Optional fun stuff for your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Age</label>
                      <Input
                        type="number"
                        value={profileData.riderProfile.age}
                        onChange={(e) => updateRiderProfile('age', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nationality</label>
                      <Input
                        value={profileData.riderProfile.nationality}
                        onChange={(e) => updateRiderProfile('nationality', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sickest Trick</label>
                      <Input
                        value={profileData.riderProfile.sickestTrick}
                        onChange={(e) => updateRiderProfile('sickestTrick', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alternate Sport</label>
                      <Input
                        value={profileData.riderProfile.alternateSport}
                        onChange={(e) => updateRiderProfile('alternateSport', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Greatest Strength</label>
                      <Input
                        value={profileData.riderProfile.greatestStrength}
                        onChange={(e) => updateRiderProfile('greatestStrength', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Greatest Weakness</label>
                      <Input
                        value={profileData.riderProfile.greatestWeakness}
                        onChange={(e) => updateRiderProfile('greatestWeakness', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dream Date</label>
                      <Input
                        value={profileData.riderProfile.dreamDate}
                        onChange={(e) => updateRiderProfile('dreamDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Favorite Movie</label>
                      <Input
                        value={profileData.riderProfile.favoriteMovie}
                        onChange={(e) => updateRiderProfile('favoriteMovie', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Favorite Music</label>
                      <Input
                        value={profileData.riderProfile.favoriteMusic}
                        onChange={(e) => updateRiderProfile('favoriteMusic', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Favorite Reading</label>
                      <Input
                        value={profileData.riderProfile.favoriteReading}
                        onChange={(e) => updateRiderProfile('favoriteReading', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Favorite Spot</label>
                      <Input
                        value={profileData.riderProfile.favoriteCourse}
                        onChange={(e) => updateRiderProfile('favoriteCourse', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Other Hobbies</label>
                      <Input
                        value={profileData.riderProfile.otherHobbies}
                        onChange={(e) => updateRiderProfile('otherHobbies', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how TrickBook looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium mr-4">Theme:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('light')}
                      >
                        <Sun className="w-4 h-4 mr-1" />
                        Light
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="w-4 h-4 mr-1" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('system')}
                      >
                        <Monitor className="w-4 h-4 mr-1" />
                        System
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Network Settings
                  </CardTitle>
                  <CardDescription>Control how others can find you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Discoverable</p>
                      <p className="text-sm text-muted-foreground">
                        Allow other riders to find you and send homie requests
                      </p>
                    </div>
                    <Switch
                      checked={networkEnabled}
                      onCheckedChange={handleNetworkToggle}
                      disabled={networkLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              {/* Current Plan */}
              <Card
                className={
                  subscription.plan === 'premium' ? 'border-[#1DA1F2]/50 bg-[#1DA1F2]/5' : ''
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {subscription.plan === 'premium' ? (
                      <>
                        <Crown className="w-5 h-5 text-[#1DA1F2]" />
                        TrickBook Plus
                        <VerifiedBadge size="md" />
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        Free Plan
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {subscription.plan === 'premium'
                      ? 'You have access to all premium features'
                      : 'Upgrade to TrickBook Plus for unlimited features'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subscription.plan === 'premium' ? (
                    <div className="space-y-4">
                      {/* Subscription Status */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                        {subscription.status === 'active' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : subscription.status === 'canceled' ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium capitalize">
                            {subscription.status === 'active'
                              ? 'Active'
                              : subscription.status === 'canceled'
                                ? 'Canceling'
                                : subscription.status}
                          </p>
                          {subscription.currentPeriodEnd && (
                            <p className="text-sm text-muted-foreground">
                              {subscription.status === 'canceled' ? 'Access until ' : 'Renews '}
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Premium Features */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Your benefits:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Unlimited spot lists
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Unlimited spots per list
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Verified badge on your profile
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Priority support
                          </li>
                        </ul>
                      </div>

                      {/* Manage Subscription */}
                      <div className="pt-4 border-t border-border">
                        {subscription.status === 'canceled' ? (
                          <Button
                            onClick={async () => {
                              setSubscriptionLoading(true);
                              try {
                                await reactivateSubscription(token);
                                await fetchSubscriptionData();
                                alert('Subscription reactivated!');
                              } catch (_error) {
                                alert('Failed to reactivate. Please try again.');
                              } finally {
                                setSubscriptionLoading(false);
                              }
                            }}
                            disabled={subscriptionLoading}
                            className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                          >
                            {subscriptionLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Reactivate Subscription
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (
                                confirm(
                                  "Are you sure you want to cancel? You'll keep access until the end of your billing period.",
                                )
                              ) {
                                setSubscriptionLoading(true);
                                try {
                                  await cancelSubscription(token);
                                  await fetchSubscriptionData();
                                } catch (_error) {
                                  alert('Failed to cancel. Please try again.');
                                } finally {
                                  setSubscriptionLoading(false);
                                }
                              }
                            }}
                            disabled={subscriptionLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            {subscriptionLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Free Plan Limits */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Free plan limits:</p>
                        {usage && (
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Spot Lists</span>
                                <span className="text-muted-foreground">
                                  {usage.spotListCount || 0} / {usage.limits?.spotLists || 3}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      ((usage.spotListCount || 0) /
                                        (usage.limits?.spotLists || 3)) *
                                        100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Total Spots</span>
                                <span className="text-muted-foreground">
                                  {usage.totalSpots || 0} / {usage.limits?.totalSpots || 15}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      ((usage.totalSpots || 0) / (usage.limits?.totalSpots || 15)) *
                                        100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upgrade CTA */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-[#1DA1F2]/10 to-purple-500/10 border border-[#1DA1F2]/20">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center flex-shrink-0">
                            <Crown className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Upgrade to TrickBook Plus</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              $10/month for unlimited spots, lists, and a verified badge
                            </p>
                            <ul className="text-sm space-y-1 mb-4">
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#1DA1F2]" />
                                Unlimited spot lists
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#1DA1F2]" />
                                Unlimited spots per list
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#1DA1F2]" />
                                <span className="flex items-center gap-1">
                                  Verified badge <VerifiedBadge size="sm" />
                                </span>
                              </li>
                            </ul>
                            <Button
                              onClick={async () => {
                                setSubscriptionLoading(true);
                                try {
                                  const response = await createCheckoutSession(token);
                                  // Redirect to Stripe checkout
                                  if (response?.url) {
                                    window.location.href = response.url;
                                  } else {
                                    throw new Error(
                                      'Checkout URL not available. Please try again later.',
                                    );
                                  }
                                } catch (error) {
                                  alert(
                                    error.message || 'Failed to start checkout. Please try again.',
                                  );
                                } finally {
                                  setSubscriptionLoading(false);
                                }
                              }}
                              disabled={subscriptionLoading}
                              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                            >
                              {subscriptionLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Crown className="w-4 h-4 mr-2" />
                              )}
                              Upgrade Now - $10/month
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Success Message */}
              {router.query.success === 'true' && (
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium">Welcome to TrickBook Plus!</p>
                        <p className="text-sm text-muted-foreground">
                          Your subscription is now active. Enjoy unlimited features!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Subscription Toggle - Only shown for admins */}
              {role === 'admin' && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-500">
                      <Shield className="w-5 h-5" />
                      Admin Testing Mode
                    </CardTitle>
                    <CardDescription>
                      Override your subscription status for testing features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Current override:{' '}
                        <span className="font-medium text-foreground">
                          {subscription.adminOverride || 'None (using real subscription)'}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={subscription.adminOverride === 'free' ? 'default' : 'outline'}
                          size="sm"
                          onClick={async () => {
                            try {
                              const { toggleAdminSubscription } = await import(
                                '../lib/apiPayments'
                              );
                              await toggleAdminSubscription(token, 'free');
                              await fetchSubscriptionData();
                            } catch (_error) {
                              alert('Failed to update override');
                            }
                          }}
                        >
                          Test as Free User
                        </Button>
                        <Button
                          variant={subscription.adminOverride === 'premium' ? 'default' : 'outline'}
                          size="sm"
                          className={
                            subscription.adminOverride === 'premium'
                              ? 'bg-[#1DA1F2] hover:bg-[#1a8cd8]'
                              : ''
                          }
                          onClick={async () => {
                            try {
                              const { toggleAdminSubscription } = await import(
                                '../lib/apiPayments'
                              );
                              await toggleAdminSubscription(token, 'premium');
                              await fetchSubscriptionData();
                            } catch (_error) {
                              alert('Failed to update override');
                            }
                          }}
                        >
                          Test as Premium User
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const { toggleAdminSubscription } = await import(
                                '../lib/apiPayments'
                              );
                              await toggleAdminSubscription(token, null);
                              await fetchSubscriptionData();
                            } catch (_error) {
                              alert('Failed to clear override');
                            }
                          }}
                        >
                          Clear Override
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              {/* Admin Section - Only shown for admins */}
              {role === 'admin' && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-500">
                      <Shield className="w-5 h-5" />
                      Admin Access
                    </CardTitle>
                    <CardDescription>Manage content, users, and site settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Admin Dashboard */}
                    <Link href="/admin">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Dashboard</p>
                            <p className="text-xs text-muted-foreground">
                              Users and tricklists overview
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* The Couch */}
                    <Link href="/admin/couch">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Tv className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">The Couch</p>
                            <p className="text-xs text-muted-foreground">
                              Manage videos and collections
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* Trickipedia */}
                    <Link href="/admin/trickipedia">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Trickipedia</p>
                            <p className="text-xs text-muted-foreground">Manage tricks database</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* Spots */}
                    <Link href="/admin/spots">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Spots</p>
                            <p className="text-xs text-muted-foreground">Manage skate spots</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* Pending Spots */}
                    <Link href="/admin/pending-spots">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Pending Spots</p>
                            <p className="text-xs text-muted-foreground">
                              Review user-submitted spots
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* Blog */}
                    <Link href="/admin/blog">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-pink-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Blog</p>
                            <p className="text-xs text-muted-foreground">Manage blog posts</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>

                    {/* Categories */}
                    <Link href="/admin/categories">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <FolderTree className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Categories</p>
                            <p className="text-xs text-muted-foreground">Manage trick categories</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Logout */}
              <Card>
                <CardHeader>
                  <CardTitle>Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
