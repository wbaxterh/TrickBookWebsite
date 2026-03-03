import { ArrowLeft, Loader2, MapPin, Trash2 } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import SpotCard from '../../components/SpotCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { getSpotList, getSpotsInList, removeSpotFromList } from '../../lib/apiSpots';

export default function SpotListDetail() {
  const router = useRouter();
  const { listId } = router.query;
  const { loggedIn, token } = useContext(AuthContext);

  const [list, setList] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spotToRemove, setSpotToRemove] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listData, spotsData] = await Promise.all([
        getSpotList(listId, token),
        getSpotsInList(listId, token),
      ]);
      setList(listData);
      setSpots(spotsData);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    if (!listId) return;

    fetchData();
  }, [loggedIn, listId, router, fetchData]);

  const handleRemoveClick = (spot, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSpotToRemove(spot);
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!spotToRemove) return;

    try {
      await removeSpotFromList(listId, spotToRemove._id, token);
      setDeleteDialogOpen(false);
      setSpotToRemove(null);
      fetchData();
    } catch (_error) {
      alert('Failed to remove spot from list');
    }
  };

  if (loggedIn === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">List not found</h1>
            <Button variant="outline" onClick={() => router.push('/my-spots')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Lists
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{list.name} - My Spot Lists | The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={`View spots in ${list.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container py-8">
            {/* Back Link */}
            <Link
              href="/my-spots"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-yellow-500 transition-colors mb-6 no-underline"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Lists</span>
            </Link>

            <h1 className="text-3xl font-bold text-foreground">{list.name}</h1>

            {list.description && <p className="text-muted-foreground mt-2">{list.description}</p>}

            <Badge variant="secondary" className="mt-4">
              {spots.length} spot{spots.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </section>

        {/* Spots Grid */}
        <section className="container py-8">
          {spots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spots.map((spot) => (
                <div key={spot._id} className="relative group">
                  <SpotCard
                    id={spot._id}
                    name={spot.name}
                    city={spot.city}
                    state={spot.state}
                    imageURL={spot.imageURL}
                    description={spot.description}
                    tags={spot.tags}
                    rating={spot.rating}
                    approvalStatus={spot.approvalStatus}
                    showStatus={true}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemoveClick(spot, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No spots in this list yet
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Use our Chrome extension to add spots from Google Maps, or browse spots and add them
                to your lists.
              </p>
              <Button
                onClick={() => router.push('/spots')}
                className="bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Browse Spots
              </Button>
            </div>
          )}
        </section>

        {/* Remove Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Spot</DialogTitle>
              <DialogDescription>
                Remove &quot;{spotToRemove?.name}&quot; from this list?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmRemove}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
