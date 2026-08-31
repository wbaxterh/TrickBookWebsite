import {
  Check,
  Copy,
  ExternalLink,
  ListPlus,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Star,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { getMyHomies } from '../../lib/apiHomies';
import { sendSharedContent, startConversation } from '../../lib/apiMessages';
import { addSpotToList, createSpotList, generateSpotSlug, getSpotLists } from '../../lib/apiSpots';
import UserAvatar from '../UserAvatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

const CATEGORY_COLORS = {
  park: '#22c55e',
  street: '#f59e0b',
  backcountry: '#0ea5e9',
  resort: '#a855f7',
  indoor: '#3b82f6',
  diy: '#ef4444',
  other: '#8b5cf6',
};

function locationOf(spot) {
  return [spot.city, spot.state, spot.country].filter(Boolean).join(', ');
}

function detailHref(spot) {
  const slug = generateSpotSlug(spot.name || 'spot');
  const stateSlug = (spot.state || 'unknown').toLowerCase().replace(/\s+/g, '-');
  return `/spots/${stateSlug}/${slug}?id=${spot._id}`;
}

/**
 * SpotDetailPanel — the spot preview that loads *below the map* when a pin is
 * clicked. Provides quick actions: add to a list, or share with homies (DM).
 */
export default function SpotDetailPanel({ spot, onClose }) {
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const location = locationOf(spot);
  const catColor = CATEGORY_COLORS[spot.category] || '#8b5cf6';

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close spot preview"
        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-64 lg:w-80 shrink-0">
          {spot.imageURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spot.imageURL}
              alt={spot.name}
              className="h-44 w-full md:h-full object-cover"
            />
          ) : (
            <div className="h-44 w-full md:h-full min-h-[176px] bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {spot.category && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-white capitalize"
                style={{ backgroundColor: catColor }}
              >
                {spot.category}
              </span>
            )}
            {typeof spot.rating === 'number' && spot.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {spot.rating.toFixed(1)}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground truncate pr-8">{spot.name}</h2>
          {location && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 text-yellow-500 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}

          {spot.sportTypes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {spot.sportTypes.slice(0, 4).map((s) => (
                <Badge key={s} variant="secondary" className="capitalize text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {spot.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{spot.description}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <ListPlus className="h-4 w-4 mr-1.5" />
              Add to list
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4 mr-1.5" />
              Share with homies
            </Button>
            <Link href={detailHref(spot)} className="no-underline">
              <Button size="sm" variant="ghost">
                View details
                <ExternalLink className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AddToListDialog spot={spot} open={addOpen} onOpenChange={setAddOpen} />
      <ShareSpotDialog spot={spot} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}

/** Dialog to add the spot to one (or more) of the user's spot lists. */
function AddToListDialog({ spot, open, onOpenChange }) {
  const { token, loggedIn } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !loggedIn) return;
    setError('');
    setAddedIds(new Set());
    setLoading(true);
    getSpotLists(token)
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load your lists'))
      .finally(() => setLoading(false));
  }, [open, loggedIn, token]);

  const markAdded = (id) => setAddedIds((prev) => new Set(prev).add(id));

  const handleAdd = async (list) => {
    setBusyId(list._id);
    setError('');
    try {
      await addSpotToList(list._id, spot._id, token);
      markAdded(list._id);
    } catch (_e) {
      setError('Could not add to that list');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError('');
    try {
      const created = await createSpotList(name, '', token);
      if (created?._id) {
        await addSpotToList(created._id, spot._id, token);
        setLists((prev) => [created, ...prev]);
        markAdded(created._id);
        setNewName('');
      }
    } catch (_e) {
      setError('Could not create the list');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add “{spot.name}” to a list</DialogTitle>
        </DialogHeader>

        {!loggedIn ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">Log in to save spots to your lists.</p>
            <Link href="/login?redirect=/spots">
              <Button>Log in</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create new list */}
            <div className="flex gap-2">
              <Input
                placeholder="New list name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              />
              <Button onClick={handleCreateAndAdd} disabled={!newName.trim() || creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Existing lists */}
            <div className="max-h-64 overflow-y-auto -mx-1 px-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                </div>
              ) : lists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No lists yet — create one above.
                </p>
              ) : (
                <ul className="space-y-1">
                  {lists.map((list) => {
                    const added = addedIds.has(list._id);
                    const count = list.spotCount ?? list.spotIds?.length ?? 0;
                    return (
                      <li key={list._id}>
                        <button
                          type="button"
                          onClick={() => !added && handleAdd(list)}
                          disabled={added || busyId === list._id}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-yellow-500 transition-colors text-left disabled:opacity-100"
                        >
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground truncate">
                              {list.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {count} spot{count !== 1 ? 's' : ''}
                            </span>
                          </span>
                          {added ? (
                            <span className="flex items-center gap-1 text-sm text-green-500 shrink-0">
                              <Check className="h-4 w-4" /> Added
                            </span>
                          ) : busyId === list._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 text-yellow-500 shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** A single circular share-target button (native share, X, Facebook, …). */
function ShareTarget({ label, bg, icon: Icon, char, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
      aria-label={label}
    >
      <span
        className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105"
        style={{ backgroundColor: bg }}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-lg font-bold">{char}</span>}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

/**
 * Share sheet: copy link, native OS share, popular third-party targets (for
 * growth), and direct in-app share to homies via DM.
 */
function ShareSpotDialog({ spot, open, onOpenChange }) {
  const { token, loggedIn } = useContext(AuthContext);
  const [homies, setHomies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Detect Web Share support on the client only (avoids SSR hydration mismatch).
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!open) return;
    setError('');
    setSelected(new Set());
    setSentCount(0);
    setQuery('');
    setCopied(false);
    if (!loggedIn) return;
    setLoading(true);
    getMyHomies(token)
      .then((data) => setHomies(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load your homies'))
      .finally(() => setLoading(false));
  }, [open, loggedIn, token]);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${detailHref(spot)}`
      : detailHref(spot);
  const shareText = `Check out ${spot.name} on TrickBook`;
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(shareText);

  const socials = [
    {
      key: 'x',
      label: 'X',
      bg: '#000000',
      char: '𝕏',
      href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`,
    },
    {
      key: 'fb',
      label: 'Facebook',
      bg: '#1877F2',
      char: 'f',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    },
    {
      key: 'wa',
      label: 'WhatsApp',
      bg: '#25D366',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      key: 'reddit',
      label: 'Reddit',
      bg: '#FF4500',
      char: 'r',
      href: `https://www.reddit.com/submit?url=${encUrl}&title=${encodeURIComponent(spot.name)}`,
    },
    {
      key: 'email',
      label: 'Email',
      bg: '#6b7280',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(spot.name)}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_e) {
      setError('Could not copy the link');
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: spot.name, text: shareText, url: shareUrl });
    } catch (_e) {
      /* user dismissed the share sheet — no-op */
    }
  };

  const openExternal = (href) => window.open(href, '_blank', 'noopener,noreferrer');

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filtered = homies.filter((h) =>
    (h.name || '').toLowerCase().includes(query.trim().toLowerCase()),
  );

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    setError('');
    const preview = {
      title: spot.name,
      subtitle: locationOf(spot) || undefined,
      thumbnailUrl: spot.imageURL || undefined,
      sportType: spot.sportTypes?.[0],
    };
    let ok = 0;
    try {
      for (const homieId of selected) {
        const conv = await startConversation(homieId, token);
        if (conv?._id) {
          await sendSharedContent(
            conv._id,
            { contentType: 'spot', contentId: spot._id, preview },
            '',
            token,
          );
          ok += 1;
        }
      }
      setSentCount(ok);
    } catch (_e) {
      setError('Something went wrong sending the spot');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share “{spot.name}”</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="text-xs text-muted-foreground"
            />
            <Button variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5 text-green-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" /> Copy
                </>
              )}
            </Button>
          </div>

          {/* Third-party share targets */}
          <div className="flex flex-wrap gap-4 justify-items-center">
            {canNativeShare && (
              <ShareTarget label="More" bg="#3b82f6" icon={Share2} onClick={handleNativeShare} />
            )}
            {socials.map((s) => (
              <ShareTarget
                key={s.key}
                label={s.label}
                bg={s.bg}
                icon={s.icon}
                char={s.char}
                onClick={() => openExternal(s.href)}
              />
            ))}
          </div>

          {/* In-app: send to homies */}
          <div className="pt-3 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Send to homies</p>
            {error && <p className="text-sm text-destructive mb-2">{error}</p>}
            {!loggedIn ? (
              <p className="text-sm text-muted-foreground">
                <Link href="/login?redirect=/spots" className="text-yellow-500 hover:underline">
                  Log in
                </Link>{' '}
                to send this spot straight to your homies in the app.
              </p>
            ) : sentCount > 0 ? (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  Sent to {sentCount} homie{sentCount !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search homies…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto -mx-1 px-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {homies.length === 0 ? 'No homies yet.' : 'No homies match that search.'}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filtered.map((h) => {
                        const isSel = selected.has(h._id);
                        return (
                          <li key={h._id}>
                            <button
                              type="button"
                              onClick={() => toggle(h._id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                                isSel
                                  ? 'border-yellow-500 bg-yellow-500/10'
                                  : 'border-border hover:border-yellow-500'
                              }`}
                            >
                              <UserAvatar user={h} size={36} />
                              <span className="flex-1 min-w-0 font-medium text-foreground truncate">
                                {h.name}
                              </span>
                              <span
                                className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSel ? 'bg-yellow-500 border-yellow-500' : 'border-border'
                                }`}
                              >
                                {isSel && <Check className="h-3.5 w-3.5 text-black" />}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleSend}
                  disabled={selected.size === 0 || sending}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Send${selected.size ? ` to ${selected.size}` : ''}`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
