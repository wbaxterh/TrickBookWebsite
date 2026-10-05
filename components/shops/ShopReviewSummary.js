import { ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function ShopReviewSummary({ reviewSummary }) {
  if (!reviewSummary || reviewSummary.rating == null) return null;

  const { source, rating, reviewCount, summary, sourceUrl, asOf } = reviewSummary;
  const formattedDate = asOf
    ? new Date(asOf).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  const displaySource = source || 'Google';
  const headerText = displaySource === 'Google' ? 'Google Reviews' : `${displaySource} Reviews`;

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">{headerText}</h2>
          {displaySource === 'Google' && (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5">
            <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
            <span className="font-bold text-blue-700 dark:text-blue-300">{rating.toFixed(1)}</span>
            {reviewCount != null && (
              <span className="text-sm text-muted-foreground">
                ({reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </div>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-blue-500"
            >
              View on {displaySource}
              <ExternalLink className="h-3 w-3" />
            </a>
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
