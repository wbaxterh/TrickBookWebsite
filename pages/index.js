import {
  ChevronRight,
  Download,
  MapPin,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
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
          alt="Download on the App Store"
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
          alt="Get it on Google Play"
          className="h-[50px] w-auto"
        />
      </a>
    </div>
  );
}

const FEATURES = [
  {
    icon: Target,
    title: 'Track',
    subtitle: 'Every trick you land',
    description:
      'Build custom trick lists for any sport. Check off tricks as you land them, track your sessions, and watch your skills grow over time.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress',
    subtitle: "See how far you've come",
    description:
      'Visual progress tracking shows your journey from beginner to pro. Browse the Trickipedia to discover new tricks and set goals for your next session.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  {
    icon: Users,
    title: 'Connect',
    subtitle: 'Ride with your crew',
    description:
      'Find and follow riders who share your stoke. Share clips, message your homies, and build a community around the sports you love.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally an app built by skaters, for skaters. I've been tracking my progress for months and it's actually motivating to see how many tricks I've landed.",
    name: 'Jake M.',
    role: 'Skateboarder',
    rating: 5,
  },
  {
    quote:
      "The spot finder is incredible. I moved to a new city and found three parks I didn't know about within my first week.",
    name: 'Sarah K.',
    role: 'Snowboarder',
    rating: 5,
  },
  {
    quote:
      "Love that this isn't just another social media app trying to sell my data. It's actually useful and respects my privacy.",
    name: 'Marcus T.',
    role: 'Skateboarder',
    rating: 5,
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: Download,
    title: 'Download free',
    description: 'Get TrickBook on iOS or Android. No credit card, no catch.',
  },
  {
    step: '2',
    icon: Zap,
    title: 'Start tracking',
    description: 'Create trick lists, discover spots near you, and log your sessions.',
  },
  {
    step: '3',
    icon: TrendingUp,
    title: 'Level up',
    description: 'Watch your progress grow, connect with riders, and push your limits.',
  },
];

// A/B test variants for the hero headline.
// Create a feature flag called "hero-headline" in PostHog with these variant keys.
const HERO_VARIANTS = {
  control: { line1: 'Track every trick', line2: 'you land.' },
  'variant-community': { line1: 'Your skateboarding journey,', line2: 'tracked.' },
  'variant-action': { line1: 'Land more tricks.', line2: 'Find more spots.' },
};

export default function Home() {
  const { loggedIn } = useContext(AuthContext);
  const stats = useStats();
  const heroVariant = useFeatureFlag('hero-headline', 'control');
  const heroText = HERO_VARIANTS[heroVariant] || HERO_VARIANTS.control;

  // Scroll depth tracking (25/50/75/100% milestones)
  useScrollDepthTracking();

  // Section visibility tracking
  const heroRef = useSectionViewTracking('hero');
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
        <title>TrickBook - Track Tricks. Find Spots. Ride Together.</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="TrickBook is the free app for skaters, snowboarders, and action sports riders to track tricks, discover spots, and connect with the community. Download now on iOS and Android."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta name="author" content="TrickBook" />
        <meta
          name="keywords"
          content="skateboarding app, trick tracker, skate spots, snowboarding app, action sports, trick list, skateboard progress, find skate spots"
        />
        <meta property="og:title" content="TrickBook - Track Tricks. Find Spots. Ride Together." />
        <meta
          property="og:description"
          content="The free app for action sports riders to track tricks, discover spots, and connect with the community."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thetrickbook.com" />
      </Head>

      {/* ============================================ */}
      {/* SECTION 1: HERO                              */}
      {/* ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a0a0a]"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1a00] opacity-90" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm mb-6">
                <Smartphone className="w-4 h-4" />
                Free on iOS & Android
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {heroText.line1}
                <br />
                <span className="text-yellow-400">{heroText.line2}</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-md">
                The app for skaters, snowboarders, and action sports riders to track progress,
                discover spots, and ride with a real community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 !text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-300 hover:!text-[#1a1a1a] transition-colors text-center no-underline"
                  onClick={() => trackCtaClick('get_started_free', 'hero')}
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/trickbook"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 !text-gray-300 font-medium rounded-lg hover:border-yellow-400/50 hover:!text-yellow-400 transition-colors text-center no-underline"
                  onClick={() => trackCtaClick('explore_tricks', 'hero')}
                >
                  Explore Tricks
                </Link>
              </div>

              <AppStoreBadges location="hero" />
            </div>

            {/* Right: App mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/10 rounded-3xl blur-2xl scale-95" />
                <Image
                  src="/trickBookScreenShotNoBg.png"
                  width={300}
                  height={600}
                  alt="TrickBook App"
                  className="relative z-10 drop-shadow-2xl w-[260px] md:w-[300px] h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: STATS BAR                         */}
      {/* ============================================ */}
      <section ref={statsRef} className="bg-[#111] border-y border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnimatedStat value={stats?.spots || 4869} label="Spots Mapped" icon={MapPin} />
            <AnimatedStat value={stats?.tricks || 1889} label="Tricks Tracked" icon={Target} />
            <AnimatedStat value={stats?.trickLists || 464} label="Trick Lists" icon={Star} />
            <AnimatedStat value={stats?.users || 224} label="Riders" icon={Users} />
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
              Everything you need to progress
            </h2>
            <p className="text-gray-400 text-lg">
              Built by riders who wanted a better way to track their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-400/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                <p className={`text-sm ${feature.color} mb-3`}>{feature.subtitle}</p>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Riders are stoked</h2>
            <p className="text-gray-400 text-lg">
              Hear from the community that makes TrickBook what it is.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={`star-${testimonial.name}-${i}`}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
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
              Up and riding in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-7 h-7 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">{step.description}</p>
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
                By Riders. <span className="text-yellow-400">For Riders.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Big tech platforms don't have our best interests at heart. Algorithms bury your
                content, and your attention is sold to advertisers. We built TrickBook because
                action sports communities deserve better.
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
                    <p className="text-white font-medium">Your data stays yours</p>
                    <p className="text-gray-500 text-sm">
                      Encrypted, private, never sold to advertisers.
                    </p>
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
                    <p className="text-white font-medium">No algorithm games</p>
                    <p className="text-gray-500 text-sm">
                      Your content reaches your crew, not just who pays.
                    </p>
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
                    <p className="text-white font-medium">Built by a small crew with big passion</p>
                    <p className="text-gray-500 text-sm">
                      Independent, rider-owned, community-driven.
                    </p>
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
                  There's an intrinsic value in creating something for the sake of creating it.
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-yellow-400/30" />
                  <div>
                    <p className="text-white font-medium">Rodney Mullen</p>
                    <p className="text-gray-500 text-sm">Godfather of Street Skateboarding</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to start tracking?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Join {stats ? formatNumber(stats.users) : '200'}+ riders already using TrickBook.
                It's free, it's private, and it's built for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {loggedIn ? (
                  <Link
                    href="/trickbook"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 !text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-300 hover:!text-[#1a1a1a] transition-colors no-underline"
                    onClick={() => trackCtaClick('go_to_trickbook', 'final_cta')}
                  >
                    Go to My TrickBook
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 !text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-300 hover:!text-[#1a1a1a] transition-colors no-underline"
                    onClick={() => trackCtaClick('create_free_account', 'final_cta')}
                  >
                    Create Free Account
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
