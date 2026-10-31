import { ArrowRight, Loader2, MapPin, MessageCircle, Mic } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import UserAvatar from '../components/UserAvatar';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { getKaoriUsage } from '../lib/apiMessages';
import { createCheckoutSession, getSubscription } from '../lib/apiPayments';
import usePlus from '../lib/usePlus';

// Free-tier numbers mirror TB-Backend middleware/subscription.js FREE_TIER_LIMITS
// and services/kaoriUsage.js LIMITS — keep them in sync.
const FREE = { lists: 3, spots: 15, kaoriText: 20, kaoriVoice: '5/day' };
const PLUS = { kaoriText: 250, kaoriVoice: '200/mo' };

function Jump({ from, to, unit }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-2xl font-bold text-gray-500 line-through decoration-2">{from}</span>
      <ArrowRight className="h-5 w-5 shrink-0 self-center text-gray-500" />
      <span className="text-5xl font-black tracking-[-0.04em] text-yellow-300 md:text-6xl">
        {to}
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.14em] text-gray-400">{unit}</span>
    </div>
  );
}

function PerkRow({ eyebrow, jump, detail, live, action }) {
  return (
    <div className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-[1.3fr_1fr_auto] md:items-center md:gap-10">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
          {eyebrow}
        </p>
        {jump}
        <p className="mt-3 max-w-md text-gray-300">{detail}</p>
      </div>
      <div className="text-sm text-gray-400">{live}</div>
      <div>{action}</div>
    </div>
  );
}

const actionClass =
  'inline-flex items-center gap-2 rounded-full bg-yellow-300 px-6 py-3 text-sm font-black text-[#080908] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300';

export default function PlusPage() {
  const router = useRouter();
  const { loggedIn, token, name, imageUri, userId } = useContext(AuthContext);
  const { isPlus, usage, loading, refresh } = usePlus();
  const [kaori, setKaori] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const welcome = router.query.welcome === '1';

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    // Always re-read here: this is where buyers land straight from checkout.
    refresh();
    getKaoriUsage(token)
      .then(setKaori)
      .catch(() => {});
    getSubscription(token)
      .then((data) => setSubscription(data?.subscription || null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, token]);

  const startCheckout = async () => {
    setCheckingOut(true);
    try {
      const response = await createCheckoutSession(token);
      if (response?.url) window.location.href = response.url;
      else setCheckingOut(false);
    } catch (_err) {
      setCheckingOut(false);
    }
  };

  const openKaori = () =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, kaori: 'open' } },
      undefined,
      {
        shallow: true,
      },
    );

  if (loggedIn !== true || (loading && !usage)) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#080908] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
      </main>
    );
  }

  const avatarUser = {
    name,
    imageUri: imageUri && imageUri !== '/default-profile.png' ? imageUri : null,
    subscription: isPlus ? { plan: 'premium', status: 'active' } : undefined,
  };
  const renews = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <Head>
        <title>{isPlus ? 'Your TrickBook Plus' : 'TrickBook Plus'} | TrickBook</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="bg-[#080908] text-white">
        <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(250,204,21,0.16),transparent_45%)]" />
          <div className="relative container mx-auto px-4">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-200">
              <VerifiedBadge size="sm" /> TrickBook Plus
            </div>
            <h1 className="mb-6 text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.06em]">
              {isPlus ? (
                welcome ? (
                  <>
                    You're in.
                    <span className="block text-yellow-300">Go ride.</span>
                  </>
                ) : (
                  <>
                    Your Plus
                    <span className="block text-yellow-300">perks.</span>
                  </>
                )
              ) : (
                <>
                  Ride without
                  <span className="block text-yellow-300">limits.</span>
                </>
              )}
            </h1>
            <p className="mb-10 max-w-xl text-lg text-gray-300 md:text-xl">
              {isPlus
                ? welcome
                  ? 'Everything below unlocked the second your payment cleared. Pick one and use it right now.'
                  : 'Everything Plus unlocks, and how much of it you are using.'
                : 'More Kaori, unlimited spot lists, and the verified check. $10 a month, cancel anytime.'}
            </p>
            {isPlus ? (
              <div className="flex items-center gap-4">
                <UserAvatar user={avatarUser} size={64} />
                <div>
                  <p className="mb-0 flex items-center gap-2 text-xl font-black">
                    {name || 'You'} <VerifiedBadge size="md" />
                  </p>
                  <p className="mb-0 text-sm text-gray-400">
                    {renews ? `Plus member · renews ${renews}` : 'Plus member'}
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkingOut}
                className={actionClass}
              >
                {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Get Plus · $10/mo
              </button>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <PerkRow
            eyebrow="Kaori"
            jump={<Jump from={FREE.kaoriText} to={PLUS.kaoriText} unit="messages a day" />}
            detail={`Voice chat jumps from ${FREE.kaoriVoice} to ${PLUS.kaoriVoice}. Ask her about a trick, a spot, or your next session.`}
            live={
              kaori?.text ? (
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> {kaori.text.used} / {kaori.text.limit}{' '}
                    messages today
                  </span>
                  {kaori.voice && (
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4" /> {kaori.voice.used} / {kaori.voice.limit} voice
                    </span>
                  )}
                </span>
              ) : null
            }
            action={
              <button type="button" onClick={openKaori} className={actionClass}>
                Talk to Kaori <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
          <PerkRow
            eyebrow="Spot lists"
            jump={<Jump from={FREE.lists} to="∞" unit="lists" />}
            detail={`No more ${FREE.spots}-spot cap. Save every spot you ride and build lists for every trip.`}
            live={
              usage ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {usage.spotListsCount} lists ·{' '}
                  {usage.totalSpotsCount} spots saved
                </span>
              ) : null
            }
            action={
              <Link href="/my-spots" className={actionClass}>
                Build a list <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <PerkRow
            eyebrow="Verified"
            jump={
              <div className="flex items-center gap-4">
                <UserAvatar
                  user={{ ...avatarUser, subscription: { plan: 'premium', status: 'active' } }}
                  size={56}
                />
                <span className="text-3xl font-black tracking-[-0.03em]">
                  {name || 'You'} <VerifiedBadge size="lg" className="ml-1 align-middle" />
                </span>
              </div>
            }
            detail="The blue check shows next to your name on your profile, in messages, and across the feed."
            live={null}
            action={
              <Link href={userId ? `/profile/${userId}` : '/profile'} className={actionClass}>
                See your profile <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-400">
            <span>
              {isPlus
                ? 'Receipts, card, and cancellation live in billing.'
                : 'Billed monthly through Stripe. Cancel anytime from settings.'}
            </span>
            <Link
              href="/settings?tab=billing"
              className="font-bold text-white underline-offset-4 hover:underline"
            >
              {isPlus ? 'Manage billing' : 'Billing settings'}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
