import { Camera, Store } from 'lucide-react';
import { useState } from 'react';

function getImageUrl(image) {
  if (typeof image === 'string') return image.trim();
  return image?.url || image?.src || image?.imageUrl || '';
}

export function getShopImageCandidates(shop) {
  const candidates = [shop?.imageUrl, shop?.image, shop?.coverImage]
    .map(getImageUrl)
    .filter(Boolean);

  return [...new Set(candidates)];
}

export default function ShopCoverImage({
  shop,
  variant = 'card',
  className = '',
  showAttribution = true,
}) {
  const candidates = getShopImageCandidates(shop);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const sizing =
    variant === 'hero'
      ? 'aspect-[21/9] min-h-[200px] max-h-[400px] md:max-h-[480px]'
      : 'aspect-[16/9] min-h-[160px]';

  const src = candidates[candidateIndex];

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${shop.name || 'Shop'} storefront coming soon`}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-800 to-yellow-500/40 ${sizing} ${className}`}
      >
        <Store className="h-20 w-20 text-yellow-400 md:h-24 md:w-24" aria-hidden="true" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,transparent_45%,rgba(250,204,21,0.35)_45%,rgba(250,204,21,0.35)_55%,transparent_55%)]" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-muted ${sizing} ${className}`}>
      <img
        src={src}
        alt={shop.imageAlt || `${shop.name || 'Shop'} storefront`}
        className="h-full w-full object-cover"
        loading={variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setCandidateIndex((index) => index + 1)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      {showAttribution && shop.imageSourceUrl && (
        <a
          href={shop.imageSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white/90 no-underline backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
        >
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          Photo source
        </a>
      )}
    </div>
  );
}
