const { test, expect } = require('@playwright/test');

test('blog post renders with core accessibility hooks', async ({ page }) => {
  await page.goto('/blog/how-to-boardslide');

  await expect(page.getByRole('heading', { level: 1, name: /how to boardslide/i })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('article h1')).toHaveCount(0);

  const imageAlts = await page.locator('img').evaluateAll((images) =>
    images.map((image) => image.getAttribute('alt') || ''),
  );
  expect(imageAlts.length).toBeGreaterThan(0);
  expect(imageAlts.every((alt) => alt.trim().length > 0)).toBeTruthy();

  const tocLinks = page.locator('aside[aria-label="Table of contents"] a');
  await expect(tocLinks.first()).toBeVisible();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  const focusTarget = page.locator('article a').first();
  await focusTarget.focus();

  const focusStyles = await focusTarget.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      boxShadow: styles.boxShadow,
    };
  });

  expect(focusStyles.outlineStyle).not.toBe('none');
  expect(focusStyles.outlineWidth).not.toBe('0px');
  expect(focusStyles.boxShadow).not.toBe('none');

  await expect(page.getByRole('link', { name: /browse more posts/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /open trickbook/i })).toBeVisible();
});
