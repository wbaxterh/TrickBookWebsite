import { expect, test } from '@playwright/test';

test.use({ screenshot: 'on' });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) =>
    route.fulfill({ json: { greeting: 'What are you learning next?' } }),
  );
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]) {
  test(`unavailable page provides honest, usable alternatives at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const response = await page.goto('/chrome-extension');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle('Chrome Extension — Currently Unavailable | TrickBook');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Currently unavailable' })).toBeVisible();
    await expect(page.getByText(/not available to download or install/)).toBeVisible();
    await expect(page.getByText(/No extension needed/)).toBeVisible();
    await expect(
      page.locator('a[download], a[href*="chromewebstore"], a[href$=".zip"]'),
    ).toHaveCount(0);
    const section = page.getByRole('region', { name: 'Currently unavailable' });
    const browse = section.getByRole('link', { name: 'Browse spots' });
    const add = section.getByRole('link', { name: 'Add a spot' });
    await expect(browse).toHaveAttribute('href', '/spots');
    await expect(add).toHaveAttribute('href', '/spots/add');
    for (const action of [browse, add]) {
      expect((await action.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await expect(action.locator('button')).toHaveCount(0);
      await action.focus();
      await expect(action).toBeFocused();
      await action.click({ trial: true });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Currently unavailable' })).toBeVisible();
  });
}

test('add-a-spot alternative preserves the existing guest sign-in flow', async ({ page }) => {
  await page.goto('/chrome-extension');
  await page
    .getByRole('region', { name: 'Currently unavailable' })
    .getByRole('link', { name: 'Add a spot' })
    .click();
  await expect(page).toHaveURL(/\/login\?redirect=(?:%2F|\/)spots(?:%2F|\/)add$/);
});
