import { ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function ShopReviewSummary({ reviewSummary }) {
  if (!reviewSummary || reviewSummary.rating == null) return null;

  const { source, rating, reviewCount, summary, sourceUrl, asOf } = reviewSummary;
  const formattedDate = asOf
    ? new Date(asOf).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-foreground">Reviews</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1.5">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-yellow-700 dark:text-yellow-300">
              {rating.toFixed(1)}
            </span>
            {reviewCount != null && (
              <span className="text-sm text-muted-foreground">
                ({reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </div>
          {source && (
            <span className="text-sm text-muted-foreground">
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground no-underline hover:text-yellow-500"
                >
                  via {source}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                `via ${source}`
              )}
            </span>
          )}
        </div>
        {summary && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
        {formattedDate && (
          <p className="mt-3 text-xs text-muted-foreground/70">Last updated {formattedDate}</p>
        )}
      </CardContent>
    </Card>
  );
}
