import { expect, test } from '@playwright/test';

const fixtureStats = {
  campaignId: 'fixture-member',
  subject: 'Fresh films + 50 replies on me — Kaori',
  campaignStatus: 'submitted',
  audienceTarget: 393,
  skippedAtDispatch: 0,
  accepted: 393,
  estimatedUniqueOpens: 120,
  estimatedUniqueClickers: 30,
  estimatedOpenRate: 120 / 393,
  estimatedClickRate: 30 / 393,
  unsubscribeRecipients: 2,
  totalOpenHits: 200,
  observedProxyOpenHits: 80,
  totalClickHits: 45,
  submissions: { accepted: 393, prepared: 0, sending: 0, unknown: 0, suppressed: 0 },
  links: {
    link_1: {
      destination: 'https://www.thetrickbook.com/',
      uniqueRecipients: 20,
      totalHits: 25,
      suspectedAutomatedHits: 3,
    },
    link_2: {
      destination: 'https://www.youtube.com/watch?v=film',
      uniqueRecipients: 0,
      totalHits: 0,
      suspectedAutomatedHits: 0,
    },
  },
};

async function setup(
  page,
  { role = 'admin', failList = false, failStats = false, noCampaigns = false } = {},
) {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ userId: 'aaaaaaaaaaaaaaaaaaaaaaaa', role, name: 'Newsletter fixture' })).toString('base64url')}.fixture`;
  await page.context().addCookies([{ name: 'token', value: token, url: 'http://127.0.0.1:3017' }]);
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: {} }));
  let statsCalls = 0;
  let campaignCalls = 0;
  await page.route('https://api.thetrickbook.com/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/newsletter/campaigns') {
      campaignCalls++;
      if (failList) return route.fulfill({ status: 503, json: { error: 'Fixture unavailable' } });
      return route.fulfill({
        json: {
          campaigns: noCampaigns
            ? []
            : [
                {
                  id: 'fixture-member',
                  subject: fixtureStats.subject,
                  createdAt: new Date().toISOString(),
                },
                ...(url.searchParams.get('includePreviews') === 'true'
                  ? [
                      {
                        id: 'fixture-preview',
                        subject: '[DRAFT] Review',
                        isPreview: true,
                        createdAt: new Date().toISOString(),
                      },
                    ]
                  : []),
              ],
          hasMore: false,
        },
      });
    }
    if (url.pathname.startsWith('/api/newsletter/campaigns/')) {
      statsCalls++;
      if (failStats) return route.fulfill({ status: 503, json: { error: 'Fixture unavailable' } });
      return route.fulfill({
        json: url.pathname.includes('fixture-preview')
          ? { ...fixtureStats, isPreview: true }
          : fixtureStats,
      });
    }
    if (url.pathname.includes('/categories')) return route.fulfill({ json: [] });
    return route.fulfill({ json: null });
  });
  return { statsCalls: () => statsCalls, campaignCalls: () => campaignCalls };
}

test('admin can view results, expand links and refresh without counting admin link clicks', async ({
  page,
}) => {
  const calls = await setup(page);
  await page.goto('/admin/analytics#newsletters');
  const section = page.getByRole('region', { name: 'Newsletter campaigns' });
  await expect(section.getByText('Estimated unique openers')).toBeVisible();
  await expect(section.getByText('120', { exact: true })).toBeVisible();
  await expect(section.getByText(/Planned audience: 393/)).toBeVisible();
  await section.getByText('All activity & link breakdown', { exact: true }).click();
  await expect(section.getByRole('link', { name: 'thetrickbook.com' })).toHaveAttribute(
    'href',
    'https://www.thetrickbook.com/',
  );
  await expect(section.getByRole('link', { name: 'youtube.com/watch' })).toBeVisible();
  const before = calls.statsCalls();
  await section.getByRole('button', { name: 'Refresh newsletter results' }).click();
  await expect.poll(calls.statsCalls).toBeGreaterThan(before);
  await expect(section.getByText('120', { exact: true })).toBeVisible();
  await section.getByLabel('Include review drafts').check();
  await expect(section.getByText('120', { exact: true })).toBeVisible();
  await section.getByLabel('Campaign', { exact: true }).selectOption('fixture-preview');
  await expect(section.getByText(/Review draft only/)).toBeVisible();
});

test('mobile section stays within the viewport and supports campaign controls', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/admin/analytics#newsletters');
  const section = page.getByRole('region', { name: 'Newsletter campaigns' });
  await expect(section.getByText('120', { exact: true })).toBeVisible();
  await expect(section.getByLabel('Campaign', { exact: true })).toBeVisible();
  const box = await section.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(391);
  await testInfo.attach('newsletter-mobile', {
    body: await section.screenshot({ path: testInfo.outputPath('newsletter-mobile.png') }),
    contentType: 'image/png',
  });
});

test('empty campaigns and failed requests do not pretend the counts are zero', async ({ page }) => {
  await setup(page, { failList: true });
  await page.goto('/admin/analytics#newsletters');
  const section = page.getByRole('region', { name: 'Newsletter campaigns' });
  await expect(section.getByRole('alert')).toContainText('could not be loaded');
  await expect(section.getByText('Provider accepted')).toHaveCount(0);
});

test('an empty range is explicit', async ({ page }) => {
  await setup(page, { noCampaigns: true });
  await page.goto('/admin/analytics#newsletters');
  await expect(page.getByText(/No member campaigns in this date range/)).toBeVisible();
});

test('failed campaign metrics show an error instead of zero performance', async ({ page }) => {
  await setup(page, { failStats: true });
  await page.goto('/admin/analytics#newsletters');
  const section = page.getByRole('region', { name: 'Newsletter campaigns' });
  await expect(section.getByRole('alert')).toContainText('Campaign results could not be loaded');
  await expect(section.getByText('Estimated unique openers')).toHaveCount(0);
});

test('non-admin never requests newsletter campaign data', async ({ page }) => {
  const calls = await setup(page, { role: 'user' });
  await page.goto('/admin/analytics');
  await expect(page).toHaveURL('http://127.0.0.1:3017/login');
  expect(calls.campaignCalls()).toBe(0);
});
