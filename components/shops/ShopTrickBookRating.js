import { Loader2, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { trackShopRated, trackShopRatingRemoved } from '../../lib/analytics';
import { deleteShopRating, getShopRatings, setShopRating } from '../../lib/apiShops';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

function StarRating({ rating, onRate, interactive = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(0);
  };

  if (interactive) {
    return (
      <fieldset
        className="inline-flex gap-0.5 border-0 p-0"
        onMouseLeave={handleMouseLeave}
        aria-label="Rate this shop"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRate?.(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="cursor-pointer transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              aria-pressed={star === rating}
            >
              <Star
                className={`${sizeClasses} ${
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-transparent text-muted-foreground/40'
                } transition-colors`}
              />
            </button>
          );
        })}
      </fieldset>
    );
  }

  return (
    <div
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`Rating: ${rating || 0} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <span key={star} aria-hidden="true">
            <Star
              className={`${sizeClasses} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground/40'
              }`}
            />
          </span>
        );
      })}
    </div>
  );
}

function RatingDistribution({ distribution, totalCount }) {
  if (!distribution || totalCount === 0) return null;

  return (
    <div className="mt-4 space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[String(star)] || 0;
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-muted-foreground">{star}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ShopTrickBookRating({ shop }) {
  const { token, loggedIn } = useContext(AuthContext);
  const shopId = shop?.slug || shop?._id;

  const [ratingsData, setRatingsData] = useState({
    averageRating: null,
    ratingCount: 0,
    distribution: {},
    myRating: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadRatings = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getShopRatings(shopId, token);
      setRatingsData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('not_available');
      } else {
        setError('load_failed');
      }
    } finally {
      setLoading(false);
    }
  }, [shopId, token]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleRate = async (rating) => {
    if (!token || submitting) return;

    const previousData = { ...ratingsData };
    const isNewRating = ratingsData.myRating === null;
    const oldRating = ratingsData.myRating;

    setRatingsData((prev) => {
      const newDistribution = { ...prev.distribution };
      if (oldRating) {
        newDistribution[String(oldRating)] = Math.max(
          0,
          (newDistribution[String(oldRating)] || 1) - 1,
        );
      }
      newDistribution[String(rating)] = (newDistribution[String(rating)] || 0) + 1;

      const newCount = isNewRating ? prev.ratingCount + 1 : prev.ratingCount;
      const totalStars = Object.entries(newDistribution).reduce(
        (sum, [star, count]) => sum + Number(star) * count,
        0,
      );
      const newAverage = newCount > 0 ? totalStars / newCount : null;

      return {
        ...prev,
        myRating: rating,
        ratingCount: newCount,
        averageRating: newAverage,
        distribution: newDistribution,
      };
    });

    setSubmitting(true);
    try {
      const data = await setShopRating(shopId, rating, token);
      setRatingsData(data);
      trackShopRated(shop, rating);
    } catch (_err) {
      setRatingsData(previousData);
      alert('Failed to save your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRating = async () => {
    if (!token || submitting || ratingsData.myRating === null) return;

    const previousData = { ...ratingsData };
    const oldRating = ratingsData.myRating;

    setRatingsData((prev) => {
      const newDistribution = { ...prev.distribution };
      if (oldRating) {
        newDistribution[String(oldRating)] = Math.max(
          0,
          (newDistribution[String(oldRating)] || 1) - 1,
        );
      }

      const newCount = Math.max(0, prev.ratingCount - 1);
      const totalStars = Object.entries(newDistribution).reduce(
        (sum, [star, count]) => sum + Number(star) * count,
        0,
      );
      const newAverage = newCount > 0 ? totalStars / newCount : null;

      return {
        ...prev,
        myRating: null,
        ratingCount: newCount,
        averageRating: newAverage,
        distribution: newDistribution,
      };
    });

    setSubmitting(true);
    try {
      const data = await deleteShopRating(shopId, token);
      setRatingsData(data);
      trackShopRatingRemoved(shop);
    } catch (_err) {
      setRatingsData(previousData);
      alert('Failed to remove your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error === 'not_available') {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
        </CardContent>
      </Card>
    );
  }

  const { averageRating, ratingCount, distribution, myRating } = ratingsData;
  const hasRatings = ratingCount > 0;

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">TrickBook Rating</h2>
          {submitting && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
        </div>

        {hasRatings ? (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-foreground">
                {averageRating?.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <StarRating rating={Math.round(averageRating)} size="md" />
                <span className="mt-0.5 text-sm text-muted-foreground">
                  {ratingCount.toLocaleString()} {ratingCount === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No ratings yet. Be the first!</p>
        )}

        <RatingDistribution distribution={distribution} totalCount={ratingCount} />

        <div className="mt-6 border-t border-border pt-4">
          {loggedIn ? (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {myRating ? 'Your rating' : 'Rate this shop'}
              </p>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={myRating || 0}
                  onRate={handleRate}
                  interactive={!submitting}
                  size="lg"
                />
                {myRating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveRating}
                    disabled={submitting}
                    className="text-muted-foreground hover:text-red-500"
                    aria-label="Remove your rating"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="block text-center text-sm text-muted-foreground hover:text-yellow-500"
            >
              Sign in to rate this shop
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
