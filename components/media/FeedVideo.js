import { Play } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createFeedVideoCoordinator } from '../../lib/feedVideoCoordinator';
import VideoPlayer from './VideoPlayer';

const coordinator = createFeedVideoCoordinator();
const aspectClasses = {
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-video',
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
};

export default function FeedVideo({ post, autoPlay = false }) {
  const id = useId();
  const containerRef = useRef(null);
  const positionRef = useRef(0);
  const requestedRef = useRef(false);
  const [active, setActive] = useState(false);
  const aspectRatio = post.aspectRatio || '9:16';
  const poster = post.signedThumbnailUrl || post.thumbnailUrl;

  useEffect(() => {
    const node = containerRef.current;
    const connection = navigator.connection;
    const reducedData = window.matchMedia('(prefers-reduced-data: reduce)');
    let score = 0;
    const update = () =>
      coordinator.update(id, score, !connection?.saveData && !reducedData.matches);
    coordinator.register(id, (next) => {
      if (!next) requestedRef.current = false;
      setActive(next);
    });
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              score = entry.isIntersecting ? entry.intersectionRatio : 0;
              update();
            },
            { threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] },
          );
    if (node) observer?.observe(node);
    const onVisibility = () => coordinator.setVisible(document.visibilityState !== 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    connection?.addEventListener('change', update);
    reducedData.addEventListener('change', update);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      connection?.removeEventListener('change', update);
      reducedData.removeEventListener('change', update);
      coordinator.unregister(id);
    };
  }, [id]);

  return (
    <div
      ref={containerRef}
      data-feed-video={post._id}
      data-stream-active={active}
      className={`w-full ${aspectRatio === '9:16' ? 'max-w-[400px]' : ''}`}
    >
      {active ? (
        <VideoPlayer
          src={post.signedHlsUrl || post.signedMp4Url || post.hlsUrl || post.videoUrl}
          poster={poster}
          loop
          autoPlay={requestedRef.current || autoPlay}
          controls
          initialTime={positionRef.current}
          onPlay={() => coordinator.activate(id)}
          onTimeUpdate={(time) => {
            positionRef.current = time;
          }}
          aspectRatio={aspectRatio}
          objectFit="cover"
          className="max-h-[600px]"
        />
      ) : (
        <button
          type="button"
          aria-label={`Play clip by ${post.user?.name || 'rider'}`}
          onClick={() => {
            requestedRef.current = true;
            coordinator.activate(id);
          }}
          className={`relative flex w-full max-h-[600px] items-center justify-center overflow-hidden bg-black ${aspectClasses[aspectRatio] || 'aspect-video'}`}
        >
          {/* Native poster avoids initializing any media loader for distant cards. */}
          {poster && (
            <img
              src={poster}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-black">
            <Play aria-hidden="true" size={32} />
          </span>
        </button>
      )}
    </div>
  );
}
