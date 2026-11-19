import { expect, test } from '@playwright/test';

const image =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%2364748b"/%3E%3C/svg%3E';
const events = [
  {
    _id: 'near',
    title: 'Fixture near event',
    slug: 'fixture-near-event',
    sports: ['skateboarding'],
    intents: ['compete'],
    startAt: new Date(Date.now() + 86400000).toISOString(),
    image,
    venue: { city: 'San Diego', lat: 32.72, lng: -117.16 },
    participation: { registrationStatus: 'open' },
  },
  {
    _id: 'far',
    title: 'Fixture far event',
    slug: 'fixture-far-event',
    sports: ['snowboarding'],
    intents: ['spectate_online'],
    startAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    image,
    venue: { city: 'Denver', lat: 39.74, lng: -104.99 },
    participation: { registrationStatus: 'closed' },
  },
];
const shops = [
  {
    _id: 'near',
    name: 'Fixture near shop',
    slug: 'fixture-near-shop',
    sports: ['skateboarding'],
    services: ['repairs'],
    imageUrl: image,
    address: { city: 'San Diego', lat: 32.72, lng: -117.16 },
  },
  {
    _id: 'far',
    name: 'Fixture far shop',
    slug: 'fixture-far-shop',
    sports: ['snowboarding'],
    services: ['rentals'],
    imageUrl: image,
    address: { city: 'Denver', lat: 39.74, lng: -104.99 },
  },
];

test.use({ screenshot: 'on' });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  await page.routeWebSocket(/api\.thetrickbook\.com/, (socket) => socket.close());
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/events')) {
      const p = url.searchParams;
      const filtered = events.filter(
        (event) =>
          (!p.get('q') || event.title.toLowerCase().includes(p.get('q').toLowerCase())) &&
          (!p.get('sport') || event.sports.includes(p.get('sport'))) &&
          (!p.get('location') ||
            event.venue.city.toLowerCase().includes(p.get('location').toLowerCase())) &&
          (!p.get('intent') || event.intents.includes(p.get('intent'))) &&
          (!p.get('registration') ||
            event.participation.registrationStatus === p.get('registration')) &&
          (!p.get('date') || event._id === 'near'),
      );
      return route.fulfill({ json: { events: filtered, totalCount: filtered.length } });
    }
    if (url.pathname.endsWith('/shops')) return route.fulfill({ json: { shops } });
    return route.fulfill({ json: { greeting: 'What are you learning next?' } });
  });
});

