import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { mockFeed, startFeedFixture } from './helpers/feed-fixture';

let fixture;
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  screenshot: 'on',
});
test.beforeAll(async () => {
  fixture = await startFeedFixture();
});
test.afterAll(async () => {
  await fixture.close();
});

test('unscrolled feed limits stream requests on a constrained network', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'CDP transferred-byte measurement is Chromium-specific.');
  await mockFeed(page, fixture.origin);
  await page.goto('/media?tab=couch');
  await expect(page.getByRole('heading', { name: 'The Couch', exact: true })).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 80,
    downloadThroughput: 200000,
    uploadThroughput: 100000,
  });
  const requests = new Map();
  let transferredBytes = 0;
  cdp.on('Network.requestWillBeSent', ({ requestId, request }) => {
    if (request.url.startsWith(fixture.origin) && /\.(m3u8|mpegts|mp4)$/.test(request.url))
      requests.set(requestId, new URL(request.url).pathname);
  });
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    if (requests.has(requestId)) transferredBytes += encodedDataLength;
  });
  // Warm the app shell before throttling so dev-bundle download time is not the video measurement.
  await page.getByRole('tab', { name: 'The Feed', exact: true }).click();
  await expect(page.getByText('Fixture clip 16')).toBeAttached();
  // Fixed observation window, not an arbitrary readiness wait: matches the audit's eight-second sample.
  await page.waitForTimeout(8000);
  const paths = [...requests.values()];
  const streamIds = [...new Set(paths.map((url) => url.split('/')[2]))];
  const measurement = {
    checkedAt: new Date().toISOString(),
    entry: 'Warm app shell, then Couch to Feed tab; no scroll or playback',
    viewport: '390x844',
    observationSeconds: 8,
    latencyMs: 80,
    downloadBytesPerSecond: 200000,
    fixturePosts: 17,
    streamIds,
    streamRequests: paths.length,
    segmentRequests: paths.filter((url) => url.endsWith('.mpegts')).length,
    transferredBytes,
  };
  const output = testInfo.outputPath('feed-network-measurement.json');
  await fs.writeFile(output, JSON.stringify(measurement, null, 2));
  await testInfo.attach('feed-network-measurement', {
    path: output,
    contentType: 'application/json',
  });
  await testInfo.attach('feed-network-before-fix', {
    path: path.join(__dirname, 'fixtures/feed-video/baseline.json'),
    contentType: 'application/json',
  });
  expect(streamIds.length, JSON.stringify(measurement)).toBeLessThanOrEqual(1);
  expect(streamIds).toEqual(['0']);
  expect(transferredBytes).toBeGreaterThan(0);
});

