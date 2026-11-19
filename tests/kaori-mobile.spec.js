import { expect, test } from '@playwright/test';

test.use({ screenshot: 'on' });

const draft = 'Help me practice my ollie';
const greeting = 'Start with a steady stance, a clean pop, and a controlled landing. '.repeat(30);

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/dm/bots')) {
      return route.fulfill({
        json: [
          { _id: 'kaori-fixture', name: 'Kaori', existingConversationId: 'fixture-conversation' },
        ],
      });
    }
    if (url.pathname.endsWith('/kaori/usage')) {
      return route.fulfill({ json: { text: { used: 0, remaining: 10 }, voice: { remaining: 2 } } });
    }
    if (url.pathname.endsWith('/messages')) {
      return route.fulfill({
        json: {
          messages: [{ _id: 'message-fixture', senderId: 'kaori-fixture', content: greeting }],
        },
      });
    }
    return route.fulfill({ json: { greeting } });
  });
});

async function openGuestChat(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).click();
  const chat = page.getByRole('region', { name: 'Chat with Kaori', exact: true });
  await expect(chat.getByRole('textbox', { name: 'Reply to Kaori', exact: true })).toBeVisible();
  return chat;
}

async function openGate(page) {
  const chat = await openGuestChat(page);
  await chat.getByRole('textbox', { name: 'Reply to Kaori', exact: true }).fill(draft);
  await chat.getByRole('button', { name: 'Reply to Kaori', exact: true }).click();
  const gate = page.getByRole('dialog', { name: 'Save your line and ride with me' });
  await expect(gate).toBeVisible();
  return gate;
}

