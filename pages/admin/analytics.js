import { ArrowDown, Download, Eye, MousePointer, RefreshCw, Users } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Component, useContext, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AuthContext } from '../../auth/AuthContext';
import AdminNav from '../../components/AdminNav';
import {
  fetchAppStores,
  fetchCtas,
  fetchFunnel,
  fetchOverview,
  fetchPages,
  fetchReferrers,
  fetchScrollDepth,
  fetchSections,
  fetchTraffic,
} from '../../lib/apiAnalytics';

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">Chart failed to render</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="text-sm text-yellow-500 flex items-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const COLORS = ['#fcf150', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SECTION_ORDER = [
  'hero',
  'stats_bar',
  'features',
  'testimonials',
  'how_it_works',
  'community',
  'final_cta',
];

function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-yellow-500" />
      </div>
      <p className="text-2xl font-bold text-foreground">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { loggedIn, role, token } = useContext(AuthContext);
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn || role !== 'admin') {
      router.push('/login');
    }
  }, [loggedIn, role, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setData({});

    Promise.all([
      fetchOverview(token, days).catch(() => null),
      fetchTraffic(token, days).catch(() => []),
      fetchPages(token, days).catch(() => []),
      fetchSections(token, days).catch(() => []),
      fetchScrollDepth(token, days).catch(() => []),
      fetchCtas(token, days).catch(() => []),
      fetchAppStores(token, days).catch(() => []),
      fetchFunnel(token, days).catch(() => ({ steps: [] })),
      fetchReferrers(token, days).catch(() => []),
    ])
      .then(
        ([overview, traffic, pages, sections, scrollDepth, ctas, appStores, funnel, referrers]) => {
          setData({
            overview: overview || {},
            traffic: traffic || [],
            pages: pages || [],
            sections: sections || [],
            scrollDepth: scrollDepth || [],
            ctas: ctas || [],
            appStores: appStores || [],
            funnel: funnel || { steps: [] },
            referrers: referrers || [],
          });
          setLoading(false);
        },
      )
      .catch(() => {
        setData({});
        setLoading(false);
      });
  }, [token, days]);

  if (loggedIn === null || !loggedIn || role !== 'admin') return null;

  const sortedSections = (data.sections || []).sort(
    (a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section),
  );

  const funnelSteps = data.funnel?.steps || [];
  const funnelMax = funnelSteps[0]?.count || 1;

  return (
    <>
      <Head>
        <title>Analytics Dashboard | Admin | TrickBook</title>
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminNav />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Landing page performance & user engagement
              </p>
            </div>
            <div className="flex gap-2">
              {[7, 14, 30, 90].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    days === d
                      ? 'bg-yellow-500 text-black'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
              <span className="ml-3 text-muted-foreground">Loading analytics...</span>
            </div>
          ) : (
            <ChartErrorBoundary key={days}>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Pageviews" value={data.overview?.pageviews || 0} icon={Eye} />
                <StatCard
                  label="Unique Visitors"
                  value={data.overview?.uniqueSessions || 0}
                  icon={Users}
                />
                <StatCard
                  label="CTA Clicks"
                  value={data.overview?.ctaClicks || 0}
                  icon={MousePointer}
                />
                <StatCard
                  label="App Store Clicks"
                  value={data.overview?.appStoreClicks || 0}
                  icon={Download}
                />
              </div>

              {/* Traffic Over Time */}
              <ChartCard title="Traffic Over Time" className="mb-8">
                {(data.traffic || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.traffic}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(d) => d.slice(5)}
                      />
                      <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="pageviews"
                        stroke="#fcf150"
                        strokeWidth={2}
                        name="Pageviews"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Unique Visitors"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No traffic data yet</p>
                )}
              </ChartCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Conversion Funnel */}
                <ChartCard title="Conversion Funnel">
                  {funnelSteps.length > 0 ? (
                    <div className="space-y-3">
                      {funnelSteps.map((step, i) => {
                        const pct = funnelMax > 0 ? (step.count / funnelMax) * 100 : 0;
                        const dropoff =
                          i > 0 && funnelSteps[i - 1].count > 0
                            ? Math.round((1 - step.count / funnelSteps[i - 1].count) * 100)
                            : null;
                        return (
                          <div key={step.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">{step.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {step.count.toLocaleString()}
                                </span>
                                {dropoff !== null && dropoff > 0 && (
                                  <span className="text-xs text-red-400 flex items-center">
                                    <ArrowDown className="w-3 h-3" />
                                    {dropoff}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full h-6 bg-white/5 rounded-md overflow-hidden">
                              <div
                                className="h-full rounded-md transition-all duration-500"
                                style={{
                                  width: `${Math.max(pct, 2)}%`,
                                  backgroundColor: COLORS[i % COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No funnel data yet</p>
                  )}
                </ChartCard>

                {/* Section Engagement */}
                <ChartCard title="Landing Page Section Engagement">
                  {sortedSections.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={sortedSections} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#666" tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="section"
                          stroke="#666"
                          tick={{ fontSize: 11 }}
                          width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                          {sortedSections.map((entry, i) => (
                            <Cell key={entry.section} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No section data yet</p>
                  )}
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Scroll Depth */}
                <ChartCard title="Scroll Depth">
                  {(data.scrollDepth || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.scrollDepth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="depth"
                          stroke="#666"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(d) => `${d}%`}
                        />
                        <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Users" fill="#fcf150" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No scroll data yet</p>
                  )}
                </ChartCard>

                {/* App Store Split */}
                <ChartCard title="App Store Clicks">
                  {(data.appStores || []).length > 0 ? (
                    <div>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={data.appStores}
                            dataKey="clicks"
                            nameKey="store"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label={({ store, clicks }) => `${store}: ${clicks}`}
                          >
                            {data.appStores.map((entry, i) => (
                              <Cell
                                key={`${entry.store}-${entry.location}`}
                                fill={COLORS[i % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {data.appStores.map((item) => (
                          <div
                            key={`${item.store}-${item.location}`}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.store} ({item.location})
                            </span>
                            <span className="font-medium text-foreground">{item.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      No store click data yet
                    </p>
                  )}
                </ChartCard>

                {/* CTA Performance */}
                <ChartCard title="CTA Performance">
                  {(data.ctas || []).length > 0 ? (
                    <div className="space-y-3">
                      {data.ctas.map((cta) => (
                        <div
                          key={`${cta.ctaName}-${cta.location}`}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <span className="text-foreground font-medium">{cta.ctaName}</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              ({cta.location})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-foreground">{cta.clicks}</span>
                            <span className="text-muted-foreground text-xs ml-1">clicks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No CTA data yet</p>
                  )}
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Pages */}
                <ChartCard title="Top Pages">
                  {(data.pages || []).length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {data.pages.map((page) => (
                        <div
                          key={page.page}
                          className="flex justify-between items-center text-sm py-1 border-b border-border"
                        >
                          <span className="text-foreground truncate mr-4 max-w-[200px]">
                            {page.page}
                          </span>
                          <div className="flex gap-4 text-right shrink-0">
                            <span className="text-muted-foreground">
                              {page.uniqueVisitors} visitors
                            </span>
                            <span className="font-semibold text-foreground">
                              {page.views} views
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No page data yet</p>
                  )}
                </ChartCard>

                {/* Referrers */}
                <ChartCard title="Top Referrers">
                  {(data.referrers || []).length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {data.referrers.map((ref) => (
                        <div
                          key={ref.referrer}
                          className="flex justify-between items-center text-sm py-1 border-b border-border"
                        >
                          <span className="text-foreground truncate mr-4 max-w-[250px]">
                            {ref.referrer}
                          </span>
                          <span className="font-semibold text-foreground shrink-0">
                            {ref.visits} visits
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No referrer data yet</p>
                  )}
                </ChartCard>
              </div>
            </ChartErrorBoundary>
          )}
        </div>
      </div>
    </>
  );
}
