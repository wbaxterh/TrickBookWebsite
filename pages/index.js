import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Download,
  MapPin,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { trackAppStoreClick, trackCtaClick, trackHeroVariant } from '../lib/analytics';
import { useScrollDepthTracking, useSectionViewTracking } from '../lib/useScrollTracking';
import nextI18NextConfig from '../next-i18next.config';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

const INTENTS = [
  {
    key: 'learn',
    href: '/trickbook',
    icon: BookOpen,
    accent: 'text-yellow-300',
    glow: 'bg-yellow-300/10',
  },
  {
    key: 'ride',
    href: '/spots',
    icon: MapPin,
    accent: 'text-emerald-300',
    glow: 'bg-emerald-300/10',
  },
  {
    key: 'events',
    href: '/events',
    icon: CalendarDays,
    accent: 'text-sky-300',
    glow: 'bg-sky-300/10',
  },
  {
    key: 'scene',
    href: '/riders',
    icon: Users,
    accent: 'text-violet-300',
    glow: 'bg-violet-300/10',
  },
];

const DISCOVERY_LINKS = [
  { key: 'tricks', href: '/trickbook', icon: Target },
  { key: 'spots', href: '/spots', icon: Compass },
  { key: 'events', href: '/events', icon: CalendarDays },
  { key: 'shops', href: '/shops', icon: Store },
];

function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return Number(num || 0).toLocaleString();
}

function useStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Stats unavailable'))))
      .then(setStats)
      .catch(() => {});
  }, []);
  return stats;
}

function AppStoreBadges({ className = '', location = 'unknown' }) {
  const { t } = useTranslation('home');
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="https://apps.apple.com/us/app/the-trick-book/id6446022788"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:-translate-y-0.5"
        onClick={() => trackAppStoreClick('ios', location)}
      >
        <Image
          src="/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
          width={150}
          height={50}
          alt={t('badges.appStoreAlt')}
        />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.thetrickbook.trickbook"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:-translate-y-0.5"
        onClick={() => trackAppStoreClick('android', location)}
      >
        <Image
          src="/google-play-badge.svg"
          width={168}
          height={50}
          alt={t('badges.googlePlayAlt')}
          className="h-[50px] w-auto"
        />
      </a>
    </div>
  );
}

