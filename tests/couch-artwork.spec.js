import { expect, test } from '@playwright/test';

const jw = 'https://cdn.jwplayer.com/v2/media/VrCg12aD/poster.jpg?width=1920';
const origin = 'https://api.thetrickbook.com/assets/';
const artwork =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#475569"/></svg>';
const missing = {
  _id: 'missing-art',
  slug: 'missing-art',
  title: 'Missing artwork film',
  sportTypes: ['skateboarding'],
  thumbnails: { poster: `${origin}missing.jpg` },
};
const good = {
  _id: 'jw-film',
  slug: 'jw-film',
  title: 'JW poster film',
  sportTypes: ['skateboarding'],
  thumbnails: { poster: jw },
};
const alternate = {
  _id: 'alternate-art',
  slug: 'alternate-art',
  title: 'Alternate artwork film',
  sportTypes: ['skateboarding'],
  thumbnails: { poster: `${origin}bad-upstream.jpg` },
  driveThumbnail: `${origin}direct-good.jpg`,
};

test.use({ screenshot: 'on' });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/direct-good.jpg'))
      return route.fulfill({ contentType: 'image/svg+xml', body: artwork });
    if (url.pathname.endsWith('/couch/featured')) return route.fulfill({ json: missing });
    if (url.pathname.endsWith('/couch/collections')) return route.fulfill({ json: [] });
    if (url.pathname.endsWith('/couch/videos'))
      return route.fulfill({ json: [missing, good, alternate] });
    return route.fulfill({ json: { greeting: 'What are you learning next?' } });
  });
  await page.route('**/_next/image?**', (route) => {
    const source = new URL(route.request().url()).searchParams.get('url') || '';
    if (source.endsWith('/missing.jpg'))
      return route.fulfill({ status: 400, body: 'Fixture optimizer rejection' });
    if (source.endsWith('/bad-upstream.jpg'))
      return route.fulfill({ status: 502, body: 'Fixture upstream unavailable' });
    return route.fulfill({ contentType: 'image/svg+xml', body: artwork });
  });
});

function card(page, title) {
  return page
    .getByRole('link')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`known JW poster and deliberate bad-image fallbacks work at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/media?tab=couch');
    const brokenCard = card(page, missing.title);
    await brokenCard.scrollIntoViewIfNeeded();
    await expect(
      brokenCard.getByRole('img', { name: `${missing.title} artwork unavailable` }),
    ).toBeVisible();
    await expect(brokenCard).toHaveAttribute('href', '/media/couch/missing-art');
    const working = card(page, good.title);
    await working.scrollIntoViewIfNeeded();
    const poster = working.getByRole('img', { name: good.title, exact: true });
    await expect(poster).toBeVisible();
    await expect
      .poll(() => poster.evaluate((img) => img.complete && img.naturalWidth > 0))
      .toBe(true);
    const request = requests.find(
      (url) => url.includes('/_next/image?') && new URL(url).searchParams.get('url') === jw,
    );
    expect(request).toBeTruthy();
    expect(requests.filter((url) => url.startsWith('https://cdn.jwplayer.com/'))).toHaveLength(0);
    const alternativeCard = card(page, alternate.title);
    await alternativeCard.scrollIntoViewIfNeeded();
    const replacement = alternativeCard.getByRole('img', { name: alternate.title, exact: true });
    await expect(replacement).toHaveAttribute('src', `${origin}direct-good.jpg`);
    await expect.poll(() => replacement.evaluate((img) => img.naturalWidth > 0)).toBe(true);
    await expect(alternativeCard.getByRole('img', { name: /unavailable/ })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('failed hero/card URLs stay retired across carousel rotation, hover and resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  const failures = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/_next/image' && url.searchParams.get('url')?.endsWith('/missing.jpg'))
      failures.push(request.url());
  });
  await page.goto('/media?tab=couch');
  await expect(
    page.getByRole('img', { name: `${missing.title} artwork unavailable` }).first(),
  ).toBeVisible();
  const brokenCard = card(page, missing.title);
  await brokenCard.scrollIntoViewIfNeeded();
  await expect(brokenCard.getByRole('img', { name: /artwork unavailable/ })).toBeVisible();
  const failedCount = failures.length;
  expect(failedCount).toBeGreaterThan(0);
  await brokenCard.hover();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.runFor(25000);
  await expect(page.getByRole('heading', { name: missing.title, level: 1 })).toBeVisible();
  await expect(
    page.getByRole('img', { name: `${missing.title} artwork unavailable` }).first(),
  ).toBeVisible();
  expect(failures.length).toBe(failedCount);
});

test('search cards retain usable film titles and destinations when art is absent', async ({
  page,
}) => {
  await page.route('**/couch/videos?**', (route) =>
    route.fulfill({ json: [{ ...missing, thumbnails: {} }, good] }),
  );
  await page.goto('/media/search?q=film');
  const missingCard = card(page, missing.title);
  await expect(missingCard.getByRole('img', { name: /artwork unavailable/ })).toBeVisible();
  await expect(missingCard).toHaveAttribute('href', '/media/couch/missing-art');
  const working = card(page, good.title).getByRole('img', { name: good.title, exact: true });
  await expect
    .poll(() => working.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
});
