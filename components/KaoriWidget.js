import { Loader2, Send, Sparkles, Video, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { trackKaoriEvent } from '../lib/analytics';
import {
  getBotCompanions,
  getCompanionGreeting,
  getKaoriUsage,
  getMessages,
  sendMessage,
  startBotConversation,
} from '../lib/apiMessages';
import { connectMessagesSocket } from '../lib/socket';
import styles from './KaoriWidget.module.css';
import UserAvatar from './UserAvatar';

const GREETING_PREFIX = 'tb_kaori_widget_greeted_';
const PENDING_DRAFT_KEY = 'tb_kaori_widget_pending_draft';
const KAORI_AVATAR = {
  name: 'Kaori',
  imageUri: 'https://api.thetrickbook.com/assets/kaori-avatar.jpg',
};
const GUEST_OPENERS = [
  'Yo, what are you trying to land next? Drop the trick and I’ll help you dial it. 🏂',
  'What’s good, shredder? Tell me your sport and skill level — let’s build your next progression.',
  'Fresh tracks, fresh goals. You working on a trick, hunting a spot, or planning your next session?',
  'Ayo 👋 I’m Kaori. Got a clip to study, a trick to unlock, or a riding question? Send it.',
];

const isKaoriVoiceMessage = (text = '') =>
  /Kaori\s+voice:/i.test(text) || /https?:\/\/[^\s)]+kaori-voice[^\s)]*\.mp3/i.test(text);

const idString = (value) => value?.toString?.() || String(value || '');

async function loadKaoriChat(token) {
  const bots = await getBotCompanions(token);
  const companion = (bots || []).find(
    (bot) => (bot.botCharacter || bot.name || '').toLowerCase() === 'kaori',
  );
  if (!companion?._id) throw new Error('Kaori is unavailable right now.');

  const conversation = companion.existingConversationId
    ? { _id: companion.existingConversationId }
    : await startBotConversation(companion._id, token);
  const conversationId = idString(conversation._id || conversation.existingConversationId);
  if (!conversationId) throw new Error('Could not start a Kaori conversation.');

  const [history, usage] = await Promise.all([
    getMessages(conversationId, { page: 1, limit: 20 }, token),
    getKaoriUsage(token),
  ]);
  const greetingKey = `${GREETING_PREFIX}${conversationId}`;
  let greeting = '';
  if (!window.sessionStorage.getItem(greetingKey)) {
    const greetingData = await getCompanionGreeting(companion._id, token);
    greeting = greetingData?.greeting || '';
    if (greeting) window.sessionStorage.setItem(greetingKey, '1');
  }

  return {
    companion,
    conversationId,
    greeting,
    usage,
    messages: (history.messages || []).filter((message) => !isKaoriVoiceMessage(message.content)),
  };
}

