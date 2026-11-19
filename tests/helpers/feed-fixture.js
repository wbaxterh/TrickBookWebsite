import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const contentTypes = {
  'index.m3u8': 'application/vnd.apple.mpegurl',
  'clip.mp4': 'video/mp4',
  'poster.svg': 'image/svg+xml',
  'segment-0.mpegts': 'video/mp2t',
  'segment-1.mpegts': 'video/mp2t',
  'segment-2.mpegts': 'video/mp2t',
};

export async function startFeedFixture() {
  const folder = path.join(__dirname, '../fixtures/feed-video');
  const server = http.createServer((request, response) => {
    const file = path.basename(new URL(request.url, 'http://fixture').pathname);
    if (!Object.hasOwn(contentTypes, file)) {
      response.writeHead(404).end();
      return;
    }
    const body = fs.readFileSync(path.join(folder, file));
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[file],
      'Accept-Ranges': 'bytes',
    };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Math.min(range[2] ? Number(range[2]) : body.length - 1, body.length - 1);
      response.writeHead(206, {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${body.length}`,
        'Content-Length': end - start + 1,
      });
      response.end(body.subarray(start, end + 1));
    } else {
      response.writeHead(200, { ...headers, 'Content-Length': body.length });
      response.end(body);
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

export async function mockFeed(page, origin, { mp4 = false } = {}) {
  const posts = Array.from({ length: 17 }, (_, index) => ({
    _id: `fixture-${index}`,
    user: { _id: 'fixture-rider', name: 'Fixture Rider' },
    createdAt: '2026-11-05T12:00:00Z',
    caption: `Fixture clip ${index}`,
    mediaType: 'video',
    aspectRatio: '9:16',
    videoUrl: `${origin}/feed/${index}/${mp4 ? 'clip.mp4' : 'index.m3u8'}`,
    thumbnailUrl: `${origin}/feed/${index}/poster.svg`,
    stats: {},
  }));
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/feed') return route.fulfill({ json: { posts } });
    if (url.pathname.endsWith('/couch/featured')) return route.fulfill({ json: null });
    if (url.pathname.includes('/couch/')) return route.fulfill({ json: [] });
    return route.fulfill({ json: { greeting: 'What are you working on?' } });
  });
}
