import { expect, test } from '@playwright/test';

test('shows provider-specific recovery and forgot-password fallback', async ({ page }) => {
  await page.goto('/login?error=provider_mismatch&provider=apple');
  await expect(
    page.getByRole('alert').filter({ hasText: 'This account was created using' }),
  ).toContainText('This account was created using Sign in with Apple.');
  await expect(page.getByRole('link', { name: /reset your password/i })).toHaveAttribute(
    'href',
    '/forgot-password',
  );
});

test('shows a safe recovery fallback when the provider is unknown', async ({ page }) => {
  await page.goto('/login?error=provider_mismatch');
  await expect(
    page.getByRole('alert').filter({ hasText: 'We could not confirm' }),
  ).toContainText('We could not confirm how this account was created.');
});
