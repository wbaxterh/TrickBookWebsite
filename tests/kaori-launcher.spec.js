import { expect, test } from '@playwright/test';
import { mockFeed, startFeedFixture } from './helpers/feed-fixture';

let fixture;
test.use({ screenshot: 'on', isMobile: true, hasTouch: true });
test.beforeAll(async () => {
  fixture = await startFeedFixture();
});
test.afterAll(async () => {
  await fixture.close();
});
test.beforeEach(async ({ page }) => {
  await mockFeed(page, fixture.origin);
  await page.route('**/api/categories', (route) => route.fulfill({ json: [] }));
  // Exclude Next's dev-only build spinner from product hit tests; do not hide error overlays.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '#__next-build-watcher { display: none !important; }';
      document.head.append(style);
    });
  });
});

async function alignAtViewportBottom(locator) {
  await locator.evaluate((element) => {
    window.scrollBy({
      top: element.getBoundingClientRect().bottom - (innerHeight - 24),
      behavior: 'instant',
    });
  });
}

async function expectUncovered(locator) {
  const hits = await locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return [0.1, 0.5, 0.9].map((fraction) => {
      const hit = document.elementFromPoint(
        box.left + box.width * fraction,
        box.top + box.height / 2,
      );
      return {
        reachable: hit === element || element.contains(hit),
        intercepting: hit?.getAttribute('aria-label') || hit?.className || hit?.tagName,
      };
    });
  });
  expect(hits, JSON.stringify(hits)).toEqual(hits.map((hit) => ({ ...hit, reachable: true })));
  const box = await locator.boundingBox();
  await locator.click({ trial: true, position: { x: box.width * 0.9, y: box.height / 2 } });
}

