import { useMemo, useState } from 'react';

function getImageUrl(image) {
  if (typeof image === 'string') return image.trim();
  return image?.url || image?.src || image?.imageUrl || '';
}

export function getEventImageCandidates(event) {
  const candidates = [
    event?.image,
    event?.coverImage,
    event?.posterUrl,
    ...(Array.isArray(event?.media?.images) ? event.media.images : []),
  ]
    .map(getImageUrl)
    .filter(Boolean);

  return [...new Set(candidates)];
}

export default function EventCoverImage({ event, variant = 'card', className = '' }) {
  const candidates = useMemo(() => getEventImageCandidates(event), [event]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const src = candidates[candidateIndex];
  if (!src) return null;

  const sizing =
    variant === 'hero'
      ? 'aspect-[16/9] max-h-[560px] rounded-2xl'
      : 'aspect-[16/7] sm:aspect-[16/6]';

  return (
    <div className={`relative overflow-hidden bg-muted ${sizing} ${className}`}>
      <img
        src={src}
        alt={`${event.title || 'Event'} poster or cover`}
        className="h-full w-full object-cover"
        loading={variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setCandidateIndex((index) => index + 1)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
    </div>
  );
}
