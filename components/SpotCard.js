import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

export default function SpotCard({
  id,
  name,
  city,
  state,
  imageURL,
  description,
  tags,
  rating,
  approvalStatus,
  showStatus = false,
  category,
  sportTypes,
  resortInfo,
}) {
  const [imageError, setImageError] = useState(false);
  const isResort = category === 'resort' ||
    (sportTypes && (sportTypes.includes('skiing') || sportTypes.includes('snowboarding')));

  // Parse tags if it's a string
  const tagList = tags
    ? typeof tags === 'string'
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : tags
    : [];

  // Generate URL-friendly slug from spot name
  const spotSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const spotUrl = `/spots/${state?.toLowerCase() || 'unknown'}/${spotSlug}?id=${id}`;

  // Get status badge styling
  const getStatusBadge = () => {
    if (!showStatus || !approvalStatus) return null;

    const statusConfig = {
      approved: {
        className: 'bg-green-500 text-white hover:bg-green-500',
        label: 'Approved',
      },
      pending: {
        className: 'bg-yellow-500 text-black hover:bg-yellow-500',
        label: 'Pending Review',
      },
      rejected: {
        className: 'bg-red-500 text-white hover:bg-red-500',
        label: 'Rejected',
      },
      private: {
        className: 'bg-gray-500 text-white hover:bg-gray-500',
        label: 'Private',
      },
    };

    const config = statusConfig[approvalStatus];
    if (!config) return null;

    return (
      <Badge className={`absolute top-2 left-2 z-10 ${config.className}`}>{config.label}</Badge>
    );
  };

  return (
    <Link href={spotUrl} className="no-underline block h-full">
      <Card className="group overflow-hidden hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-44 bg-muted overflow-hidden">
          {getStatusBadge()}
          {imageURL && !imageError ? (
            <Image
              src={imageURL}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <MapPin className="h-12 w-12 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground group-hover:text-yellow-500 transition-colors line-clamp-1">
              {name}
            </h3>
            {isResort && <span className="text-sm flex-shrink-0" title="Resort">⛷️</span>}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">
              {city && state ? `${city}, ${state}` : state || 'Unknown location'}
            </span>
          </div>

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tagList.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                >
                  {tag}
                </Badge>
              ))}
              {tagList.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tagList.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{description}</p>
          )}

          {/* Resort Compact Ratings */}
          {isResort && resortInfo?.ratings && (
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              {resortInfo.ratings.groomers != null && (
                <span className="flex items-center gap-1">
                  🟢 {[...Array(5)].map((_, i) => (
                    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < resortInfo.ratings.groomers ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  ))}
                </span>
              )}
              {resortInfo.ratings.park != null && (
                <span className="flex items-center gap-1">
                  🏗️ {[...Array(5)].map((_, i) => (
                    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < resortInfo.ratings.park ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  ))}
                </span>
              )}
              {resortInfo.ratings.backcountry != null && (
                <span className="flex items-center gap-1">
                  🌲 {[...Array(5)].map((_, i) => (
                    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < resortInfo.ratings.backcountry ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  ))}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
