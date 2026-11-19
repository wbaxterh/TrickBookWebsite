const { expect, test } = require('@playwright/test');

const spotsUrl = `${process.env.SPOTS_E2E_BASE_URL || 'http://127.0.0.1:3000'}/spots`;

test('spots map loads spatial data without downloading the global catalog', async ({ page }) => {
  const spotRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/spots')) spotRequests.push(request.url());
  });

  await page.goto(spotsUrl);
  await expect(page.getByRole('heading', { name: 'Spots' })).toBeVisible();
  await expect(page.getByText('Explore the visible area')).toBeVisible();
  await expect(page.getByText(/areas - zoom in for spots|spots in this area/)).toBeVisible({
    timeout: 20_000,
  });

  expect(spotRequests.some((url) => url.includes('/map-pins?'))).toBe(true);
  expect(spotRequests.some((url) => url.includes('limit=5000'))).toBe(false);
  const mapRequest = new URL(spotRequests.find((url) => url.includes('/map-pins?')));
  for (const parameter of ['v', 'minLat', 'maxLat', 'minLng', 'maxLng', 'zoom']) {
    expect(mapRequest.searchParams.has(parameter)).toBe(true);
  }
});

test('list data is lazy and map filters are sent to the spatial endpoint', async ({ page }) => {
  const spotRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/spots')) spotRequests.push(request.url());
  });

  await page.goto(spotsUrl);
  await expect(page.getByText(/areas - zoom in for spots|spots in this area/)).toBeVisible({
    timeout: 20_000,
  });
  expect(spotRequests.some((url) => url.includes('limit=5000'))).toBe(false);

  await page.getByRole('button', { name: 'List' }).click();
  await expect.poll(() => spotRequests.some((url) => url.includes('/browse-summary'))).toBe(true);
  expect(spotRequests.some((url) => url.includes('limit=5000'))).toBe(false);
});
