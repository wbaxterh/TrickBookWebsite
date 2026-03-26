import { ExternalLink, Instagram, Mountain, Snowflake, TreePine } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

const FEATURE_LABELS = {
  'night-skiing': 'Night Skiing',
  'terrain-park': 'Terrain Park',
  'gondola': 'Gondola',
  'halfpipe': 'Halfpipe',
  'cross-country': 'Cross Country',
  'snowmaking': 'Snowmaking',
  'ski-school': 'Ski School',
  'rentals': 'Rentals',
  'lodging': 'Lodging',
  'tubing': 'Tubing',
};

function formatFeature(feature) {
  return FEATURE_LABELS[feature] || feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function RatingRow({ label, icon, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-28 text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`inline-block w-4 h-4 rounded-full ${
              i <= value ? 'bg-yellow-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{value}/5</span>
    </div>
  );
}

export default function ResortInfo({ resortInfo }) {
  if (!resortInfo) return null;

  const { website, instagram, ratings, features, verticalDrop, trailCount, liftCount } = resortInfo;
  const hasStats = verticalDrop || trailCount || liftCount;
  const hasRatings = ratings && (ratings.groomers || ratings.park || ratings.backcountry);
  const hasFeatures = features && features.length > 0;
  const hasLinks = website || instagram;

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mountain className="h-5 w-5 text-yellow-500" />
            Resort Info
          </h2>

          {/* Stats Bar */}
          {hasStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {verticalDrop && (
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">🏔️</div>
                  <div className="text-xl font-bold text-foreground">{verticalDrop.toLocaleString()}ft</div>
                  <div className="text-xs text-muted-foreground">Vertical Drop</div>
                </div>
              )}
              {trailCount && (
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">🎿</div>
                  <div className="text-xl font-bold text-foreground">{trailCount}</div>
                  <div className="text-xs text-muted-foreground">Trails</div>
                </div>
              )}
              {liftCount && (
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">🚡</div>
                  <div className="text-xl font-bold text-foreground">{liftCount}</div>
                  <div className="text-xs text-muted-foreground">Lifts</div>
                </div>
              )}
            </div>
          )}

          {hasStats && (hasRatings || hasFeatures || hasLinks) && <Separator />}

          {/* Ratings */}
          {hasRatings ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Ratings</h3>
              {ratings.groomers != null && (
                <RatingRow label="Groomers" icon="🟢" value={ratings.groomers} />
              )}
              {ratings.park != null && (
                <RatingRow label="Terrain Park" icon="🏗️" value={ratings.park} />
              )}
              {ratings.backcountry != null && (
                <RatingRow label="Backcountry" icon="🌲" value={ratings.backcountry} />
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No ratings yet — be the first!</p>
            </div>
          )}

          {(hasRatings || !hasRatings) && (hasFeatures || hasLinks) && <Separator />}

          {/* Features */}
          {hasFeatures && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                  >
                    {formatFeature(feature)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasFeatures && hasLinks && <Separator />}

          {/* Links */}
          {hasLinks && (
            <div className="flex flex-wrap gap-3">
              {website && (
                <Button asChild variant="outline" size="sm">
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {instagram && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://instagram.com/${instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    {instagram}
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
