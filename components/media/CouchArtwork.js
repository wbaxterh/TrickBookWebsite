import { Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { getCouchArtworkCandidates } from '../../lib/couchArtwork';

export default function CouchArtwork({ video, variant = 'poster', className = '' }) {
  // Keep failures by URL, not by film. New films/candidates still load, and a
  // rotating hero does not re-request a failed URL when it comes around again.
  const [failedSources, setFailedSources] = useState(() => new Set());
  const source = getCouchArtworkCandidates(video, variant).find(
    ({ src }) => !failedSources.has(src),
  );
  if (!source) {
    return (
      <div
        role="img"
        aria-label={`${video.title} artwork unavailable`}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-black/50"
      >
        <Play className="h-12 w-12 text-white/50" aria-hidden="true" />
      </div>
    );
  }
  return (
    <Image
      key={source.src}
      src={source.src}
      alt={video.title}
      fill
      className={className}
      unoptimized={source.unoptimized}
      onError={() => setFailedSources((current) => new Set(current).add(source.src))}
    />
  );
}