for (const kind of ['events', 'shops']) {
  test(`${kind}: first result title is visible on the initial phone screen`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${kind}`);
    const title = page.getByRole('heading', {
      name: `Fixture near ${kind === 'events' ? 'event' : 'shop'}`,
      exact: true,
    });
    await expect(title).toBeVisible();
    const titleBox = await title.boundingBox();
    const preview = await page
      .getByRole('link', {
        name: `View Fixture near ${kind === 'events' ? 'event' : 'shop'}`,
        exact: true,
      })
      .boundingBox();
    await testInfo.attach('initial-result-measurements', {
      body: Buffer.from(
        JSON.stringify({
          title: titleBox,
          preview,
          scrollToTitle: Math.max(0, titleBox.y + titleBox.height - 844),
        }),
      ),
      contentType: 'application/json',
    });
    await testInfo.attach('initial-viewport', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    expect(titleBox.y + titleBox.height).toBeLessThanOrEqual(844);
  });
}

for (const kind of ['events', 'shops']) {
  const isEvents = kind === 'events';
  test(`${kind}: mobile disclosure retains selections, supports keyboard and resets all criteria`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${kind}`);
    const more = page.getByRole('button', { name: 'Filters (0)', exact: true });
    const location = page.getByRole('textbox', { name: 'Location', exact: true });
    await expect(location).toBeHidden();
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(location).toBeVisible();
    await location.fill('San Diego');
    await page.getByRole('combobox', { name: 'Distance', exact: true }).selectOption('25');
    await page.getByRole('combobox', { name: 'Sport', exact: true }).selectOption('skateboarding');
    await page
      .getByRole('textbox', { name: isEvents ? 'Search events' : 'Search shops' })
      .fill('Fixture');
    if (isEvents) {
      await page.getByRole('combobox', { name: 'Event date' }).selectOption('month');
      await page.getByRole('combobox', { name: 'Event intent' }).selectOption('compete');
      await page.getByRole('checkbox', { name: 'Entry open' }).check();
    } else {
      await page.getByRole('combobox', { name: 'Shop service' }).selectOption('repairs');
    }
    const count = isEvents ? 5 : 3;
    const toggle = page.getByRole('button', { name: `Filters (${count})`, exact: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const near = page.getByRole('heading', {
      name: `Fixture near ${isEvents ? 'event' : 'shop'}`,
      exact: true,
    });
    await expect(near).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: `Fixture far ${isEvents ? 'event' : 'shop'}`,
        exact: true,
      }),
    ).toHaveCount(0);
    await location.focus();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(location).toBeHidden();
    await toggle.click();
    await expect(location).toHaveValue('San Diego');
    await expect(page.getByRole('combobox', { name: 'Distance', exact: true })).toHaveValue('25');
    if (isEvents) {
      await expect(page.getByRole('checkbox', { name: 'Entry open' })).toBeChecked();
      await expect(page.getByRole('combobox', { name: 'Event date' })).toHaveValue('month');
      await expect(page.getByRole('combobox', { name: 'Event intent' })).toHaveValue('compete');
    } else {
      await expect(page.getByRole('combobox', { name: 'Shop service' })).toHaveValue('repairs');
    }
    await expect
      .poll(() =>
        page.evaluate(
          (endpoint) =>
            performance
              .getEntriesByType('resource')
              .filter((entry) => entry.name.includes(`/api/${endpoint}?`))
              .map((entry) => new URL(entry.name).searchParams.toString())
              .some(
                (params) =>
                  params.includes('location=San+Diego') &&
                  params.includes('sport=skateboarding') &&
                  (endpoint === 'events'
                    ? params.includes('date=month') &&
                      params.includes('intent=compete') &&
                      params.includes('registration=open')
                    : params.includes('service=repairs')) &&
                  !params.includes('radius='),
              ),
          kind,
        ),
      )
      .toBe(true);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Filters (0)', exact: true })).toBeFocused();
    await expect(location).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Distance', exact: true })).toHaveValue('100');
    await expect(page.getByRole('combobox', { name: 'Sport', exact: true })).toHaveValue('all');
    await expect(
      page.getByRole('textbox', { name: isEvents ? 'Search events' : 'Search shops' }),
    ).toHaveValue('');
    if (isEvents) {
      await expect(page.getByRole('combobox', { name: 'Event date' })).toHaveValue('all');
      await expect(page.getByRole('combobox', { name: 'Event intent' })).toHaveValue('all');
      await expect(page.getByRole('checkbox', { name: 'Entry open' })).not.toBeChecked();
    } else {
      await expect(page.getByRole('combobox', { name: 'Shop service' })).toHaveValue('all');
    }
    await expect(
      page.getByRole('heading', {
        name: `Fixture far ${isEvents ? 'event' : 'shop'}`,
        exact: true,
      }),
    ).toBeVisible();
  });

  test(`${kind}: distance stays client-side and location can be cleared`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 32.72, longitude: -117.16 });
    await page.setViewportSize({ width: 390, height: 844 });
    const requests = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith(`/api/${kind}`)) requests.push(url);
    });
    await page.goto(`/${kind}`);
    const far = page.getByRole('heading', {
      name: `Fixture far ${isEvents ? 'event' : 'shop'}`,
      exact: true,
    });
    await expect(far).toBeVisible();
    await page.getByRole('button', { name: 'Filters (0)', exact: true }).click();
    await page.getByRole('combobox', { name: 'Distance', exact: true }).selectOption('25');
    await expect(page.getByRole('button', { name: 'Filters (1)', exact: true })).toBeVisible();
    await expect(far).toBeVisible();
    await page.getByRole('button', { name: 'Filters (1)', exact: true }).click();
    await page.getByRole('button', { name: 'Use my location', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Clear location' })).toBeVisible();
    await expect(far).toHaveCount(0);
    if (isEvents) {
      await page.getByRole('button', { name: /^All events/ }).click();
      await expect(far).toBeVisible();
      await expect(page.getByText('Showing 2 of 2 events')).toBeVisible();
      await page.getByRole('button', { name: 'For you', exact: true }).click();
      await expect(far).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'Clear location' }).click();
    await expect(far).toBeVisible();
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((url) => !url.searchParams.has('radius'))).toBe(true);
  });

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 667, height: 375 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    test(`${kind}: controls fit at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${kind}`);
      await expect(
        page.getByRole('textbox', { name: isEvents ? 'Search events' : 'Search shops' }),
      ).toBeVisible();
      const toggle = page.getByRole('button', { name: 'Filters (0)', exact: true });
      if (viewport.width < 768) {
        await toggle.click();
      } else {
        await expect(toggle).toBeHidden();
      }
      await expect(page.getByRole('textbox', { name: 'Location', exact: true })).toBeVisible();
      const distance = page.getByRole('combobox', { name: 'Distance', exact: true });
      await distance.selectOption('50');
      await expect(distance).toHaveValue('50');
      await page.getByRole('button', { name: 'Reset', exact: true }).click();
      await expect(distance).toHaveValue('100');
      if (viewport.width >= 768) {
        await expect(
          page.getByRole('textbox', { name: isEvents ? 'Search events' : 'Search shops' }),
        ).toBeFocused();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  }
}

test('radius-only empty Events results have a working clear-filters state', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('trickbook:user-coords', JSON.stringify({ lat: 0, lng: 0 }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/events');
  await page.getByRole('button', { name: 'Filters (0)', exact: true }).click();
  await page.getByRole('combobox', { name: 'Distance', exact: true }).selectOption('25');
  await expect(page.getByRole('heading', { name: 'No events match these filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Distance', exact: true })).toHaveValue('100');
  await expect(page.getByRole('button', { name: 'Filters (0)', exact: true })).toBeVisible();
});
