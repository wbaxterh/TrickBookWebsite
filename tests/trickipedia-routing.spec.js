import { expect, test } from '@playwright/test';

const ollie = {
  _id: '69b0178d85c262b2945c37c2',
  name: 'Ollie',
  url: 'ollie',
  category: 'Skateboarding',
  difficulty: 'Beginner',
  description: 'Pop the board and level out before landing.',
  steps: ['Pop the tail.', 'Slide your front foot.', 'Land over the bolts.'],
};
const acidGrind = {
  ...ollie,
  _id: '69b017a885c262b2945c37f8',
  name: 'Acid Grind',
  url: 'acid-grind',
  category: 'Inline Skating',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/trickipedia**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/network')) {
      await route.fulfill({ json: { foundations: [], nextSteps: [], related: [] } });
      return;
    }
    const skip = Number(url.searchParams.get('skip') || 0);
    const firstPage = Array.from({ length: 250 }, (_, index) => ({
      ...ollie,
      _id: `early-${index}`,
      name: `Early trick ${index}`,
      url: `early-trick-${index}`,
    }));
    await route.fulfill({ json: skip === 0 ? firstPage : [ollie, acidGrind] });
  });
});

for (const slug of ['ollie', ollie._id]) {
  test(`loads a trick beyond the first API page via ${slug}`, async ({ page }) => {
    await page.goto(`/trickipedia/skateboarding/${slug}`);
    await expect(page.getByRole('heading', { name: 'Ollie', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to TrickList' })).toBeVisible();
    await expect(page.getByText('This trick could not be found.')).toHaveCount(0);
  });
}

for (const category of ['inline-skating', 'inline%20skating']) {
  test(`resolves ${category} category URLs`, async ({ page }) => {
    await page.goto(`/trickipedia/${category}/acid-grind`);
    await expect(page.getByRole('heading', { name: 'Acid Grind', exact: true })).toBeVisible();
    await expect(page.getByText('Inline Skating', { exact: true })).toBeVisible();
  });
}