// The component coordinates auth, realtime DM state, allowance state, and the compact UI in one surface.
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: splitting these coupled states would obscure the chat lifecycle.
export default function KaoriWidget() {
  const router = useRouter();
  const { loggedIn, token, userId } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [kaori, setKaori] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [usage, setUsage] = useState(null);
  const [guestOpenerIndex, setGuestOpenerIndex] = useState(0);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('');
  const scrollRef = useRef(null);
  const launcherTrackedRef = useRef(false);

  const hidden = useMemo(
    () => router.pathname === '/kaori-live' || router.pathname.startsWith('/admin'),
    [router.pathname],
  );

  useEffect(() => {
    if (hidden || loggedIn === null || launcherTrackedRef.current) return;
    launcherTrackedRef.current = true;
    trackKaoriEvent('kaori_launcher_viewed', { authenticated: loggedIn === true });
  }, [hidden, loggedIn]);

  useEffect(() => {
    setGuestOpenerIndex(Math.floor(Math.random() * GUEST_OPENERS.length));
    const timer = window.setInterval(
      () => setGuestOpenerIndex((current) => (current + 1) % GUEST_OPENERS.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loggedIn !== true) return;
    const pendingDraft = window.sessionStorage.getItem(PENDING_DRAFT_KEY);
    if (pendingDraft) {
      setDraft(pendingDraft);
      window.sessionStorage.removeItem(PENDING_DRAFT_KEY);
    }
    setShowAuthGate(false);
  }, [loggedIn]);

  useEffect(() => {
    if (!router.isReady || router.query.kaori !== 'open') return;
    setOpen(true);
    const nextQuery = { ...router.query };
    delete nextQuery.kaori;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    if (!open || !token || conversationId) return;

    let cancelled = false;
    const bootstrap = async () => {
      setLoading(true);
      setError('');
      try {
        const chat = await loadKaoriChat(token);
        if (cancelled) return;

        setKaori(chat.companion);
        setConversationId(chat.conversationId);
        setMessages(chat.messages);
        setGreeting(chat.greeting);
        setUsage(chat.usage);
      } catch (bootstrapError) {
        if (!cancelled) setError(bootstrapError?.message || 'Kaori is unavailable right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [conversationId, open, token]);

  useEffect(() => {
    if (!token || !conversationId) return;
    const socket = connectMessagesSocket(token);
    socket.emit('join:conversation', conversationId);

    const onMessage = ({ message }) => {
      if (idString(message?.conversationId) !== conversationId) return;
      if (idString(message?.senderId) === idString(userId)) return;
      if (isKaoriVoiceMessage(message?.content)) return;

      setMessages((current) =>
        current.some((item) => idString(item._id) === idString(message._id))
          ? current
          : [...current, message],
      );
      trackKaoriEvent('kaori_response_completed', {
        conversation_id: conversationId,
        response_length: message?.content?.length || 0,
      });
    };

    socket.on('message:new', onMessage);
    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.off('message:new', onMessage);
    };
  }, [conversationId, token, userId]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trackKaoriEvent('kaori_closed', { authenticated: loggedIn === true });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [loggedIn, open]);

  const openWidget = () => {
    setOpen(true);
    trackKaoriEvent('kaori_opened', { authenticated: loggedIn === true });
  };

  const closeWidget = () => {
    setOpen(false);
    trackKaoriEvent('kaori_closed', { authenticated: loggedIn === true });
  };

  const handleSso = (provider) => {
    setSsoProvider(provider);
    trackKaoriEvent('kaori_sso_clicked', { provider });
    const callbackUrl = '/profile?kaori=open';
    signIn(provider, { callbackUrl });
  };

  const handleLive = () => {
    trackKaoriEvent('kaori_live_clicked', { conversation_id: conversationId || null });
    router.push('/kaori-live?source=widget');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    if (loggedIn === false) {
      window.sessionStorage.setItem(PENDING_DRAFT_KEY, content);
      setShowAuthGate(true);
      trackKaoriEvent('kaori_account_wall_viewed', {
        opener_index: guestOpenerIndex,
        draft_length: content.length,
      });
      return;
    }
    if (!conversationId) return;

    const optimisticId = `widget-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      conversationId,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setDraft('');
    setError('');
    setSending(true);
    setMessages((current) => [...current, optimisticMessage]);
    trackKaoriEvent('kaori_message_sent', {
      conversation_id: conversationId,
      message_length: content.length,
    });

    try {
      const savedMessage = await sendMessage(conversationId, content, token);
      setMessages((current) =>
        current.map((message) => (message._id === optimisticId ? savedMessage : message)),
      );
      setUsage((current) =>
        current?.text
          ? {
              ...current,
              text: {
                ...current.text,
                used: current.text.used + 1,
                remaining: Math.max(0, current.text.remaining - 1),
              },
            }
          : current,
      );
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message._id !== optimisticId));
      setDraft(content);
      const exhausted = sendError?.response?.status === 402;
      if (exhausted) {
        setUsage((current) =>
          current?.text
            ? { ...current, upgradeRequired: true, text: { ...current.text, remaining: 0 } }
            : current,
        );
        setError('You’ve used today’s Kaori messages. Upgrade for more, or come back after reset.');
        trackKaoriEvent('kaori_paywall_viewed', { conversation_id: conversationId });
      } else {
        setError('That message did not send. Your draft is still here.');
      }
      trackKaoriEvent('kaori_message_failed', {
        conversation_id: conversationId,
        status: sendError?.response?.status || null,
      });
    } finally {
      setSending(false);
    }
  };

  if (hidden) return null;

  return (
    <div className={styles.root}>
      {open && (
        <section className={styles.panel} aria-label="Chat with Kaori">
          <header className={styles.header}>
            <div className={styles.identity}>
              <UserAvatar user={kaori || KAORI_AVATAR} size={38} showBadge={false} />
              <div>
                <div className={styles.titleRow}>
                  <strong>Kaori</strong>
                  <span className={styles.aiBadge}>AI</span>
                </div>
                <span className={styles.subtitle}>Your action-sports expert</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={closeWidget}
              aria-label="Close Kaori chat"
            >
              <X size={19} />
            </button>
          </header>

          {loggedIn === false ? (
            <>
              <div className={styles.messages} aria-live="polite">
                <MessageBubble content={GUEST_OPENERS[guestOpenerIndex]} mine={false} />
                <p className={styles.guestHint}>
                  Reply to Kaori — creating an account is one click.
                </p>
              </div>
              <form className={styles.composer} onSubmit={handleSend}>
                <label className="sr-only" htmlFor="kaori-widget-guest-message">
                  Reply to Kaori
                </label>
                <textarea
                  id="kaori-widget-guest-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  placeholder="Tell Kaori what you’re working on…"
                  maxLength={2000}
                  rows={1}
                />
                <button type="submit" aria-label="Reply to Kaori" disabled={!draft.trim()}>
                  <Send size={18} />
                </button>
              </form>
              {showAuthGate && (
                <div
                  className={styles.authGate}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="kaori-auth-title"
                >
                  <button
                    type="button"
                    className={styles.authGateClose}
                    onClick={() => setShowAuthGate(false)}
                    aria-label="Close sign in"
                  >
                    <X size={18} />
                  </button>
                  <UserAvatar user={KAORI_AVATAR} size={58} showBadge={false} />
                  <Sparkles size={20} />
                  <h2 id="kaori-auth-title">Save your line and ride with me</h2>
                  <p>Your reply is ready. Sign in or create a free TrickBook account to send it.</p>
                  <button
                    type="button"
                    className={styles.googleButton}
                    onClick={() => handleSso('google')}
                    disabled={Boolean(ssoProvider)}
                  >
                    {ssoProvider === 'google' ? (
                      <Loader2 className={styles.spin} size={18} />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className={styles.appleButton}
                    onClick={() => handleSso('apple')}
                    disabled={Boolean(ssoProvider)}
                  >
                    {ssoProvider === 'apple' ? (
                      <Loader2 className={styles.spin} size={18} />
                    ) : (
                      <AppleIcon />
                    )}
                    Continue with Apple
                  </button>
                  <button
                    type="button"
                    className={styles.emailLink}
                    onClick={() => router.push('/login?callbackUrl=%2Fprofile%3Fkaori%3Dopen')}
                  >
                    Use email instead
                  </button>
                  <small>Free to join · your draft stays ready</small>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.messages} aria-live="polite">
                {loading && (
                  <div className={styles.centerState}>
                    <Loader2 className={styles.spin} size={24} />
                    Connecting to Kaori…
                  </div>
                )}
                {!loading && greeting && <MessageBubble content={greeting} mine={false} />}
                {!loading && messages.length === 0 && !greeting && !error && (
                  <MessageBubble
                    content="Hey — I’m Kaori. What are you riding, and what are you working on?"
                    mine={false}
                  />
                )}
                {messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    content={message.content}
                    mine={idString(message.senderId) === idString(userId)}
                    sending={message.status === 'sending'}
                  />
                ))}
                {error && (
                  <div className={styles.error} role="alert">
                    {error}
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.liveButton}
                  onClick={handleLive}
                  disabled={!token || usage?.voice?.remaining === 0}
                  title={usage?.voice?.remaining === 0 ? 'Voice allowance used' : undefined}
                >
                  <Video size={16} /> Video chat <span>Beta</span>
                </button>
                {usage?.text && (
                  <span className={styles.allowance}>
                    {usage.text.remaining} text · {usage.voice?.remaining ?? 0} voice left
                  </span>
                )}
              </div>

              {usage?.upgradeRequired && (
                <div className={styles.paywall}>
                  <div>
                    <strong>Keep riding with Kaori</strong>
                    <span>Upgrade to TrickBook Plus for a larger daily allowance.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      trackKaoriEvent('kaori_upgrade_clicked', { conversation_id: conversationId });
                      router.push('/settings?tab=billing&source=kaori');
                    }}
                  >
                    Upgrade
                  </button>
                </div>
              )}

              <form className={styles.composer} onSubmit={handleSend}>
                <label className="sr-only" htmlFor="kaori-widget-message">
                  Message Kaori
                </label>
                <textarea
                  id="kaori-widget-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  placeholder="Ask Kaori anything…"
                  maxLength={2000}
                  rows={1}
                  disabled={loading || sending || !conversationId || usage?.text?.remaining === 0}
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={
                    !draft.trim() || sending || !conversationId || usage?.text?.remaining === 0
                  }
                >
                  {sending ? <Loader2 className={styles.spin} size={18} /> : <Send size={18} />}
                </button>
              </form>
            </>
          )}
        </section>
      )}

      {!open && (
        <button
          type="button"
          className={styles.launcher}
          onClick={openWidget}
          aria-label="Chat with Kaori"
        >
          <span className={styles.launcherAvatar}>
            <UserAvatar user={kaori || KAORI_AVATAR} size={40} showBadge={false} />
          </span>
          <span>Ask Kaori</span>
          <i aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.24 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.52H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 16.11A6.6 6.6 0 0 1 5.49 14c0-.73.13-1.44.35-2.1V9.07H2.18A11 11 0 0 0 1 14c0 1.78.43 3.45 1.18 4.95l3.66-2.84Z"
        transform="translate(0 -2)"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  );
}

function MessageBubble({ content, mine, sending }) {
  return (
    <div className={`${styles.messageRow} ${mine ? styles.mine : ''}`}>
      <div className={`${styles.bubble} ${mine ? styles.mineBubble : styles.kaoriBubble}`}>
        <LinkifiedText content={content} />
        {sending && <Loader2 className={styles.inlineSpin} size={12} aria-label="Sending" />}
      </div>
    </div>
  );
}

function LinkifiedText({ content = '' }) {
  const parts = content.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+)/g);
  let offset = 0;
  return parts.map((part) => {
    const partOffset = offset;
    offset += part.length;
    const markdown = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    const href = markdown?.[2] || (part.startsWith('http') ? part.replace(/[),.!?]+$/, '') : '');
    if (!href) return part;
    return (
      <a
        className={styles.messageLink}
        href={href}
        key={`${href}-${partOffset}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {markdown?.[1] || href}
      </a>
    );
  });
}
