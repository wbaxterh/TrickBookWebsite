const { getCouchArtworkCandidates } = require('../couchArtwork');
const { hasMatch } = require('next/dist/shared/lib/match-remote-pattern');
const config = require('../../next.config');

const jw = 'https://cdn.jwplayer.com/v2/media/VrCg12aD/poster.jpg?width=1920';

test('actual JW poster path and width query are allowed by Next image matching', () => {
  expect(hasMatch([], config.images.remotePatterns, new URL(jw))).toBe(true);
});

test.each([
  'http://cdn.jwplayer.com/v2/media/VrCg12aD/poster.jpg',
  'https://cdn.jwplayer.com:8443/v2/media/VrCg12aD/poster.jpg',
  'https://cdn.jwplayer.com/v2/playlists/private.json',
  'https://cdn.jwplayer.com/v2/media/VrCg12aD/stream.m3u8',
  'https://cdn.jwplayer.com.attacker.example/v2/media/VrCg12aD/poster.jpg',
])('does not broaden the optimizer to %s', (url) => {
  expect(hasMatch([], config.images.remotePatterns, new URL(url))).toBe(false);
});

test('candidate order follows hero vs card context, with deduplication', () => {
  const video = {
    thumbnails: { poster: jw, backdrop: '/backdrop.jpg' },
    artwork: { poster: jw, thumbnail: '/thumb.jpg' },
  };
  expect(getCouchArtworkCandidates(video).map(({ src }) => src)).toEqual([
    jw,
    '/thumb.jpg',
    '/backdrop.jpg',
  ]);
  expect(getCouchArtworkCandidates(video, 'backdrop').map(({ src }) => src)).toEqual([
    '/backdrop.jpg',
    jw,
    '/thumb.jpg',
  ]);
});

test('only the chosen Drive/YouTube source bypasses optimization', () => {
  const candidates = getCouchArtworkCandidates({
    thumbnails: { poster: jw },
    driveThumbnail: ' https://drive.google.com/thumbnail?id=fixture ',
  });
  expect(candidates.map(({ unoptimized }) => unoptimized)).toEqual([false, true]);
  expect(
    getCouchArtworkCandidates({
      thumbnails: { poster: 'https://i.ytimg.com/vi/fixture/hqdefault.jpg' },
    })[0].unoptimized,
  ).toBe(true);
});

test('missing and malformed candidates do not crash or produce blank image requests', () => {
  expect(getCouchArtworkCandidates()).toEqual([]);
  expect(
    getCouchArtworkCandidates({ thumbnails: { poster: {}, backdrop: ' ' }, driveThumbnail: 12 }),
  ).toEqual([]);
});
