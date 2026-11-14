import { Maximize, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  onTimeUpdate,
  onEnded,
  onPlay,
  onProgress,
  initialTime = 0,
  aspectRatio = '16:9',
  objectFit = 'contain',
  className = '',
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality, setQuality] = useState('auto');
  const [qualities, setQualities] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const qualityMenuId = useId();
  const qualityToggleRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const initialTimeRef = useRef(initialTime);
  const releasingRef = useRef(false);
  const timeUpdateRef = useRef(onTimeUpdate);
  timeUpdateRef.current = onTimeUpdate;

  // Dynamic import of hls.js to avoid SSR issues
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    releasingRef.current = false;
    let disposed = false;
    let hls = null;

    const initHls = async () => {
      // Check if it's an HLS stream
      const isHlsSource = src.includes('.m3u8');

      const setNativeSource = () => {
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      };
      if (!isHlsSource) {
        setNativeSource();
        return;
      }
      const Hls = (await import('hls.js')).default;
      // The feed card may have left view while the dynamic import was pending.
      if (disposed) return;
      if (!Hls.isSupported()) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) setNativeSource();
        return;
      }
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const availableQualities = data.levels.map((level, i) => ({
          index: i,
          height: level.height,
          bitrate: level.bitrate,
          label: `${level.height}p`,
        }));
        setQualities([{ index: -1, label: 'Auto', height: 0 }, ...availableQualities]);

        if (!disposed && autoPlay) {
          video.play().catch(() => {});
        }
      });

      hlsRef.current.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
        }
      });
    };

    initHls().catch(() => {});

    return () => {
      disposed = true;
      releasingRef.current = true;
      if (video.readyState > 0) timeUpdateRef.current?.(video.currentTime, video.duration);
      video.pause();
      hls?.destroy();
      if (hlsRef.current === hls) hlsRef.current = null;
      // Also release native HLS/MP4 downloads, not just the hls.js instance.
      video.removeAttribute('src');
      video.load();
    };
  }, [src, autoPlay]);

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setQuality(levelIndex === -1 ? 'Auto' : `${qualities[levelIndex + 1]?.height}p`);
    }
    setShowQualityMenu(false);
    qualityToggleRef.current?.focus();
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  const formatTime = (seconds) => {
    if (Number.isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Clearing a native source can emit a final timeupdate at zero during teardown.
      if (releasingRef.current || video.readyState === 0) return;
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const restorePosition = () => {
      // Native players may reset a seek made before their first frame is loaded.
      if (initialTimeRef.current > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(initialTimeRef.current, Math.max(0, video.duration - 0.1));
        initialTimeRef.current = 0;
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPct = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPct);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      handleTimeUpdate();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', restorePosition);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', restorePosition);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onEnded, onPlay]);

  // Auto-hide controls
  useEffect(() => {
    if (!controls) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !containerRef.current?.contains(document.activeElement))
          setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [controls, isPlaying]);

  const aspectRatioClass =
    {
      '16:9': 'aspect-video',
      '9:16': 'aspect-[9/16]',
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
    }[aspectRatio] || 'aspect-video';

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black ${aspectRatioClass} ${className}`}
      onClick={togglePlay}
      onFocusCapture={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        poster={poster}
        loop={loop}
        muted={isMuted}
        playsInline
        className={`w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            type="button"
            aria-label="Play video"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-400 transition-colors"
          >
            <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      {controls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 focus-within:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="relative flex h-11 items-center rounded group/progress focus-within:outline focus-within:outline-2 focus-within:outline-yellow-500">
            <div className="pointer-events-none absolute h-1 w-full rounded-full bg-white/30" />
            {/* Buffered */}
            <div
              className="pointer-events-none absolute h-1 bg-white/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div
              className="pointer-events-none absolute h-1 bg-yellow-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Seek Handle */}
            <div
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
            <input
              type="range"
              aria-label="Seek video"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              disabled={!duration}
              onChange={(event) => {
                const time = Number(event.target.value);
                if (videoRef.current) videoRef.current.currentTime = time;
                setCurrentTime(time);
                setProgress(duration ? (time / duration) * 100 : 0);
              }}
              className="relative h-11 w-full cursor-pointer opacity-0"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-x-1">
            <div className="flex items-center gap-1">
              {/* Play/Pause */}
              <button
                type="button"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                onClick={togglePlay}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-white hover:text-yellow-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              {/* Volume */}
              <button
                type="button"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                aria-pressed={isMuted}
                onClick={toggleMute}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-white hover:text-yellow-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {/* Time */}
              <span className="text-white text-xs whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Quality Selector */}
              {qualities.length > 0 && (
                <div
                  className="relative"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setShowQualityMenu(false);
                      qualityToggleRef.current?.focus();
                    }
                  }}
                >
                  <button
                    ref={qualityToggleRef}
                    type="button"
                    aria-label="Video quality"
                    aria-expanded={showQualityMenu}
                    aria-controls={qualityMenuId}
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="min-h-11 min-w-11 rounded px-1 text-white hover:text-yellow-500 transition-colors flex items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">{quality}</span>
                  </button>

                  {showQualityMenu && (
                    <div
                      id={qualityMenuId}
                      className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[100px]"
                    >
                      {qualities.map((q) => (
                        <button
                          type="button"
                          key={q.index}
                          onClick={() => handleQualityChange(q.index)}
                          aria-pressed={quality === q.label}
                          className={`block min-h-11 w-full px-4 py-1 text-left text-sm hover:bg-white/10 ${
                            quality === q.label ? 'text-yellow-500' : 'text-white'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                type="button"
                aria-label={isFullscreen ? 'Exit fullscreen video' : 'Fullscreen video'}
                aria-pressed={isFullscreen}
                onClick={toggleFullscreen}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-white hover:text-yellow-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
