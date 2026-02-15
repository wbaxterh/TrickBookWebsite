import { Loader2, MessageCircle, Plus, Search, User, X } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { getMyHomies } from '../../lib/apiHomies';
import { getConversations, startConversation } from '../../lib/apiMessages';
import { connectMessagesSocket } from '../../lib/socket';

export default function Messages() {
  const { token, loggedIn, userId } = useContext(AuthContext);
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  // New message modal state
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [homies, setHomies] = useState([]);
  const [loadingHomies, setLoadingHomies] = useState(false);
  const [startingConversation, setStartingConversation] = useState(null);
  const [homiesSearchQuery, setHomiesSearchQuery] = useState('');

  const loadConversations = async () => {
    try {
      const data = await getConversations(token);
      setConversations(data || []);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = connectMessagesSocket(token);

    // Listen for new messages to update conversation list
    socket.on('message:new', ({ message, conversation }) => {
      setConversations((prev) => {
        // Find and update the conversation
        const exists = prev.find((c) => c._id === conversation._id);
        if (exists) {
          // Move to top and update last message
          const updated = prev.filter((c) => c._id !== conversation._id);
          return [
            {
              ...exists,
              lastMessage: conversation.lastMessage,
              unreadCount: (exists.unreadCount || 0) + 1,
            },
            ...updated,
          ];
        }
        // New conversation - reload to get full data
        loadConversations();
        return prev;
      });
    });

    // Listen for read receipts
    socket.on('messages:read', ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c)),
      );
    });

    return () => {
      socket.off('message:new');
      socket.off('messages:read');
    };
  };

  useEffect(() => {
    if (loggedIn === false) {
      router.push('/login');
      return;
    }

    if (token) {
      loadConversations();
      setupSocket();
    }
  }, [token, loggedIn, loadConversations, router.push, setupSocket]);

  // Load homies when modal opens
  const loadHomies = async () => {
    if (homies.length > 0) return; // Already loaded
    setLoadingHomies(true);
    try {
      const data = await getMyHomies(token);
      setHomies(data || []);
    } catch (_error) {
    } finally {
      setLoadingHomies(false);
    }
  };

  // Start conversation with a homie
  const handleStartConversation = async (homieId) => {
    setStartingConversation(homieId);
    try {
      const conversation = await startConversation(homieId, token);
      // Redirect to the conversation
      router.push(`/messages/${conversation._id}`);
    } catch (_error) {
      alert('Failed to start conversation. Please try again.');
    } finally {
      setStartingConversation(null);
    }
  };

  // Open modal and load homies
  const openNewMessageModal = () => {
    setShowNewMessageModal(true);
    loadHomies();
  };

  // Filter homies by search
  const filteredHomies = homies.filter((homie) => {
    if (!homiesSearchQuery) return true;
    const name = homie.name?.toLowerCase() || '';
    return name.includes(homiesSearchQuery.toLowerCase());
  });

  // Filter out homies that already have conversations
  const _homiesWithoutConversations = filteredHomies.filter((homie) => {
    const homieId = homie._id || homie.id;
    return !conversations.some((convo) => {
      const otherUserId = convo.otherUser?._id || convo.otherUser?.id;
      return otherUserId === homieId;
    });
  });

  const filteredConversations = conversations.filter((convo) => {
    if (!searchQuery) return true;
    const name = convo.otherUser?.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString();
  };

  // Show loading while checking auth
  if (loggedIn === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  // Redirect handled in useEffect, but show loading in meantime
  if (loggedIn === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages | The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="Direct messages with your homies" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <button
              onClick={openNewMessageModal}
              className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Message
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-all duration-200 ease-out ${
                searchFocused || searchQuery
                  ? 'opacity-0 -translate-x-2'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Search conversations...</span>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200"
            />
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start a conversation with your homies'}
              </p>
              {!searchQuery && (
                <button
                  onClick={openNewMessageModal}
                  className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Message
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((convo) => (
                <Link
                  key={convo._id}
                  href={`/messages/${convo._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-yellow-500/50 transition-all"
                >
                  {/* Avatar */}
                  {convo.otherUser?.imageUri ? (
                    <Image
                      src={convo.otherUser.imageUri}
                      alt={convo.otherUser.name || 'User'}
                      width={52}
                      height={52}
                      className="rounded-full object-cover flex-shrink-0"
                      style={{ width: 52, height: 52 }}
                    />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p
                        className={`font-medium truncate ${
                          convo.unreadCount > 0 ? 'text-foreground' : 'text-foreground'
                        }`}
                      >
                        {convo.otherUser?.name || 'Unknown'}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(convo.lastMessage?.createdAt)}
                      </span>
                    </div>
                    {convo.lastMessage && (
                      <p
                        className={`text-sm truncate ${
                          convo.unreadCount > 0
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {convo.lastMessage.senderId === userId ? (
                          <span className="text-muted-foreground">You: </span>
                        ) : null}
                        {convo.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {convo.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center inline-block">
                        {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewMessageModal(false)}
        >
          <div
            className="bg-card border border-border rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">New Message</h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search homies..."
                  value={homiesSearchQuery}
                  onChange={(e) => setHomiesSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                />
              </div>
            </div>

            {/* Homies List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loadingHomies ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                </div>
              ) : filteredHomies.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {homiesSearchQuery ? 'No homies found' : "You don't have any homies yet"}
                  </p>
                  {!homiesSearchQuery && (
                    <Link
                      href="/homies"
                      className="text-yellow-500 hover:text-yellow-400 text-sm"
                      onClick={() => setShowNewMessageModal(false)}
                    >
                      Find Homies
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredHomies.map((homie) => {
                    const homieId = homie._id || homie.id;
                    const hasExistingConversation = conversations.some((convo) => {
                      const otherUserId = convo.otherUser?._id || convo.otherUser?.id;
                      return otherUserId === homieId;
                    });

                    return (
                      <button
                        key={homieId}
                        onClick={() => {
                          if (hasExistingConversation) {
                            // Find and go to existing conversation
                            const existingConvo = conversations.find((convo) => {
                              const otherUserId = convo.otherUser?._id || convo.otherUser?.id;
                              return otherUserId === homieId;
                            });
                            if (existingConvo) {
                              router.push(`/messages/${existingConvo._id}`);
                            }
                          } else {
                            handleStartConversation(homieId);
                          }
                        }}
                        disabled={startingConversation === homieId}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {/* Avatar */}
                        {homie.imageUri ? (
                          <Image
                            src={homie.imageUri}
                            alt={homie.name || 'User'}
                            width={44}
                            height={44}
                            className="rounded-full object-cover flex-shrink-0"
                            style={{ width: 44, height: 44 }}
                          />
                        ) : (
                          <div className="w-[44px] h-[44px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        {/* Name */}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{homie.name || 'Unknown'}</p>
                          {hasExistingConversation && (
                            <p className="text-xs text-muted-foreground">Existing conversation</p>
                          )}
                        </div>

                        {/* Loading indicator */}
                        {startingConversation === homieId && (
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