function IntentCard({ item, t }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 no-underline transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
      onClick={() => trackCtaClick(`intent_${item.key}`, 'hero')}
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${item.glow}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span
            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${item.glow}`}
          >
            <Icon className={`h-5 w-5 ${item.accent}`} />
          </span>
          <h2 className="mb-1 text-base font-bold text-white">{t(`intent.${item.key}.title`)}</h2>
          <p className="mb-0 text-sm leading-relaxed text-gray-400">
            {t(`intent.${item.key}.text`)}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </Link>
  );
}

export default function Home() {
  const { t } = useTranslation('home');
  const { loggedIn } = useContext(AuthContext);
  const stats = useStats();
  useScrollDepthTracking();

  const heroRef = useSectionViewTracking('hero_intent');
  const valueRef = useSectionViewTracking('instant_value');
  const loopRef = useSectionViewTracking('progression_loop');
  const companionRef = useSectionViewTracking('kaori_companion');
  const appRef = useSectionViewTracking('app_conversion');

  useEffect(() => trackHeroVariant('intent-first'), []);

  const statItems = [
    { value: stats?.tricks || 1889, label: t('stats.tricks'), icon: Target },
    { value: stats?.spots || 4869, label: t('stats.spots'), icon: MapPin },
    { value: stats?.users || 354, label: t('stats.riders'), icon: Users },
  ];

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={t('meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta name="author" content="TrickBook" />
        <meta name="keywords" content={t('meta.keywords')} />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.ogDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thetrickbook.com" />
      </Head>

      <main className="bg-[#080908] text-white">
        <section
          ref={heroRef}
          className="relative overflow-hidden border-b border-white/5 pt-24 md:pt-32"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(250,204,21,0.13),transparent_32%),radial-gradient(circle_at_82%_25%,rgba(34,197,94,0.08),transparent_28%)]" />
          <div className="relative container mx-auto px-4 pb-16 md:pb-24">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-yellow-200">
                <Sparkles className="h-4 w-4" />
                {t('intent.eyebrow')}
              </div>
              <h1 className="mb-6 text-[clamp(3.2rem,9vw,7.5rem)] font-black leading-[0.88] tracking-[-0.065em]">
                {t('intent.headline.line1')}
                <span className="block text-yellow-300">{t('intent.headline.line2')}</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
                {t('intent.subline')}
              </p>

              <div className="mx-auto mb-6 grid max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
                {INTENTS.map((item) => (
                  <IntentCard key={item.key} item={item} t={t} />
                ))}
              </div>
              <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-emerald-400" /> {t('intent.noAccount')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 bg-[#0d0e0d]">
          <div className="container mx-auto grid grid-cols-3 divide-x divide-white/10 px-4 py-6">
            {statItems.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 px-2 text-center sm:flex-row sm:justify-center sm:gap-3"
              >
                <Icon className="h-4 w-4 text-yellow-300 sm:h-5 sm:w-5" />
                <div className="sm:text-left">
                  <p className="mb-0 text-xl font-black tabular-nums md:text-2xl">
                    {formatNumber(value)}+
                  </p>
                  <p className="mb-0 text-[10px] uppercase tracking-wider text-gray-500 md:text-xs">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={valueRef} className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                {t('value.eyebrow')}
              </p>
              <h2 className="mb-4 text-4xl font-black tracking-tight md:text-6xl">
                {t('value.title')}
              </h2>
              <p className="text-lg leading-relaxed text-gray-400">{t('value.subtitle')}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {DISCOVERY_LINKS.map(({ key, href, icon: Icon }) => (
                <Link
                  key={key}
                  href={href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 no-underline transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/[0.04]"
                >
                  <Icon className="mb-8 h-7 w-7 text-gray-400 transition-colors group-hover:text-yellow-300" />
                  <h3 className="mb-2 text-xl font-bold text-white">{t(`value.${key}.title`)}</h3>
                  <p className="mb-6 min-h-[3.5rem] text-sm leading-relaxed text-gray-500">
                    {t(`value.${key}.text`)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-yellow-300">
                    {t(`value.${key}.cta`)}{' '}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section ref={loopRef} className="border-y border-white/5 bg-[#0d0f0e] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {t('loop.eyebrow')}
                </p>
                <h2 className="mb-5 text-4xl font-black tracking-tight md:text-5xl">
                  {t('loop.title')}
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-gray-400">{t('loop.text')}</p>
                <Link
                  href={loggedIn ? '/trickbook' : '/signup'}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-300 px-6 py-3 font-bold !text-black no-underline transition-transform hover:-translate-y-0.5 hover:!text-black"
                  onClick={() => trackCtaClick('start_progressing', 'progression_loop')}
                >
                  {loggedIn ? t('finalCta.goToTrickbook') : t('loop.cta')}{' '}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'discover', icon: Search, number: '01' },
                  { key: 'plan', icon: Target, number: '02' },
                  { key: 'ride', icon: Play, number: '03' },
                  { key: 'grow', icon: TrendingUp, number: '04' },
                ].map(({ key, icon: Icon, number }) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <Icon className="h-6 w-6 text-emerald-300" />
                      <span className="font-mono text-xs text-gray-600">{number}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{t(`loop.steps.${key}.title`)}</h3>
                    <p className="mb-0 text-sm leading-relaxed text-gray-500">
                      {t(`loop.steps.${key}.text`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section ref={companionRef} className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(56,189,248,0.12),transparent_30%)]" />
          <div className="relative container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-200">
                  <Sparkles className="h-4 w-4" /> {t('kaori.badge')}
                </div>
                <h2 className="mb-5 text-4xl font-black tracking-tight md:text-6xl">
                  {t('kaoriSimple.title')}
                </h2>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-400">
                  {t('kaori.description')}
                </p>
                <Link
                  href={loggedIn ? '/kaori-live' : '/signup'}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-sky-300/10 px-6 py-3 font-bold !text-sky-200 no-underline hover:bg-sky-300/15 hover:!text-sky-100"
                  onClick={() => trackCtaClick('meet_kaori', 'kaori_companion')}
                >
                  <MessageCircle className="h-4 w-4" /> {t('kaori.cta')}{' '}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#111720] p-6 shadow-2xl">
                <p className="ml-auto mb-4 max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-3 text-sm text-gray-200">
                  {t('kaori.userMessage')}
                </p>
                <p className="mb-4 max-w-[90%] rounded-2xl rounded-bl-sm bg-sky-300/10 px-4 py-3 text-sm leading-relaxed text-sky-50">
                  {t('kaori.reply')}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Play className="h-4 w-4" /> {t('kaori.voiceHint')}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section ref={appRef} className="border-t border-white/5 bg-[#0d0e0d] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl items-center gap-10 overflow-hidden rounded-[2rem] border border-yellow-300/15 bg-[linear-gradient(135deg,rgba(250,204,21,0.10),rgba(255,255,255,0.025))] p-8 md:grid-cols-[1fr_auto] md:p-14">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                  {t('appCta.eyebrow')}
                </p>
                <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
                  {t('appCta.title')}
                </h2>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-300">
                  {t('appCta.text')}
                </p>
                <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                  {['free', 'fast', 'private'].map((key) => (
                    <span key={key} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-300" />
                      {t(`appCta.${key}`)}
                    </span>
                  ))}
                </div>
                <AppStoreBadges location="homepage_app_value" />
              </div>
              <div className="hidden h-36 w-36 items-center justify-center rounded-3xl bg-yellow-300 text-black md:flex">
                <Download className="h-14 w-14" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'], nextI18NextConfig)),
    },
  };
}
