import { Mail, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchNewsletterCampaigns, fetchNewsletterStats } from '../lib/apiNewsletter';
import { newsletterCount, newsletterDestination, newsletterRate } from '../lib/newsletterMetrics';

function Metric({ label, value, note }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{newsletterCount(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export function NewsletterResults({ stats }) {
  const [showAll, setShowAll] = useState(false);
  const links = Object.entries(stats.links || {}).sort((a, b) => b[1].totalHits - a[1].totalHits);
  const scannerClicks = links.reduce((sum, [, row]) => sum + (row.suspectedAutomatedHits || 0), 0);
  const submissions = stats.submissions || {};
  const pending =
    Number.isInteger(submissions.prepared) && Number.isInteger(submissions.sending)
      ? submissions.prepared + submissions.sending
      : null;
  const state =
    {
      sending: 'Sending',
      submitted: 'Submitted to provider',
      paused: 'Paused for review',
      prepared: 'Prepared',
    }[stats.campaignStatus] || 'Prepared';
  return (
    <div className="space-y-4">
      {stats.isPreview && (
        <p className="rounded-lg bg-yellow-500/10 p-3 text-sm text-foreground">
          Review draft only — these results are separate from member campaigns.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {state} · Planned audience: {newsletterCount(stats.audienceTarget)} · Skipped at dispatch:{' '}
        {newsletterCount(stats.skippedAtDispatch)}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Provider accepted"
          value={stats.accepted}
          note="Submission accepted; not confirmed delivery"
        />
        <Metric
          label="Estimated unique openers"
          value={stats.estimatedUniqueOpens}
          note={`${newsletterRate(stats.estimatedOpenRate)} of accepted submissions`}
        />
        <Metric
          label="Estimated unique clickers"
          value={stats.estimatedUniqueClickers}
          note={`${newsletterRate(stats.estimatedClickRate)} of accepted submissions`}
        />
        <Metric
          label="Unsubscribes"
          value={stats.unsubscribeRecipients}
          note="Distinct recipients who opted out"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {newsletterCount(pending)} pending · {newsletterCount(submissions.unknown)} uncertain
        submissions · {newsletterCount(submissions.suppressed)} suppressed
      </p>
      <p className="text-xs text-muted-foreground">
        Opens and clicks are estimates, not verified human activity. Privacy proxies and scanners
        can inflate them. Rates use provider-accepted submissions, not confirmed deliveries.
        Delivery, bounce and complaint reports are not collected here.
      </p>
      <details className="rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer font-medium text-foreground">
          All activity &amp; link breakdown
        </summary>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-5 text-sm">
          <div>
            <dt className="text-muted-foreground">Total open hits</dt>
            <dd className="font-semibold">{newsletterCount(stats.totalOpenHits)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Observed proxy open hits</dt>
            <dd className="font-semibold">{newsletterCount(stats.observedProxyOpenHits)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total click hits</dt>
            <dd className="font-semibold">{newsletterCount(stats.totalClickHits)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Suspected scanner click hits</dt>
            <dd className="font-semibold">{newsletterCount(scannerClicks)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mb-3">
          Open destinations below directly; these admin links do not add campaign clicks.
        </p>
        {links.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Clicks by newsletter destination and placement</caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="py-3 pr-4">
                    Destination
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    Estimated unique clickers
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    Total hits
                  </th>
                  <th scope="col" className="py-3">
                    Scanner hits
                  </th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? links : links.slice(0, 8)).map(([key, row], index) => {
                  const target = newsletterDestination(row.destination);
                  return (
                    <tr key={key} className="border-b border-border">
                      <td className="py-3 pr-4 max-w-xs">
                        {target ? (
                          <a
                            href={target.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-500 hover:underline break-words"
                          >
                            {target.label}
                          </a>
                        ) : (
                          <span>Destination unavailable</span>
                        )}
                        <span className="block text-xs text-muted-foreground">
                          Link position {key.match(/^link_(\d+)$/)?.[1] || index + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{newsletterCount(row.uniqueRecipients)}</td>
                      <td className="py-3 pr-4">{newsletterCount(row.totalHits)}</td>
                      <td className="py-3">{newsletterCount(row.suspectedAutomatedHits)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tracked destinations recorded for this campaign.
          </p>
        )}
        {links.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-4 text-sm text-yellow-500 hover:underline"
          >
            {showAll ? 'Show top 8 links' : `Show all ${links.length} links`}
          </button>
        )}
      </details>
    </div>
  );
}

export default function NewsletterAnalytics({ token, days }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState('');
  const [includePreviews, setIncludePreviews] = useState(false);
  const [revision, setRevision] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [statsError, setStatsError] = useState('');
  const [stats, setStats] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision intentionally refetches after the manual Refresh action.
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setListLoading(true);
    setListError('');
    setStats(null);
    fetchNewsletterCampaigns(token, days, includePreviews, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        const rows = data.campaigns || [];
        setCampaigns(rows);
        setHasMore(Boolean(data.hasMore));
        setSelected((current) =>
          rows.some((row) => row.id === current) ? current : rows[0]?.id || '',
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setListError('Newsletter campaigns could not be loaded. Please retry.');
          setCampaigns([]);
          setSelected('');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setListLoading(false);
      });
    return () => controller.abort();
  }, [token, days, includePreviews, revision]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision intentionally refetches after the manual Refresh action.
  useEffect(() => {
    setStats(null);
    setStatsError('');
    setStatsLoading(false);
    if (listLoading || !token || !selected) return;
    const controller = new AbortController();
    setStatsLoading(true);
    fetchNewsletterStats(token, selected, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setStats(data);
          setUpdatedAt(new Date());
        }
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setStatsError('Campaign results could not be loaded. Please retry.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setStatsLoading(false);
      });
    return () => controller.abort();
  }, [token, selected, revision, listLoading]);

  return (
    <section
      id="newsletters"
      aria-labelledby="newsletter-heading"
      className="mb-8 rounded-xl border border-border p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2
            id="newsletter-heading"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Mail className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            Newsletter campaigns
          </h2>
          <p className="text-sm text-muted-foreground">
            Campaigns created in the last {days} days. Results are lifetime totals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRevision((value) => value + 1)}
          disabled={listLoading || statsLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh newsletter results
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <input
          type="checkbox"
          checked={includePreviews}
          onChange={(event) => setIncludePreviews(event.target.checked)}
        />
        Include review drafts
      </label>
      {listError && (
        <p role="alert" className="text-sm text-red-500 mb-4">
          {listError}
        </p>
      )}
      {listLoading ? (
        <output className="block text-sm text-muted-foreground py-6">
          Loading newsletter campaigns…
        </output>
      ) : !campaigns.length && !listError ? (
        <p className="text-sm text-muted-foreground py-6">
          {includePreviews
            ? 'No campaigns in this date range.'
            : 'No member campaigns in this date range. Include review drafts to see preview results.'}
        </p>
      ) : (
        campaigns.length > 0 && (
          <>
            <label
              htmlFor="newsletter-campaign"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Campaign
            </label>
            <select
              id="newsletter-campaign"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground mb-4"
            >
              {campaigns.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.subject} · {new Date(row.createdAt).toLocaleDateString()}
                  {row.isPreview ? ' · Review draft' : ''}
                </option>
              ))}
            </select>
            {hasMore && (
              <p className="text-xs text-muted-foreground mb-4">
                Showing the latest 50 campaigns. Choose a smaller date range to narrow the list.
              </p>
            )}
            {statsLoading ? (
              <output className="block text-sm text-muted-foreground py-6">
                Loading campaign results…
              </output>
            ) : statsError ? (
              <p role="alert" className="text-sm text-red-500">
                {statsError}
              </p>
            ) : (
              stats && <NewsletterResults key={selected} stats={stats} />
            )}
            {stats && updatedAt && (
              <p className="mt-4 text-xs text-muted-foreground">
                Updated {updatedAt.toLocaleTimeString()}. Refresh to load new activity.
              </p>
            )}
          </>
        )
      )}
    </section>
  );
}
