import { Loader2, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { addVideoComment, deleteVideoComment, getVideoComments } from '../../lib/apiMedia';
import UserAvatar from '../UserAvatar';

const formatDate = (value) => {
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function CouchComments({ videoId, initialCount = 0, onCountChange }) {
  const { token, loggedIn, userId, name, imageUri, role } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError('');
      try {
        const result = await getVideoComments(videoId, { page: nextPage, limit: 20 });
        setComments((current) =>
          nextPage === 1 ? result.comments || [] : [...current, ...(result.comments || [])],
        );
        setPage(nextPage);
        setHasMore(Boolean(result.pagination?.hasMore));
      } catch {
        setError('Comments could not be loaded.');
      } finally {
        setLoading(false);
      }
    },
    [videoId],
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitComment = async (event) => {
    event.preventDefault();
    const text = content.trim();
    if (!text || !token || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const saved = await addVideoComment(videoId, text, token);
      const comment = {
        ...saved,
        user: { _id: userId, name: name || 'Rider', imageUri: imageUri || null },
      };
      setComments((current) => [comment, ...current]);
      setContent('');
      onCountChange?.(initialCount + 1);
    } catch {
      setError('Your comment was not posted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeComment = async (comment) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteVideoComment(videoId, comment._id, token);
      setComments((current) => current.filter((item) => item._id !== comment._id));
      onCountChange?.(Math.max(0, initialCount - 1));
    } catch {
      setError('The comment could not be deleted.');
    }
  };

  return (
    <section
      id="comments"
      className="mt-12 border-t border-border pt-10"
      aria-labelledby="comments-heading"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-500">The Couch</p>
          <h2 id="comments-heading" className="mt-1 text-3xl font-black">
            Comments <span className="text-muted-foreground">{initialCount}</span>
          </h2>
        </div>
      </div>

      {loggedIn ? (
        <form onSubmit={submitComment} className="mb-8 flex items-start gap-3">
          <UserAvatar user={{ name, imageUri }} size={42} showBadge={false} />
          <div className="flex-1">
            <label htmlFor="couch-comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="couch-comment"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="What did you think of this film?"
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{content.length}/2000</span>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <Link href="/login" className="font-bold text-yellow-500 hover:text-yellow-400">
            Log in
          </Link>{' '}
          to join the conversation.
        </div>
      )}

      {error && (
        <p className="mb-5 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {loading && comments.length === 0 ? (
        <div className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const canDelete =
              token && (String(comment.userId) === String(userId) || role === 'admin');
            return (
              <article
                key={comment._id}
                className="flex gap-3 rounded-xl border border-border bg-card p-4"
              >
                <UserAvatar user={comment.user} size={40} showBadge={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold">{comment.user?.name || 'TrickBook rider'}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => removeComment(comment)}
                        className="text-muted-foreground hover:text-red-400"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                    {comment.content}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => loadComments(page + 1)}
          disabled={loading}
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-yellow-500 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load more comments'}
        </button>
      )}
    </section>
  );
}