for (const width of [320, 390]) {
  test(`contact action is not covered at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).waitFor();
    const back = page.getByRole('link', { name: 'Back to Home', exact: true });
    await alignAtViewportBottom(back);
    await testInfo.attach('contact-action-hit-target', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await expectUncovered(back);
  });
}

test('Feed seek control is not covered by closed chat', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/media?tab=feed');
  const seek = page.locator('[data-feed-video="fixture-0"] .group\\/progress');
  await expect(seek).toBeAttached();
  await alignAtViewportBottom(seek);
  await testInfo.attach('feed-seek-hit-target', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await expectUncovered(seek);
});

test('compact header entry opens chat and restores focus without losing a form draft', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/contact');
  const name = page.getByRole('textbox', { name: 'Your Name', exact: true });
  await name.fill('Fixture rider');
  const launcher = page.getByRole('button', { name: 'Chat with Kaori', exact: true });
  await expect(launcher).toHaveAttribute('data-kaori-launcher', 'header');
  await expect(launcher).toBeInViewport({ ratio: 1 });
  const box = await launcher.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await launcher.click();
  const chat = page.getByRole('region', { name: 'Chat with Kaori', exact: true });
  await expect(chat.getByRole('button', { name: 'Close Kaori chat' })).toBeFocused();
  await chat.getByRole('button', { name: 'Close Kaori chat' }).click();
  await expect(launcher).toBeFocused();
  await expect(name).toHaveValue('Fixture rider');
  const back = page.getByRole('link', { name: 'Back to Home', exact: true });
  await alignAtViewportBottom(back);
  await expectUncovered(back);
});

test('TrickBook cards stay reachable with the greeting shown and dismissed', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/trickipedia**', (route) =>
    route.fulfill({
      json: Array.from({ length: 8 }, (_, index) => ({
        _id: `trick-${index}`,
        url: `fixture-${index}`,
        name: `Fixture trick ${index}`,
        category: 'Skateboarding',
        difficulty: 'Beginner',
        description: 'A synthetic progression card.',
      })),
    }),
  );
  await page.goto('/trickbook');
  const card = page.getByRole('link').filter({ hasText: 'Fixture trick 7' });
  await expect(card).toBeAttached();
  const preview = page.getByRole('button', { name: 'Open Kaori greeting' });
  await expect(preview).toBeVisible({ timeout: 10000 });
  await alignAtViewportBottom(card);
  await expectUncovered(card);
  const dismiss = page.getByRole('button', { name: 'Dismiss Kaori greeting' });
  await dismiss.click();
  await expect(preview).toHaveCount(0);
  await alignAtViewportBottom(card);
  await expectUncovered(card);
  await testInfo.attach('trick-card-uncovered', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});

test('greeting dismissal survives navigation, reload and opening chat', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const dismiss = page.getByRole('button', { name: 'Dismiss Kaori greeting' });
  await expect(dismiss).toBeVisible({ timeout: 10000 });
  await dismiss.click();
  await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).click();
  await page.getByRole('button', { name: 'Close Kaori chat' }).click();
  await expect(dismiss).toHaveCount(0);
  await page.getByRole('link', { name: 'Trick Book', exact: true }).first().click();
  await page.reload();
  await page.clock.install();
  await page.clock.runFor(4000);
  await expect(dismiss).toHaveCount(0);
});

for (const route of ['/contact', '/media?tab=feed', '/login']) {
  test(`greeting stays suppressed on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install();
    await page.goto(route);
    await expect(page.getByRole('button', { name: 'Chat with Kaori', exact: true })).toBeVisible();
    await page.clock.runFor(4000);
    await expect(page.getByRole('button', { name: 'Open Kaori greeting' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Dismiss Kaori greeting' })).toHaveCount(0);
  });
}

test.describe('desktop footer entry', () => {
  test.use({ isMobile: false, hasTouch: false, viewport: { width: 1440, height: 900 } });
  test('closed launcher and greeting occupy page space rather than covering it', async ({
    page,
  }) => {
    await page.goto('/');
    const launcher = page.getByRole('button', { name: 'Chat with Kaori from footer', exact: true });
    const root = page.locator('[data-kaori-widget]');
    await expect(root).toHaveCSS('position', 'relative');
    await expect(page.getByRole('button', { name: 'Open Kaori greeting' })).toBeVisible({
      timeout: 10000,
    });
    const footer = await page.locator('footer').last().boundingBox();
    const dock = await root.boundingBox();
    expect(dock.y).toBeGreaterThanOrEqual(footer.y + footer.height - 1);
    await launcher.click();
    await page.getByRole('button', { name: 'Close Kaori chat' }).click();
    await expect(launcher).toBeFocused();
    await expect(launcher).toBeInViewport({ ratio: 1 });
    await expect(root).toHaveCSS('position', 'relative');
  });
});

test('opening Kaori from the expanded menu restores page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const launcher = page.getByRole('button', { name: 'Chat with Kaori', exact: true });
  await launcher.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Close Kaori chat' }).click();
  await expect(launcher).toBeFocused();
});

test('promotion stays out of an active form on an otherwise eligible page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const preview = page.getByRole('button', { name: 'Open Kaori greeting' });
  await expect(preview).toBeVisible({ timeout: 10000 });
  // Synthetic form isolates focus suppression without sending any real form data.
  await page.evaluate(() => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Fixture form input');
    form.append(input);
    document.querySelector('main').append(form);
    input.focus();
  });
  await expect(preview).toHaveCount(0);
  await page
    .getByRole('textbox', { name: 'Fixture form input' })
    .evaluate((element) => element.blur());
  await expect(preview).toBeVisible();
});

test('greeting dismissal works when session storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'tb_kaori_preview_dismissed') throw new Error('Fixture storage restriction');
      return originalGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'tb_kaori_preview_dismissed') throw new Error('Fixture storage restriction');
      return originalSet.call(this, key, value);
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const dismiss = page.getByRole('button', { name: 'Dismiss Kaori greeting' });
  await expect(dismiss).toBeVisible({ timeout: 10000 });
  await dismiss.click();
  await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).click();
  await page.getByRole('button', { name: 'Close Kaori chat' }).click();
  await expect(dismiss).toHaveCount(0);
});
