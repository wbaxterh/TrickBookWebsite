import { expect, test } from '@playwright/test';

test.use({ screenshot: 'on' });

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.route('https://api.thetrickbook.com/**', (route) =>
    route.fulfill({ json: { greeting: 'What are you learning next?' } }),
  );
});

for (const width of [1023, 1024, 1025, 1100, 1280, 1440]) {
  test(`header and Kaori close controls work at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 768 });
    await page.goto('/');
    const header = page.locator('.site-header');
    expect((await header.boundingBox()).height).toBeLessThan(100);
    await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible({
      visible: width < 1280,
    });
    await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Reply to Kaori', exact: true })
      .fill('Practice ollies');
    await page.getByRole('button', { name: 'Reply to Kaori', exact: true }).click();
    const gateScreenshot = testInfo.outputPath('kaori-account-gate.png');
    await page.screenshot({ path: gateScreenshot });
    await testInfo.attach('kaori-account-gate', {
      path: gateScreenshot,
      contentType: 'image/png',
    });
    await page.getByRole('button', { name: 'Close sign in', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Reply to Kaori' })).toHaveValue(
      'Practice ollies',
    );
    await page.getByRole('button', { name: 'Close Kaori chat', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Chat with Kaori' })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test.describe('phone navigation', () => {
  test.use({ isMobile: true, hasTouch: true });

  for (const viewport of [
    { width: 667, height: 375 },
    { width: 320, height: 568 },
  ]) {
    for (const target of ['Log in', 'Sign up free']) {
      test(`${target} is reachable at ${viewport.width}×${viewport.height}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).waitFor();
        const before = await page.evaluate(() => document.body.style.overflow);
        await page.getByRole('button', { name: 'Toggle navigation' }).click();
        await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
        const menu = page.locator('#site-nav');
        const layout = await menu.evaluate((element) => ({
          bottom: element.getBoundingClientRect().bottom,
          parents: [element, element.parentElement, element.parentElement.parentElement].map(
            (node) => ({
              className: node.className,
              rect: node.getBoundingClientRect().toJSON(),
              display: getComputedStyle(node).display,
              height: getComputedStyle(node).height,
              maxHeight: getComputedStyle(node).maxHeight,
              rows: getComputedStyle(node).gridTemplateRows,
              overflow: getComputedStyle(node).overflowY,
            }),
          ),
        }));
        expect(layout.bottom, JSON.stringify(layout)).toBeLessThanOrEqual(viewport.height);
        const action = menu.getByRole('link', { name: target, exact: true });
        await action.scrollIntoViewIfNeeded();
        await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeInViewport();
        await expect(action).toBeInViewport();
        const menuScreenshot = testInfo.outputPath('scrollable-menu-account-action.png');
        await page.screenshot({ path: menuScreenshot });
        await testInfo.attach('scrollable-menu-account-action', {
          path: menuScreenshot,
          contentType: 'image/png',
        });
        await action.click();
        await expect(page).toHaveURL(new RegExp(target === 'Log in' ? '/login$' : '/signup$'));
        await expect(page.getByRole('banner').getByTestId('nav-toggle')).toHaveAttribute(
          'aria-expanded',
          'false',
        );
        await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(before);
      });
    }
  }
});

test('Escape and resizing to desktop dismiss the menu and restore scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.site-header')).toHaveAttribute('data-expanded', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

for (const direction of ['ltr', 'rtl']) {
  test(`desktop navigation fits long labels at 1280px in ${direction}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('.site-nav-account')).toBeVisible();
    // Layout stress fixture, not a claim that locale routing/translations are implemented.
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
      document.querySelector('.site-header .login-btn span').textContent = 'Kostenlos registrieren';
      document.querySelector('.language-selector-label').textContent = 'Português (Brasil)';
    }, direction);
    const controls = await page
      .locator('.site-header a, .site-header button')
      .evaluateAll((nodes) =>
        nodes
          .filter((node) => node.getBoundingClientRect().width > 0)
          .map((node) => ({
            text: node.textContent,
            left: node.getBoundingClientRect().left,
            right: node.getBoundingClientRect().right,
          })),
      );
    for (const control of controls) {
      expect(control.left, control.text).toBeGreaterThanOrEqual(0);
      expect(control.right, control.text).toBeLessThanOrEqual(1280);
    }
    expect((await page.locator('.site-header').boundingBox()).height).toBeLessThan(100);
  });
}
