import { expect, test } from '@playwright/test';

const ollieUrl = '/trickipedia/snowboarding/ollie-snowboard';

test.describe('Trickipedia progression sidebar', () => {
  for (const theme of ['dark', 'light']) {
    test(`keeps progression cards readable in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem('theme', selectedTheme);
      }, theme);
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
