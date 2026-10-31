import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

// Real iPhone screenshots (public/features, 780x1688). Order follows the rider
// loop: learn -> track -> find a spot -> show up -> crew -> watch -> share.
const SCREENS = [
  { key: 'trickipedia', href: '/trickbook' },
  { key: 'tricklists', href: '/trickbook' },
  { key: 'spots', href: '/spots' },
  { key: 'events', href: '/events' },
  { key: 'shops', href: '/shops' },
  { key: 'homies', href: '/riders' },
  { key: 'pros', href: '/riders' },
  { key: 'couch', href: '/media?tab=couch' },
  { key: 'feed', href: '/media?tab=feed' },
];

const SCREEN_W = 780;
const SCREEN_H = 1688;

function PhoneFrame({ children, className = '', style }) {
  return (
    <div
      className={`rounded-[2.6rem] border border-white/15 bg-black p-[9px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)] ${className}`}
      style={style}
    >
      <div
        className="relative overflow-hidden rounded-[2.1rem] bg-[#111]"
        style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }}
      >
        {children}
      </div>
    </div>
  );
}

function StepCopy({ screenKey, href, t, index }) {
  return (
    <>
      <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
        <span className="tabular-nums text-gray-500">{String(index + 1).padStart(2, '0')}</span>
        {t(`showcase.${screenKey}.eyebrow`)}
      </p>
      <h3 className="mb-4 text-3xl font-black leading-[1.02] tracking-[-0.03em] md:text-5xl">
        {t(`showcase.${screenKey}.title`)}
      </h3>
      <p className="mb-6 max-w-md text-lg leading-relaxed text-gray-400">
        {t(`showcase.${screenKey}.text`)}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:text-yellow-300 hover:underline"
      >
        {t(`showcase.${screenKey}.cta`)} <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}

export default function FeatureShowcase() {
  const { t } = useTranslation('home');
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  // Desktop: whichever step crosses the middle of the viewport drives the phone.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop: sticky phone, copy scrolls past it */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16">
        <div>
          {SCREENS.map(({ key, href }, i) => (
            <div
              key={key}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-index={i}
              className={`flex min-h-[78vh] flex-col justify-center transition-opacity duration-500 motion-reduce:transition-none ${
                active === i ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <StepCopy screenKey={key} href={href} t={t} index={i} />
            </div>
          ))}
        </div>
        <div className="relative">
          {/* Full-height sticky column; the phone is sized to the viewport so it
              never runs off the bottom, and centred in its half to clear the
              Kaori launcher in the bottom-right corner. */}
          <div className="sticky top-0 flex h-screen flex-col items-center justify-center pt-20 pb-6">
            <div className="absolute inset-10 rounded-full bg-yellow-300/10 blur-[80px]" />
            <PhoneFrame
              className="relative"
              style={{ width: 'min(340px, calc((100vh - 10rem) * 0.46))' }}
            >
              {SCREENS.map(({ key }, i) => (
                <Image
                  key={key}
                  src={`/features/${key}.jpg`}
                  width={SCREEN_W}
                  height={SCREEN_H}
                  sizes="340px"
                  alt={t(`showcase.${key}.alt`)}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                    active === i ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden={active !== i}
                />
              ))}
            </PhoneFrame>
            <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
              {SCREENS.map(({ key }, i) => (
                <span
                  key={key}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active === i ? 'w-6 bg-yellow-300' : 'w-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet: swipeable row of phones */}
      <div className="-mx-4 lg:hidden">
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SCREENS.map(({ key, href }, i) => (
            <div key={key} className="w-[74vw] max-w-[300px] shrink-0 snap-center">
              <PhoneFrame className="mb-6">
                <Image
                  src={`/features/${key}.jpg`}
                  width={SCREEN_W}
                  height={SCREEN_H}
                  sizes="(max-width: 1024px) 74vw, 300px"
                  alt={t(`showcase.${key}.alt`)}
                  className="h-full w-full object-cover"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </PhoneFrame>
              <StepCopy screenKey={key} href={href} t={t} index={i} />
            </div>
          ))}
        </div>
        <p className="px-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
          {t('showcase.swipeHint')}
        </p>
      </div>
    </>
  );
}
