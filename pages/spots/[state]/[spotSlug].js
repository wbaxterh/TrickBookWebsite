import { ArrowLeft, ExternalLink, Loader2, MapPin, Plus } from 'lucide-react';
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
import { getSpotData } from '../../../lib/apiSpots';

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
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              {spot.imageURL ? (
                <Image
                  src={spot.imageURL}
                  alt={spot.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <MapPin className="h-24 w-24 text-yellow-500" />
                </div>
              )}
            </div>

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
        </div>
      </div>
    </>
  );
}
