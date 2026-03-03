import { Maximize, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  onTimeUpdate,
  onEnded,
  onProgress,
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
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Dynamic import of hls.js to avoid SSR issues
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const initHls = async () => {
      // Check if it's an HLS stream
      const isHlsSource = src.includes('.m3u8');

      if (isHlsSource) {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });

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

            if (autoPlay) {
              video.play().catch(() => {});
            }
          });

          hlsRef.current.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          video.src = src;
          if (autoPlay) video.play().catch(() => {});
        }
      } else {
        // Regular video source (mp4, webm, etc.)
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      }
    };

    initHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setQuality(levelIndex === -1 ? 'Auto' : `${qualities[levelIndex + 1]?.height}p`);
    }
    setShowQualityMenu(false);
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

  const handleSeek = useCallback(
    (e) => {
      const video = videoRef.current;
      if (!video || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * duration;
    },
    [duration],
  );

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
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPct = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPct);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onEnded]);

  // Auto-hide controls
  useEffect(() => {
    if (!controls) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
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
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div
            className="relative h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div
              className="absolute h-full bg-yellow-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Seek Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              {/* Volume */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Quality Selector */}
              {qualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-yellow-500 transition-colors flex items-center gap-1"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">{quality}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[100px]">
                      {qualities.map((q) => (
                        <button
                          key={q.index}
                          onClick={() => handleQualityChange(q.index)}
                          className={`block w-full px-4 py-1 text-left text-sm hover:bg-white/10 ${
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
                onClick={toggleFullscreen}
                className="text-white hover:text-yellow-500 transition-colors"
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
