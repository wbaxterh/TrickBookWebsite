import { expect, test } from '@playwright/test';

const ollieUrl = '/trickipedia/snowboarding/ollie-snowboard';
const cab360Url = '/trickipedia/snowboarding/cab-360';

async function proxyProductionTrickipedia(page) {
  await page.route('**/api/trickipedia**', async (route) => {
    const response = await fetch(route.request().url());
    const body = Buffer.from(await response.arrayBuffer());
    await route.fulfill({
      status: response.status,
      body,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
        'access-control-allow-origin': '*',
      },
    });
  });
}

test.describe('Trickipedia progression sidebar', () => {
  for (const theme of ['dark', 'light']) {
    test(`keeps progression cards readable in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem('theme', selectedTheme);
      }, theme);
      await proxyProductionTrickipedia(page);
      await page.goto(ollieUrl);

      const sidebar = page.getByRole('complementary', { name: 'Your progression path' });
      await expect(sidebar).toBeVisible();

      const card = sidebar.getByRole('button').first();
      await expect(card).toBeVisible();
      await expect(card.getByRole('heading')).toHaveText(/Tail Press/);

      const colors = await card.evaluate((element) => {
        const cardStyle = getComputedStyle(element.closest('.MuiCard-root'));
        const headingStyle = getComputedStyle(element.querySelector('h3'));
        const reasonStyle = getComputedStyle(element.querySelector('p'));
        return {
          background: cardStyle.backgroundColor,
          heading: headingStyle.color,
          reason: reasonStyle.color,
        };
      });

      expect(colors.heading).not.toBe(colors.background);
      expect(colors.reason).not.toBe(colors.background);
    });
  }
});

test.describe('Trickipedia instructional detail visibility', () => {
  for (const theme of ['dark', 'light']) {
    test(`shows practical tips and readable supporting text in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem('theme', selectedTheme);
      }, theme);
      await proxyProductionTrickipedia(page);
      await page.goto(cab360Url);

      const tipsHeading = page.getByRole('heading', { name: 'Practical tips' });
      await expect(tipsHeading).toBeVisible();
      const tipsSection = tipsHeading.locator('..');
      await expect(tipsSection.locator('li')).toHaveCount(6);

      const mistakesHeading = page.getByRole('heading', { name: 'Common mistakes and fixes' });
      const mistakesSection = mistakesHeading.locator('..');
      await expect(mistakesSection.locator('.MuiListItemText-secondary')).toHaveCount(6);

      const textColors = await mistakesSection.evaluate((section) => {
        const secondary = section.querySelector('.MuiListItemText-secondary');
        const primary = section.querySelector('.MuiListItemText-primary');
        return {
          secondary: getComputedStyle(secondary).color,
          primary: getComputedStyle(primary).color,
          background: getComputedStyle(section).backgroundColor,
        };
      });
      expect(textColors.secondary).not.toBe(textColors.background);
      expect(textColors.secondary).not.toBe('rgba(0, 0, 0, 0)');
      expect(textColors.primary).not.toBe(textColors.background);

      const source = page.getByText(/^Source: FIS;/);
      await expect(source).toBeVisible();
      await expect(source).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    });
  }
});
