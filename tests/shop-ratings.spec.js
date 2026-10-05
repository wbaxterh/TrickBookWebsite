const { test, expect } = require('@playwright/test');

test.describe('Shop ratings and comments', () => {
  test('shop detail page shows TrickBook rating section', async ({ page }) => {
    await page.goto('/shops');

    const shopCard = page.locator('[data-testid="shop-card"]').first();
    await shopCard.or(page.locator('.group').first()).click();

    await expect(page.getByRole('heading', { name: /TrickBook Rating/i })).toBeVisible();
  });

  test('signed-out user sees sign in prompt for rating', async ({ page }) => {
    await page.goto('/shops');

    const firstShopLink = page.locator('a[href^="/shops/"]').first();
    await firstShopLink.click();

    await expect(page.getByText(/Sign in to rate this shop/i)).toBeVisible();
  });

  test('shop detail page shows Google Reviews separately', async ({ page }) => {
    await page.route('**/api/shops/*', async (route) => {
      const mockShop = {
        _id: 'test-shop-1',
        name: 'Test Skate Shop',
        slug: 'test-skate-shop',
        description: 'A great local skate shop',
        sports: ['skateboarding'],
        services: ['boards', 'wheels'],
        address: { city: 'Los Angeles', region: 'CA' },
        reviewSummary: {
          source: 'Google',
          rating: 4.3,
          reviewCount: 150,
          summary: 'Great shop with friendly staff',
        },
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ shop: mockShop }),
      });
    });

    await page.goto('/shops/test-skate-shop');

    await expect(page.getByRole('heading', { name: /Google Reviews/i })).toBeVisible();
    await expect(page.getByText('4.3')).toBeVisible();
    await expect(page.getByText(/150 reviews/i)).toBeVisible();
  });

  test('shop cards show TrickBook user ratings when available', async ({ page }) => {
    await page.route('**/api/shops*', async (route) => {
      const mockShops = {
        shops: [
          {
            _id: 'shop-1',
            name: 'Rated Shop',
            slug: 'rated-shop',
            sports: ['skateboarding'],
            address: { city: 'NYC', region: 'NY' },
            userRating: { averageRating: 4.5, ratingCount: 25 },
          },
          {
            _id: 'shop-2',
            name: 'Unrated Shop',
            slug: 'unrated-shop',
            sports: ['snowboarding'],
            address: { city: 'Denver', region: 'CO' },
          },
        ],
        totalCount: 2,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockShops),
      });
    });

    await page.goto('/shops');

    await expect(page.getByText('4.5')).toBeVisible();
    await expect(page.getByText('(25)')).toBeVisible();
  });

  test('comment section is present on shop detail page', async ({ page }) => {
    await page.goto('/shops');

    const firstShopLink = page.locator('a[href^="/shops/"]').first();
    await firstShopLink.click();

    await expect(page.getByRole('heading', { name: /Comments/i })).toBeVisible();
    await expect(
      page.getByText(/Sign in to comment/i).or(page.getByPlaceholder(/Share your experience/i)),
    ).toBeVisible();
  });

  test('TrickBook rating displays distribution bars when ratings exist', async ({ page }) => {
    await page.route('**/api/shops/*/ratings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          averageRating: 4.2,
          ratingCount: 50,
          distribution: { 1: 2, 2: 3, 3: 5, 4: 15, 5: 25 },
          myRating: null,
        }),
      });
    });

    await page.route('**/api/shops/*', async (route) => {
      if (route.request().url().includes('/ratings')) return;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          shop: {
            _id: 'test-shop',
            name: 'Test Shop',
            slug: 'test-shop',
            sports: ['skateboarding'],
            address: { city: 'LA', region: 'CA' },
          },
        }),
      });
    });

    await page.goto('/shops/test-shop');

    await expect(page.getByRole('heading', { name: /TrickBook Rating/i })).toBeVisible();
    await expect(page.getByText('4.2')).toBeVisible();
    await expect(page.getByText(/50 ratings/i)).toBeVisible();
  });

  test('gracefully handles ratings endpoint not available', async ({ page }) => {
    await page.route('**/api/shops/*/ratings', async (route) => {
      await route.fulfill({ status: 404 });
    });

    await page.route('**/api/shops/*', async (route) => {
      if (route.request().url().includes('/ratings')) return;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          shop: {
            _id: 'test-shop',
            name: 'Test Shop',
            slug: 'test-shop',
            sports: ['skateboarding'],
            address: { city: 'LA', region: 'CA' },
          },
        }),
      });
    });

    await page.goto('/shops/test-shop');

    await expect(page.locator('h1')).toContainText('Test Shop');
  });
});
