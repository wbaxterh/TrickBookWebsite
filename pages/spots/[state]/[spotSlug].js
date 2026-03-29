import { ArrowLeft, ChevronUp, ExternalLink, Loader2, MapPin, Plus, Trophy, Video } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import ResortInfo from '../../../components/ResortInfo';
import { getSpotData } from '../../../lib/apiSpots';
import PhotoCarousel from '../../../components/PhotoCarousel';
import LodgingSection from '../../../components/LodgingSection';
import axios from 'axios';

// US State names mapping
const STATE_NAMES = {
  al: 'Alabama',
  ak: 'Alaska',
  az: 'Arizona',
  ar: 'Arkansas',
  ca: 'California',
  co: 'Colorado',
  ct: 'Connecticut',
  de: 'Delaware',
  fl: 'Florida',
  ga: 'Georgia',
  hi: 'Hawaii',
  id: 'Idaho',
  il: 'Illinois',
  in: 'Indiana',
  ia: 'Iowa',
  ks: 'Kansas',
  ky: 'Kentucky',
  la: 'Louisiana',
  me: 'Maine',
  md: 'Maryland',
  ma: 'Massachusetts',
  mi: 'Michigan',
  mn: 'Minnesota',
  ms: 'Mississippi',
  mo: 'Missouri',
  mt: 'Montana',
  ne: 'Nebraska',
  nv: 'Nevada',
  nh: 'New Hampshire',
  nj: 'New Jersey',
  nm: 'New Mexico',
  ny: 'New York',
  nc: 'North Carolina',
  nd: 'North Dakota',
  oh: 'Ohio',
  ok: 'Oklahoma',
  or: 'Oregon',
  pa: 'Pennsylvania',
  ri: 'Rhode Island',
  sc: 'South Carolina',
  sd: 'South Dakota',
  tn: 'Tennessee',
  tx: 'Texas',
  ut: 'Utah',
  vt: 'Vermont',
  va: 'Virginia',
  wa: 'Washington',
  wv: 'West Virginia',
  wi: 'Wisconsin',
  wy: 'Wyoming',
  dc: 'Washington D.C.',
};

