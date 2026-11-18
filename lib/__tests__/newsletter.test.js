import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';
import { NewsletterResults } from '../../components/NewsletterAnalytics';
import { fetchNewsletterCampaigns, fetchNewsletterStats } from '../apiNewsletter';
import { newsletterCount, newsletterDestination, newsletterRate } from '../newsletterMetrics';

jest.mock('axios');

test('zero is a real value and unavailable counts/rates stay unavailable', () => {
  expect(newsletterCount(0)).toBe('0');
  expect(newsletterCount(undefined)).toBe('—');
  expect(newsletterCount(-1)).toBe('—');
  expect(newsletterRate(0)).toBe('0%');
  expect(newsletterRate(0.125)).toBe('12.5%');
  expect(newsletterRate(null)).toBe('—');
  expect(newsletterRate(NaN)).toBe('—');
  expect(newsletterRate(1.1)).toBe('110%'); // Do not hide proxy inflation by clamping to 100%.
});

test('only safe direct HTTPS destinations become admin links', () => {
  expect(newsletterDestination('javascript:alert(1)')).toBeNull();
  expect(newsletterDestination('https://user:secret@example.test/')).toBeNull();
  expect(newsletterDestination('https://www.youtube.com/watch?v=film').label).toBe(
    'youtube.com/watch',
  );
});

test('API calls carry admin auth, cancellation and campaign filters', async () => {
  axios.get.mockResolvedValue({ data: { campaigns: [] } });
  const signal = new AbortController().signal;
  await fetchNewsletterCampaigns('test-token', 14, true, signal);
  expect(axios.get).toHaveBeenLastCalledWith(
    expect.stringContaining('/newsletter/campaigns'),
    expect.objectContaining({
      headers: { 'x-auth-token': 'test-token' },
      params: { days: 14, includePreviews: true },
      signal,
    }),
  );
  await fetchNewsletterStats('test-token', 'nov-2026', signal);
  expect(axios.get).toHaveBeenLastCalledWith(
    expect.stringContaining('/nov-2026/stats'),
    expect.objectContaining({ headers: { 'x-auth-token': 'test-token' }, signal }),
  );
});

test('results disclose estimates and render zero-click links without exposing recipient data', () => {
  const stats = {
    accepted: 393,
    estimatedUniqueOpens: 0,
    estimatedUniqueClickers: 0,
    estimatedOpenRate: 0,
    estimatedClickRate: 0,
    unsubscribeRecipients: 0,
    totalOpenHits: 0,
    totalClickHits: 0,
    observedProxyOpenHits: 0,
    submissions: { prepared: 0, sending: 0, unknown: 0, suppressed: 0 },
    links: {
      home: {
        destination: 'https://www.thetrickbook.com/',
        uniqueRecipients: 0,
        totalHits: 0,
        suspectedAutomatedHits: 0,
      },
    },
  };
  const html = renderToStaticMarkup(<NewsletterResults stats={stats} />);
  expect(html).toContain('Provider accepted');
  expect(html).toContain('not confirmed delivery');
  expect(html).toContain('Estimated unique openers');
  expect(html).toContain('0% of accepted submissions');
  expect(html).toContain('thetrickbook.com');
  expect(html).toContain('https://www.thetrickbook.com/');
  expect(html).not.toContain('/api/newsletter/click/');
  expect(html).not.toContain('subscriberId');
});
