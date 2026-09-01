import {
  Brain,
  ChevronRight,
  Download,
  MapPin,
  MessageCircle,
  Mic2,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { trackAppStoreClick, trackCtaClick, trackHeroVariant } from '../lib/analytics';
import { useFeatureFlag } from '../lib/useFeatureFlag';
import { useScrollDepthTracking, useSectionViewTracking } from '../lib/useScrollTracking';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return num.toLocaleString();
}

function useStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);
  return stats;
}

// Animated counter that counts up from 0
function AnimatedStat({ value, label, icon: Icon }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2">
      <Icon className="w-5 h-5 text-yellow-400 mb-1" />
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
        {formatNumber(count)}+
      </span>
      <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function AppStoreBadges({ className = '', location = 'unknown' }) {
  const { t } = useTranslation('home');
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="https://apps.apple.com/us/app/the-trick-book/id6446022788"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
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
        className="transition-transform hover:scale-105"
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

// Copy for these sections lives in public/locales/<locale>/home.json.
const FEATURES = [
  { icon: Target, key: 'track' },
  { icon: TrendingUp, key: 'progress' },
  { icon: Users, key: 'connect' },
];

const TESTIMONIALS = [
  { key: 'jake', name: 'Jake M.', roleKey: 'skateboarder', rating: 5 },
  { key: 'sarah', name: 'Sarah K.', roleKey: 'snowboarder', rating: 5 },
  { key: 'marcus', name: 'Marcus T.', roleKey: 'skateboarder', rating: 5 },
];

const HOW_IT_WORKS = [
  { step: '1', icon: Download, key: 'step1' },
  { step: '2', icon: Zap, key: 'step2' },
  { step: '3', icon: TrendingUp, key: 'step3' },
];

// A/B test variants for the hero headline.
// Create a feature flag called "hero-headline" in PostHog with these variant keys.
// Maps PostHog variant keys to hero.variants.* keys in home.json.
const HERO_VARIANT_KEYS = {
  control: 'control',
  'variant-community': 'community',
  'variant-action': 'action',
};

export default function Home() {
  const { t } = useTranslation('home');
  const { loggedIn } = useContext(AuthContext);
  const stats = useStats();
  const heroVariant = useFeatureFlag('hero-headline', 'control');
  const heroKey = `hero.variants.${HERO_VARIANT_KEYS[heroVariant] || 'control'}`;

  // Scroll depth tracking (25/50/75/100% milestones)
  useScrollDepthTracking();

  // Section visibility tracking
  const heroRef = useSectionViewTracking('hero');
  const kaoriRef = useSectionViewTracking('kaori_companion');
  const statsRef = useSectionViewTracking('stats_bar');
  const featuresRef = useSectionViewTracking('features');
  const testimonialsRef = useSectionViewTracking('testimonials');
  const howItWorksRef = useSectionViewTracking('how_it_works');
  const communityRef = useSectionViewTracking('community');
  const finalCtaRef = useSectionViewTracking('final_cta');

  // Track which hero A/B variant was shown
  useEffect(() => {
    if (heroVariant) {
      trackHeroVariant(heroVariant);
    }
  }, [heroVariant]);

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

      {/* ============================================ */}
      {/* SECTION 1: HERO                              */}
      {/* ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(252,241,80,0.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(252,241,80,0.03),transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 pt-16 md:pt-24 text-center">
          {/* Massive headline */}
          <h1 className="font-black tracking-tighter leading-[0.85] mb-8">
            <span className="block text-[clamp(2.8rem,10vw,8rem)] text-white">
              {t(`${heroKey}.line1`)}
            </span>
            <span className="block text-[clamp(2.8rem,10vw,8rem)] text-yellow-400">
              {t(`${heroKey}.line2`)}
            </span>
            <span className="block text-[clamp(2.8rem,10vw,8rem)] text-white">
              {t(`${heroKey}.line3`)}
            </span>
          </h1>

          {/* Subline */}
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
            {t('hero.subline1')}
            <br className="hidden md:block" />
            {t('hero.subline2')}
          </p>

          {/* App Store Badges first */}
          <AppStoreBadges location="hero" className="justify-center mb-6" />

          {/* CTA */}
          <div className="mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-yellow-400 !text-[#0a0a0a] font-bold rounded-lg hover:bg-yellow-300 hover:!text-[#0a0a0a] transition-colors text-center no-underline uppercase tracking-wide text-sm"
              onClick={() => trackCtaClick('join_the_movement', 'hero')}
            >
              {t('hero.cta')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: KAORI AI COMPANION                */}
      {/* ============================================ */}
      <section
        ref={kaoriRef}
        className="relative overflow-hidden bg-[#0d0f14] border-y border-white/5 py-20 md:py-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(96,165,250,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(252,211,77,0.06),transparent_28%)]" />

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 mb-6">
                <Sparkles className="h-4 w-4 text-sky-300" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                  {t('kaori.badge')}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.95] text-white mb-6">
                <Trans
                  t={t}
                  i18nKey="kaori.title"
                  components={{ highlight: <span className="text-sky-300" /> }}
                />
              </h2>
              <p className="max-w-xl text-lg md:text-xl leading-relaxed text-gray-400 mb-8">
                {t('kaori.description')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9">
                {[
                  { icon: Mic2, key: 'talk' },
                  { icon: Play, key: 'demo' },
                  { icon: Brain, key: 'memory' },
                ].map((capability) => (
                  <div
                    key={capability.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <capability.icon className="h-5 w-5 text-sky-300 mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">
                      {t(`kaori.capabilities.${capability.key}.title`)}
                    </h3>
                    <p className="text-xs leading-relaxed text-gray-500">
                      {t(`kaori.capabilities.${capability.key}.text`)}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={loggedIn ? '/kaori-live' : '/signup'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-300 px-7 py-3.5 text-sm font-bold uppercase tracking-wide !text-[#071018] no-underline transition-all hover:bg-sky-200 hover:!text-[#071018] hover:-translate-y-0.5"
                onClick={() => trackCtaClick('meet_kaori', 'kaori_companion')}
              >
                <MessageCircle className="h-4 w-4" />
                {t('kaori.cta')}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <figure className="relative max-w-lg mx-auto w-full">
              <figcaption className="sr-only">{t('kaori.conversationCaption')}</figcaption>
              <div className="absolute -inset-6 rounded-[3rem] bg-sky-400/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-[#121720]/95 p-5 md:p-7 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-4 border-b border-white/10 pb-5 mb-6">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-sky-300/60 bg-gradient-to-br from-sky-200 to-indigo-400">
                    <Image
                      src="https://api.thetrickbook.com/assets/kaori-avatar.jpg"
                      alt={t('kaori.avatarAlt')}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white mb-0">Kaori</p>
                      <span className="rounded-full bg-sky-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                        {t('kaori.aiCompanion')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-0">{t('kaori.status')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-gray-200">
                    {t('kaori.userMessage')}
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-sky-300/10 bg-sky-300/10 px-4 py-3 text-sm leading-relaxed text-sky-50">
                    {t('kaori.reply')}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-300/10">
                      <Mic2 className="h-3.5 w-3.5" />
                    </span>
                    {t('kaori.voiceHint')}
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: STATS BAR                         */}
      {/* ============================================ */}
      <section ref={statsRef} className="bg-[#111] border-y border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnimatedStat value={stats?.spots || 4869} label={t('stats.spots')} icon={MapPin} />
            <AnimatedStat value={stats?.tricks || 1889} label={t('stats.tricks')} icon={Target} />
            <AnimatedStat
              value={stats?.trickLists || 464}
              label={t('stats.trickLists')}
              icon={Star}
            />
            <AnimatedStat value={stats?.users || 224} label={t('stats.riders')} icon={Users} />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: THREE-PILLAR FEATURES             */}
      {/* ============================================ */}
      <section ref={featuresRef} className="bg-[#0a0a0a] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-gray-400 text-lg">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {t(`features.${feature.key}.subtitle`)}
                </p>
                <p className="text-gray-400 leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: TESTIMONIALS                      */}
      {/* ============================================ */}
      <section ref={testimonialsRef} className="bg-[#111] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-gray-400 text-lg">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.key}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={`star-${testimonial.key}-${i}`}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">
                  &ldquo;{t(`testimonials.quotes.${testimonial.key}`)}&rdquo;
                </p>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">
                    {t(`testimonials.roles.${testimonial.roleKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: HOW IT WORKS                      */}
      {/* ============================================ */}
      <section ref={howItWorksRef} className="bg-[#0a0a0a] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('howItWorks.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-7 h-7 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t(`howItWorks.${step.key}.title`)}
                </h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  {t(`howItWorks.${step.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: COMMUNITY / CULTURE               */}
      {/* ============================================ */}
      <section ref={communityRef} className="bg-[#111] py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                <Trans
                  t={t}
                  i18nKey="community.title"
                  components={{ highlight: <span className="text-yellow-400" /> }}
                />
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {t('community.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('community.point1.title')}</p>
                    <p className="text-gray-500 text-sm">{t('community.point1.text')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('community.point2.title')}</p>
                    <p className="text-gray-500 text-sm">{t('community.point2.text')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{t('community.point3.title')}</p>
                    <p className="text-gray-500 text-sm">{t('community.point3.text')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-3xl" />
              <div className="relative p-8 md:p-12 rounded-3xl border border-white/5">
                <svg
                  className="w-10 h-10 text-yellow-400/30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-6">
                  {t('community.quote')}
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-yellow-400/30" />
                  <div>
                    <p className="text-white font-medium">Rodney Mullen</p>
                    <p className="text-gray-500 text-sm">{t('community.quoteRole')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: FINAL CTA                         */}
      {/* ============================================ */}
      <section ref={finalCtaRef} className="bg-[#0a0a0a] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="absolute inset-0 bg-yellow-400/5 rounded-3xl blur-3xl" />
            <div className="relative p-8 md:p-16 rounded-3xl border border-white/5 bg-white/[0.01]">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                {t('finalCta.title')}
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                {t('finalCta.subtitle', { riders: stats ? formatNumber(stats.users) : '200' })}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {loggedIn ? (
                  <Link
                    href="/trickbook"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 !text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-300 hover:!text-[#1a1a1a] transition-colors no-underline"
                    onClick={() => trackCtaClick('go_to_trickbook', 'final_cta')}
                  >
                    {t('finalCta.goToTrickbook')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 !text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-300 hover:!text-[#1a1a1a] transition-colors no-underline"
                    onClick={() => trackCtaClick('create_free_account', 'final_cta')}
                  >
                    {t('finalCta.signup')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <AppStoreBadges className="justify-center" location="final_cta" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'])),
    },
  };
}
