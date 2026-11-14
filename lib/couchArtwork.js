export function getCouchArtworkCandidates(video, variant = 'poster') {
  const poster = video?.thumbnails?.poster;
  const backdrop = video?.thumbnails?.backdrop;
  const driveThumbnail =
    typeof video?.driveThumbnail === 'string' ? video.driveThumbnail.trim() : null;
  const artwork = video?.artwork || {};
  const sources =
    variant === 'backdrop'
      ? [
          backdrop,
          poster,
          video?.driveThumbnail,
          artwork.backdrop,
          artwork.poster,
          artwork.thumbnail,
        ]
      : [
          poster,
          video?.driveThumbnail,
          artwork.poster,
          artwork.thumbnail,
          backdrop,
          artwork.backdrop,
        ];
  const seen = new Set();
  return sources
    .filter((source) => {
      if (typeof source !== 'string' || !source.trim() || seen.has(source.trim())) return false;
      seen.add(source.trim());
      return true;
    })
    .map((source) => {
      const src = source.trim();
      return {
        src,
        unoptimized:
          src === driveThumbnail || /^https:\/\/(?:i\.ytimg\.com|img\.youtube\.com)\//.test(src),
      };
    });
}
