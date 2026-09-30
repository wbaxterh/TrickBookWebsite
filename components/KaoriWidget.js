import { Bot, Loader2, MessageCircle, Send, Sparkles, Video, X } from 'lucide-react';
import { useRouter } from 'next/router';
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

  const handleLogin = () => {
    trackKaoriEvent('kaori_login_clicked');
    const callbackUrl = '/profile?kaori=open';
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleLive = () => {
    trackKaoriEvent('kaori_live_clicked', { conversation_id: conversationId || null });
    router.push('/kaori-live?source=widget');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending || !conversationId) return;

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
              {kaori ? (
                <UserAvatar user={kaori} size={38} showBadge={false} />
              ) : (
                <span className={styles.avatarFallback}>
                  <Bot size={20} />
                </span>
              )}
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
            <div className={styles.locked}>
              <Sparkles size={30} />
              <h2>Ride smarter with Kaori</h2>
              <p>
                Log in to ask about tricks, progression, spots, films, events, and your TrickBook
                goals.
              </p>
              <button type="button" className={styles.primaryButton} onClick={handleLogin}>
                Log in to chat
              </button>
            </div>
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
          <MessageCircle size={22} />
          <span>Ask Kaori</span>
          <i aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function MessageBubble({ content, mine, sending }) {
  return (
    <div className={`${styles.messageRow} ${mine ? styles.mine : ''}`}>
      <div className={`${styles.bubble} ${mine ? styles.mineBubble : styles.kaoriBubble}`}>
        {content}
        {sending && <Loader2 className={styles.inlineSpin} size={12} aria-label="Sending" />}
      </div>
    </div>
  );
}