const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
  { width: 320, height: 300 },
  { width: 390, height: 300 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test.describe(`${viewport.width}×${viewport.height}`, () => {
    test.use({ isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
    test(`chat and all sign-in controls fit at ${viewport.width}×${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      const chat = await openGuestChat(page);
      const input = chat.getByRole('textbox', { name: 'Reply to Kaori', exact: true });
      await expect(input).toBeInViewport({ ratio: 1 });
      await expect(input).toHaveCSS('font-size', '16px');
      for (const control of [
        chat.getByRole('button', { name: 'Close Kaori chat' }),
        chat.getByRole('button', { name: 'Reply to Kaori', exact: true }),
      ]) {
        const box = await control.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await input.fill(draft);
      const reply = chat.getByRole('button', { name: 'Reply to Kaori', exact: true });
      await reply.click();
      const gate = page.getByRole('dialog', { name: 'Save your line and ride with me' });
      await expect(gate.getByRole('button', { name: 'Close sign in' })).toBeFocused();
      for (const name of ['Continue with Google', 'Continue with Apple', 'Use email instead']) {
        const control = gate.getByRole('button', { name, exact: true });
        await control.evaluate((element) =>
          element.scrollIntoView({ block: 'center', behavior: 'instant' }),
        );
        await expect(control).toBeInViewport({ ratio: 1 });
        await control.click({ trial: true });
        expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      const screenshot = testInfo.outputPath('kaori-sign-in-controls.png');
      await page.screenshot({ path: screenshot });
      await testInfo.attach('kaori-sign-in-controls', {
        path: screenshot,
        contentType: 'image/png',
      });
      await gate.getByRole('button', { name: 'Close sign in' }).click();
      await expect(gate).toHaveCount(0);
      await expect(input).toHaveValue(draft);
      await expect(reply).toBeFocused();
      await chat.getByRole('button', { name: 'Close Kaori chat' }).click();
      await expect(
        page.getByRole('button', { name: 'Chat with Kaori', exact: true }),
      ).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  });
}

test('sign-in traps focus and Escape closes only the top layer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const gate = await openGate(page);
  const close = gate.getByRole('button', { name: 'Close sign in' });
  await expect(close).toBeFocused();
  await expect(page.getByRole('banner')).toHaveCount(0);
  await page.keyboard.press('Shift+Tab');
  await expect(gate.getByRole('button', { name: 'Use email instead' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  for (const name of [
    'Continue with Google',
    'Continue with Apple',
    'Use email instead',
    'Close sign in',
  ]) {
    await page.keyboard.press('Tab');
    await expect(gate.getByRole('button', { name, exact: true })).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(gate).toHaveCount(0);
  const chat = page.getByRole('region', { name: 'Chat with Kaori', exact: true });
  await expect(chat).toBeVisible();
  await expect(chat.getByRole('button', { name: 'Reply to Kaori', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(chat).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Chat with Kaori', exact: true })).toBeFocused();
});

test('email handoff closes the overlay and retains the pending draft', async ({ page }) => {
  const gate = await openGate(page);
  await gate.getByRole('button', { name: 'Use email instead' }).click();
  await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Chat with Kaori', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('tb_kaori_widget_pending_draft'))).toBe(
    draft,
  );
});

test('draft and composer survive short-height resizing and rotation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const chat = await openGuestChat(page);
  const input = chat.getByRole('textbox', { name: 'Reply to Kaori', exact: true });
  await input.fill(draft);
  for (const viewport of [viewports[5], viewports[3], viewports[1]]) {
    await page.setViewportSize(viewport);
    await expect(input).toHaveValue(draft);
    await expect(input).toBeInViewport({ ratio: 1 });
    await expect(chat.getByRole('button', { name: 'Close Kaori chat' })).toBeInViewport({
      ratio: 1,
    });
  }
});

test('sheet and portal follow a simulated visual viewport resize and offset', async ({ page }) => {
  // Explicit simulation: this does not certify a physical software keyboard.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: Object.assign(new EventTarget(), { height: 844, offsetTop: 0 }),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const gate = await openGate(page);
  await page.evaluate(() => {
    window.visualViewport.height = 300;
    window.visualViewport.offsetTop = 120;
    window.visualViewport.dispatchEvent(new Event('resize'));
  });
  await expect(gate).toHaveCSS('height', '284px');
  await expect.poll(async () => (await gate.boundingBox()).y).toBe(128);
  await gate.getByRole('button', { name: 'Close sign in' }).click();
  const chat = page.getByRole('region', { name: 'Chat with Kaori', exact: true });
  await expect(chat).toHaveCSS('height', '284px');
  await expect.poll(async () => (await chat.boundingBox()).y).toBe(128);
  await page.evaluate(() => {
    window.visualViewport.offsetTop = 90;
    window.visualViewport.dispatchEvent(new Event('scroll'));
  });
  await expect.poll(async () => (await chat.boundingBox()).y).toBe(98);
});

for (const exhausted of [false, true]) {
  test(`authenticated UI keeps its composer reachable with exhausted=${exhausted}`, async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 390, height: 300 });
    // Synthetic UI-only cookie; all API and socket traffic is intercepted above.
    const payload = Buffer.from(
      JSON.stringify({ userId: 'rider-fixture', name: 'Test Rider' }),
    ).toString('base64url');
    await page
      .context()
      .addCookies([{ name: 'token', value: `e30.${payload}.fixture`, url: baseURL }]);
    if (exhausted) {
      await page.route('**/companion/kaori/usage', (route) =>
        route.fulfill({
          json: { text: { remaining: 0 }, voice: { remaining: 0 }, upgradeRequired: true },
        }),
      );
    }
    await page.goto('/');
    await page.getByRole('button', { name: 'Chat with Kaori', exact: true }).click();
    const chat = page.getByRole('region', { name: 'Chat with Kaori', exact: true });
    const input = chat.getByRole('textbox', { name: 'Message Kaori', exact: true });
    if (exhausted) {
      await expect(chat.getByRole('button', { name: 'Upgrade', exact: true })).toBeVisible();
      await expect(input).toBeDisabled();
    } else {
      await expect(input).toBeEnabled();
    }
    await expect(input).toBeInViewport({ ratio: 1 });
    await expect(input).toHaveCSS('font-size', '16px');
    await expect(chat.getByRole('button', { name: 'Close Kaori chat' })).toBeInViewport({
      ratio: 1,
    });
  });
}
