import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';

export default function PhotoCarousel({ images, imageURL, name }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Build the photo list with fallbacks
  const photos = images?.length > 0
    ? images
    : imageURL
      ? [imageURL]
      : [];

  const handlePrev = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const handleNext = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  const handleImageError = useCallback((index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <MapPin className="h-24 w-24 text-yellow-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group">
      {/* Current Image */}
      {imageErrors[currentIndex] ? (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <MapPin className="h-24 w-24 text-yellow-500" />
        </div>
      ) : (
        <Image
          src={photos[currentIndex]}
          alt={`${name} - Photo ${currentIndex + 1}`}
          fill
          className="object-cover"
          unoptimized
          onError={() => handleImageError(currentIndex)}
        />
      )}

      {/* Navigation Arrows (only if multiple photos) */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
