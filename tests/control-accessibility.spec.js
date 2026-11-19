import { expect, test } from '@playwright/test';
import { mockFeed, startFeedFixture } from './helpers/feed-fixture';

test.use({ screenshot: 'on' });
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function hitArea(locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/categories'))
      return route.fulfill({ json: [{ _id: 'skate', name: 'Skateboarding' }] });
    if (path.endsWith('/trickipedia')) return route.fulfill({ json: [] });
    if (path.endsWith('/browse-summary'))
      return route.fulfill({ json: { total: 0, countries: [], groups: [] } });
    if (path.endsWith('/couch/featured')) return route.fulfill({ json: null });
    if (path.includes('/couch/')) return route.fulfill({ json: [] });
    return route.fulfill({ json: { greeting: 'What are you learning?' } });
  });
});

for (const viewport of viewports) {
  test(`discovery and signup controls have names and touch areas at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/trickbook');
    const search = page.getByRole('textbox', { name: 'Search tricks', exact: true });
    await hitArea(search);
    await search.fill('ollie');
    await expect(search).toHaveValue('ollie');
    if (viewport.width < 1024) {
      const toggle = page.getByRole('button', { name: /^(Open|Close) trick navigation$/ });
      await hitArea(toggle);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('combobox', { name: 'Trick category' })).toHaveCount(0);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const category = page.getByRole('combobox', { name: 'Trick category' });
      await hitArea(category);
      for (const name of ['Trickipedia', 'My Trick Lists', 'Homie Trick Lists']) {
        await hitArea(page.getByRole('tab', { name, exact: true }));
      }
      await testInfo.attach('open-trick-navigation', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      await category.focus();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('combobox', { name: 'Trick category' })).toHaveCount(0);
    } else {
      await expect(page.getByRole('button', { name: 'Open trick navigation' })).toBeHidden();
      await hitArea(page.getByRole('combobox', { name: 'Trick category' }));
    }
    await page.goto('/spots');
    const list = page.getByRole('button', { name: 'List view', exact: true });
    const map = page.getByRole('button', { name: 'Map view', exact: true });
    await hitArea(list);
    await hitArea(map);
    await expect(map).toHaveAttribute('aria-pressed', 'true');
    await list.focus();
    await page.keyboard.press('Enter');
    await expect(list).toHaveAttribute('aria-pressed', 'true');
    await expect(map).toHaveAttribute('aria-pressed', 'false');
    const add = page.getByRole('link', { name: 'Add spot', exact: true });
    await hitArea(add);
    await expect(add).toHaveAttribute('href', '/login?redirect=/spots/add');
    await expect(add.locator('button')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.goto('/media?tab=couch');
    await hitArea(page.getByRole('link', { name: 'Search films', exact: true }));
    await expect(page.locator('a button, button a')).toHaveCount(0);
    await page.goto('/signup');
    const password = page.getByLabel('Password', { exact: true });
    await password.fill('Fixture-only-password');
    const show = page.getByRole('button', { name: 'Show password', exact: true });
    await hitArea(show);
    await show.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(show).toBeFocused();
    await page.keyboard.press('Space');
    await expect(password).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Hide password', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.keyboard.press('Space');
    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('Fixture-only-password');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test.describe('Feed player keyboard and touch controls', () => {
  let fixture;
  test.beforeAll(async () => {
    fixture = await startFeedFixture();
  });
  test.afterAll(async () => {
    await fixture.close();
  });
  for (const viewport of viewports) {
    test(`player controls work with keyboard at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await mockFeed(page, fixture.origin, { mp4: true });
      await page.goto('/media?tab=feed');
      const player = page.locator('[data-feed-video="fixture-0"]');
      const video = player.locator('video');
      await expect(video).toHaveCount(1);
      const mute = player.getByRole('button', { name: 'Mute video', exact: true });
      await hitArea(mute);
      await mute.focus();
      await page.keyboard.press('Enter');
      await expect(video).toHaveJSProperty('muted', true);
      await expect(player.getByRole('button', { name: 'Unmute video' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      const play = player.getByRole('button', { name: 'Play video', exact: true }).last();
      await hitArea(play);
      await play.focus();
      await page.keyboard.press('Space');
      await expect(player.getByRole('button', { name: 'Pause video' })).toBeFocused();
      await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(0);
      await page.keyboard.press('Space');
      await expect(video).toHaveJSProperty('paused', true);
      const seek = player.getByRole('slider', { name: 'Seek video' });
      await hitArea(seek);
      await expect(seek).toBeEnabled();
      await seek.focus();
      const before = await video.evaluate((node) => node.currentTime);
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(before);
      await hitArea(player.getByRole('button', { name: 'Fullscreen video', exact: true }));
      await expect(player.locator('button:not([aria-label])')).toHaveCount(0);
    });
  }
});

test('Couch hero actions are single keyboard-focusable links', async ({ page }) => {
  const film = {
    _id: 'fixture-film',
    slug: 'fixture-film',
    title: 'Fixture film',
    thumbnails: { poster: '/fixture-missing-poster.jpg' },
  };
  await page.route('**/couch/featured', (route) => route.fulfill({ json: film }));
  await page.goto('/media?tab=couch');
  for (const name of ['Watch Now', 'More Info']) {
    const link = page.getByRole('link', { name, exact: true });
    await hitArea(link);
    await expect(link).toHaveAttribute('href', '/media/couch/fixture-film');
    await link.focus();
    await expect(link).toBeFocused();
  }
  await expect(page.locator('a button, button a')).toHaveCount(0);
});
