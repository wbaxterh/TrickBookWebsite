import { expect, test } from '@playwright/test';

const film = {
  _id: 'film-fixture',
  slug: 'radio-silence',
  title: 'Radio-Silence',
  releaseYear: 2021,
  sportTypes: ['skateboarding'],
};

test.use({ screenshot: 'on' });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/couch/videos')) {
      return route.fulfill({ json: url.searchParams.get('q') === 'Radio' ? [film] : [] });
    }
    if (url.pathname.endsWith('/couch/featured')) return route.fulfill({ json: null });
    if (url.pathname.endsWith('/couch/collections')) return route.fulfill({ json: [] });
    return route.fulfill({ json: { greeting: 'What are you learning next?' } });
  });
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport, isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
    test('search link, query, empty state and history work', async ({ page }, testInfo) => {
      await page.goto('/media?tab=couch');
      const search = page.getByRole('link', { name: 'Search films', exact: true });
      await expect(search.locator('button')).toHaveCount(0);
      await search.click();
      await expect(page).toHaveURL(/\/media\/search$/);
      await expect(page.getByRole('heading', { name: 'Search films', exact: true })).toBeVisible();
      const input = page.getByRole('searchbox', { name: 'Search The Couch', exact: true });
      expect(
        await input.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
      ).toBeGreaterThanOrEqual(16);
      await input.fill('Radio');
      await input.press('Enter');
      await expect(page).toHaveURL(/q=Radio/);
      await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /Radio-Silence/ })).toHaveAttribute(
        'href',
        '/media/couch/radio-silence',
      );
      const screenshot = testInfo.outputPath('media-search-results.png');
      await page.screenshot({ path: screenshot, fullPage: true });
      await testInfo.attach('media-search-results', { path: screenshot, contentType: 'image/png' });
      await input.fill('No matching film');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(page.getByRole('status')).toContainText('No films found');
      await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toHaveCount(
        0,
      );
      await page.goBack();
      await expect(input).toHaveValue('Radio');
      await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toBeVisible();
      await page.reload();
      await expect(input).toHaveValue('Radio');
      await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  });
}

test('loading, error and retry are distinct from no results', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let failed = false;
  await page.route('**/couch/videos?**', async (route) => {
    if (!failed) {
      await pending;
      failed = true;
      return route.fulfill({ status: 503, json: { error: 'Unavailable' } });
    }
    return route.fulfill({ json: [film] });
  });
  await page.goto('/media/search?q=Radio');
  await expect(page.getByRole('status')).toContainText('Searching films');
  release();
  await expect(
    page.getByRole('alert').filter({ hasText: 'We couldn’t load film results' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).not.toContainText('No films found');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toBeVisible();
});

test('pagination preserves the query and does not claim catalog-wide totals', async ({ page }) => {
  await page.route('**/couch/videos?**', (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('q')).toBe('Radio');
    expect(url.searchParams.get('limit')).toBe('24');
    const videos =
      url.searchParams.get('page') === '2'
        ? []
        : Array.from({ length: 24 }, (_, i) => ({
            ...film,
            _id: `film-${i}`,
            slug: `film-${i}`,
            title: `Radio film ${i}`,
          }));
    return route.fulfill({ json: videos });
  });
  await page.goto('/media/search?q=Radio');
  await expect(page.getByRole('status')).toContainText('24 films on page 1');
  await page.getByRole('link', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('status')).toContainText('No more films on this page');
  await page.getByRole('link', { name: 'Previous page' }).click();
  await expect(page.getByRole('status')).toContainText('24 films on page 1');
});

test('empty query does not fetch the catalog', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/couch/videos')) requests.push(request.url());
  });
  await page.goto('/media/search');
  await expect(page.getByRole('status')).toContainText('Enter a film title');
  await page.getByRole('searchbox').fill('   ');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Enter a film title');
  expect(requests).toEqual([]);
});

test('a slow older search cannot replace the latest query results', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/couch/videos?**', async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q');
    if (q === 'Old') await pending;
    await route
      .fulfill({ json: q === 'Old' ? [{ ...film, title: 'Old film' }] : [film] })
      .catch(() => {});
  });
  await page.goto('/media/search?q=Old');
  await expect(page.getByRole('status')).toContainText('Searching films');
  await page.getByRole('searchbox').fill('Radio');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Radio-Silence', exact: true })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: 'Old film', exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Results for “Radio”', exact: true }),
  ).toBeVisible();
});