test('scrolling unloads distant players and preserves playback/seek/quality', async ({
  page,
}, testInfo) => {
  const supportsHls = await page.evaluate(
    () =>
      typeof MediaSource !== 'undefined' ||
      Boolean(document.createElement('video').canPlayType('application/vnd.apple.mpegurl')),
  );
  testInfo.annotations.push({
    type: 'media-path',
    description: supportsHls ? 'HLS' : 'MP4: this browser build has no native HLS or MediaSource',
  });
  await mockFeed(page, fixture.origin, { mp4: !supportsHls });
  const paths = [];
  page.on('request', (request) => {
    if (request.url().startsWith(fixture.origin) && /\.(m3u8|mpegts|mp4)$/.test(request.url()))
      paths.push(new URL(request.url()).pathname);
  });
  await page.goto('/media?tab=feed');
  const first = page.locator('[data-feed-video="fixture-0"]');
  await expect(first.locator('video')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(1);
  await first.getByRole('button', { name: 'Play video', exact: true }).first().click();
  await expect
    .poll(() => first.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0.5);
  await first.getByRole('button', { name: 'Pause video' }).click();
  await expect(first.locator('video')).toHaveJSProperty('paused', true);
  // Seek through the existing progress control, not by replacing the media clock.
  const seek = first.locator('.group\\/progress');
  // Keep the control away from the known floating-launcher obstruction (#133), without forced clicks.
  await seek.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const box = await seek.boundingBox();
  await seek.click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect
    .poll(() => first.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(4);
  const savedTime = await first.locator('video').evaluate((video) => video.currentTime);
  await expect(first.locator('video')).toHaveJSProperty('seeking', false);
  const quality = first.getByRole('button', { name: 'Video quality' });
  if (page.context().browser().browserType().name() === 'chromium')
    await expect(quality).toBeVisible();
  if (await quality.count()) {
    await quality.click();
    await first.getByRole('button', { name: 'Auto', exact: true }).click();
  }
  const last = page.locator('[data-feed-video="fixture-16"]');
  await expect(last.locator('img')).toHaveAttribute('loading', 'lazy');
  await last.scrollIntoViewIfNeeded();
  await expect(last.locator('video')).toHaveCount(1);
  await expect(first.locator('video')).toHaveCount(0);
  await expect(page.locator('video')).toHaveCount(1);
  expect(paths.filter((url) => /\/feed\/(?:[2-9]|1[0-4])\//.test(url))).toEqual([]);
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('video')).toHaveCount(1);
  await first.getByRole('button', { name: 'Play video', exact: true }).first().click();
  await expect
    .poll(() => first.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThanOrEqual(savedTime - 0.2);
});

test('Data Saver keeps posters unloaded until explicit play and releases MP4 offscreen', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: Object.assign(new EventTarget(), { saveData: true }),
    });
  });
  await mockFeed(page, fixture.origin, { mp4: true });
  const streams = [];
  page.on('request', (request) => {
    if (request.url().startsWith(fixture.origin) && request.url().endsWith('.mp4'))
      streams.push(request.url());
  });
  await page.goto('/media?tab=feed');
  const first = page.locator('[data-feed-video="fixture-0"]');
  await expect(first.getByRole('button', { name: 'Play clip by Fixture Rider' })).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  expect(streams).toEqual([]);
  await first.getByRole('button', { name: 'Play clip by Fixture Rider' }).click();
  await expect(first.locator('video')).toHaveCount(1);
  await expect
    .poll(() => first.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0.5);
  await page.locator('[data-feed-video="fixture-16"]').scrollIntoViewIfNeeded();
  await expect(page.locator('video')).toHaveCount(0);
  expect(streams.every((url) => url.includes('/feed/0/'))).toBe(true);
});

test('rapid navigation cannot attach late HLS loaders after the feed unmounts', async ({
  page,
}) => {
  await mockFeed(page, fixture.origin);
  await page.goto('/media?tab=feed');
  await expect(page.locator('[data-feed-video]')).toHaveCount(17);
  await page.getByRole('tab', { name: 'The Couch', exact: true }).click();
  await expect(page.locator('video')).toHaveCount(0);
  await page.getByRole('tab', { name: 'The Feed', exact: true }).click();
  await expect(page.locator('video')).toHaveCount(1);
});

test('a simulated hidden document releases the active loader', async ({ page }) => {
  await mockFeed(page, fixture.origin, { mp4: true });
  await page.goto('/media?tab=feed');
  await expect(page.locator('video')).toHaveCount(1);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('video')).toHaveCount(0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('video')).toHaveCount(1);
});

test('without IntersectionObserver the explicit play fallback still works', async ({ page }) => {
  await page.addInitScript(() => {
    window.IntersectionObserver = undefined;
  });
  await mockFeed(page, fixture.origin, { mp4: true });
  await page.goto('/media?tab=feed');
  const first = page.locator('[data-feed-video="fixture-0"]');
  await expect(first.getByRole('button', { name: 'Play clip by Fixture Rider' })).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  await first.getByRole('button', { name: 'Play clip by Fixture Rider' }).click();
  await expect
    .poll(() => first.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0.5);
});