export default function SpotDetail() {
  const router = useRouter();
  const { state, spotSlug, id } = router.query;
  const { loggedIn } = useContext(AuthContext);

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  // Trick history
  const [trickHistory, setTrickHistory] = useState([]);
  const [trickHistoryLoading, setTrickHistoryLoading] = useState(false);

  // Submit trick dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ trickName: '', skaterName: '', videoUrl: '', year: '' });
  const [submitting, setSubmitting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';
  const stateName = STATE_NAMES[state?.toLowerCase()] || state?.toUpperCase();

  useEffect(() => {
    if (!id) return;

    const fetchSpot = async () => {
      setLoading(true);
      try {
        const data = await getSpotData(id);
        if (data) {
          setSpot(data);
        } else {
          setError('Spot not found');
        }
      } catch (_err) {
        setError('Failed to load spot');
      } finally {
        setLoading(false);
      }
    };

    fetchSpot();
  }, [id]);

  // Fetch trick history when spot loads
  useEffect(() => {
    if (!spot?._id) return;
    const fetchTrickHistory = async () => {
      setTrickHistoryLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/api/spot-tricks/${spot._id}`);
        setTrickHistory(res.data.tricks || []);
      } catch (_e) {
        setTrickHistory([]);
      } finally {
        setTrickHistoryLoading(false);
      }
    };
    fetchTrickHistory();
  }, [spot?._id, baseUrl]);

  // Submit a trick
  const handleSubmitTrick = async () => {
    if (!submitForm.trickName.trim() || !submitForm.skaterName.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${baseUrl}/api/spot-tricks`, {
        spotId: spot._id,
        trickName: submitForm.trickName,
        skaterName: submitForm.skaterName,
        videoUrl: submitForm.videoUrl || null,
        year: submitForm.year ? parseInt(submitForm.year) : null,
      }, { headers: { 'x-auth-token': token } });
      // Refresh trick history
      const res = await axios.get(`${baseUrl}/api/spot-tricks/${spot._id}`);
      setTrickHistory(res.data.tricks || []);
      setSubmitDialogOpen(false);
      setSubmitForm({ trickName: '', skaterName: '', videoUrl: '', year: '' });
    } catch (_e) {
      alert('Failed to submit trick');
    } finally {
      setSubmitting(false);
    }
  };

  // Upvote a trick
  const handleUpvote = async (trickId) => {
    if (!token) return;
    try {
      const res = await axios.post(`${baseUrl}/api/spot-tricks/${trickId}/upvote`, {}, {
        headers: { 'x-auth-token': token },
      });
      setTrickHistory(prev => prev.map(t =>
        t._id === trickId ? { ...t, upvotes: res.data.upvotes, upvoted: res.data.upvoted } : t
      ));
    } catch (_e) {}
  };

  // Parse tags
  const tagList = spot?.tags
    ? typeof spot.tags === 'string'
      ? spot.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : spot.tags
    : [];

  // Generate Google Maps URL
  const googleMapsUrl = spot
    ? `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          <p className="mt-4 text-muted-foreground">Loading spot...</p>
        </div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {error || 'Spot not found'}
            </h1>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {spot.name} - Skate Spot in {stateName} | The Trick Book
        </title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content={`${spot.name} skate spot in ${spot.city}, ${stateName}. ${spot.description || 'Find directions, photos, and info.'}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Back Navigation */}
        <div className="container pt-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {stateName} Spots
          </Button>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <PhotoCarousel
              images={spot.images}
              imageURL={spot.imageURL}
              name={spot.name}
            />

            {/* Details Section */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{spot.name}</h1>

                  {/* Location */}
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg">
                      {spot.city && spot.state
                        ? `${spot.city}, ${STATE_NAMES[spot.state.toLowerCase()] || spot.state}`
                        : spot.state
                          ? STATE_NAMES[spot.state.toLowerCase()] || spot.state
                          : 'Unknown location'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tagList.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Coordinates */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Coordinates</h3>
                  <p className="text-foreground font-mono text-sm">
                    {spot.latitude?.toFixed(6)}, {spot.longitude?.toFixed(6)}
                  </p>
                </div>

                {/* Description */}
                {spot.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      About this spot
                    </h3>
                    <p className="text-foreground">{spot.description}</p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-400">
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Google Maps
                    </a>
                  </Button>

                  {loggedIn && (
                    <Button variant="outline" asChild>
                      <Link href="/my-spots">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to My Lists
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resort Info Section */}
          {spot.category === 'resort' && spot.resortInfo && (
            <ResortInfo resortInfo={spot.resortInfo} />
          )}

          {/* Lodging Section */}
          <LodgingSection lodging={spot.lodging} />

          {/* Trick History Section */}
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Trick History
                  </h2>
                  {loggedIn && (
                    <Button
                      onClick={() => setSubmitDialogOpen(true)}
                      className="bg-yellow-500 text-black hover:bg-yellow-400"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Submit a Trick
                    </Button>
                  )}
                </div>

                {trickHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                  </div>
                ) : trickHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tricks submitted for this spot yet.</p>
                    {loggedIn && (
                      <p className="text-sm text-muted-foreground mt-1">Be the first to submit one!</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trickHistory.map((trick) => (
                      <div
                        key={trick._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{trick.trickName}</span>
                            {trick.verified && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-500 text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{trick.skaterName}</span>
                            {trick.year && <span>• {trick.year}</span>}
                            {trick.videoUrl && (
                              <a
                                href={trick.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
                              >
                                <Video className="h-3 w-3" />
                                Watch
                              </a>
                            )}
                          </div>
                        </div>
                        {loggedIn && (
                          <button
                            onClick={() => handleUpvote(trick._id)}
                            className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                              trick.upvoted
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'hover:bg-secondary text-muted-foreground hover:text-yellow-500'
                            }`}
                          >
                            <ChevronUp className="h-4 w-4" />
                            <span className="text-xs font-medium">{trick.upvotes || 0}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Trick Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a Trick at {spot?.name}</DialogTitle>
            <DialogDescription>Add a famous or personal trick done at this spot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Trick Name *</label>
              <Input
                placeholder="e.g., Kickflip 50-50"
                value={submitForm.trickName}
                onChange={(e) => setSubmitForm({ ...submitForm, trickName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Skater Name *</label>
              <Input
                placeholder="e.g., Andrew Reynolds"
                value={submitForm.skaterName}
                onChange={(e) => setSubmitForm({ ...submitForm, skaterName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Video URL (optional)</label>
              <Input
                placeholder="https://youtube.com/..."
                value={submitForm.videoUrl}
                onChange={(e) => setSubmitForm({ ...submitForm, videoUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Year (optional)</label>
              <Input
                type="number"
                placeholder="2024"
                value={submitForm.year}
                onChange={(e) => setSubmitForm({ ...submitForm, year: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitTrick}
              disabled={submitting || !submitForm.trickName.trim() || !submitForm.skaterName.trim()}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
