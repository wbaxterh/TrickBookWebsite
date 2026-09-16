import { ChevronDown, ChevronUp, Heart, Loader2, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { trackShopCommentAdded } from '../../lib/analytics';
import {
  addShopComment,
  deleteShopComment,
  getShopCommentReplies,
  getShopComments,
  loveShopComment,
} from '../../lib/apiShops';
import UserAvatar from '../UserAvatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export default function ShopCommentSection({ shop }) {
  const { token, user, loggedIn } = useContext(AuthContext);
  const userId = user?.userId || user?._id;
  const shopId = shop?.slug || shop?._id;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadComments = useCallback(
    async (pageNum = 1) => {
      if (!shopId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getShopComments(shopId, { page: pageNum, limit: 20 }, token);
        if (pageNum === 1) {
          setComments(data.comments || []);
        } else {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        }
        setHasMore((data.comments || []).length === 20);
        setPage(pageNum);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('not_available');
        } else {
          setError('load_failed');
        }
        if (pageNum === 1) setComments([]);
      } finally {
        setLoading(false);
      }
    },
    [shopId, token],
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token || submitting) return;

    setSubmitting(true);
    try {
      const comment = await addShopComment(shopId, newComment.trim(), null, token);
      setNewComment('');
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [comment, ...prev];
      });
      trackShopCommentAdded(shop);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('not_available');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentComment) => {
    if (!replyContent.trim() || !token || submitting) return;

    setSubmitting(true);
    try {
      const reply = await addShopComment(shopId, replyContent.trim(), parentComment._id, token);
      setReplyContent('');
      setReplyingTo(null);

      setComments((prev) =>
        prev.map((c) =>
          c._id === parentComment._id
            ? {
                ...c,
                replyCount: (c.replyCount || 0) + 1,
                replies: [...(c.replies || []), reply],
              }
            : c,
        ),
      );

      setExpandedReplies((prev) => ({ ...prev, [parentComment._id]: true }));
    } catch (_err) {
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteShopComment(shopId, comment._id, token);
      setComments((prev) => prev.filter((c) => c._id !== comment._id));
    } catch (_err) {
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleLove = async (comment) => {
    if (!token) return;

    const wasLoved = comment.loved;
    setComments((prev) =>
      prev.map((c) =>
        c._id === comment._id
          ? {
              ...c,
              loved: !wasLoved,
              loveCount: wasLoved ? (c.loveCount || 1) - 1 : (c.loveCount || 0) + 1,
            }
          : c,
      ),
    );

    try {
      const result = await loveShopComment(shopId, comment._id, token);
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id ? { ...c, loved: result.loved, loveCount: result.loveCount } : c,
        ),
      );
    } catch (_err) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id
            ? {
                ...c,
                loved: wasLoved,
                loveCount: wasLoved ? (c.loveCount || 0) + 1 : (c.loveCount || 1) - 1,
              }
            : c,
        ),
      );
    }
  };

  const loadReplies = async (comment) => {
    if (expandedReplies[comment._id] && comment.replies?.length > 0) {
      setExpandedReplies((prev) => ({ ...prev, [comment._id]: false }));
      return;
    }

    try {
      const data = await getShopCommentReplies(shopId, comment._id, { limit: 50 }, token);
      setComments((prev) =>
        prev.map((c) => (c._id === comment._id ? { ...c, replies: data.replies || [] } : c)),
      );
      setExpandedReplies((prev) => ({ ...prev, [comment._id]: true }));
    } catch (_err) {}
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
      <Link href={`/profile/${comment.user?._id}`} className="flex-shrink-0">
        <UserAvatar user={comment.user} size={isReply ? 28 : 36} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <Link
            href={`/profile/${comment.user?._id}`}
            className="text-sm font-medium hover:underline"
          >
            {comment.user?.name || 'Unknown'}
          </Link>
          <p className="break-words text-sm text-foreground">{comment.content}</p>
        </div>

        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{timeAgo(comment.createdAt)}</span>

          <button
            type="button"
            onClick={() => handleLove(comment)}
            disabled={!token}
            className={`flex items-center gap-1 transition-colors hover:text-red-500 ${
              comment.loved ? 'text-red-500' : ''
            } ${!token ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Heart
              className={`h-3 w-3 ${comment.loved ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            {(comment.loveCount || 0) > 0 && comment.loveCount}
          </button>

          {!isReply && token && (
            <button
              type="button"
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="transition-colors hover:text-foreground"
            >
              Reply
            </button>
          )}

          {comment.userId === userId && (
            <button
              type="button"
              onClick={() => handleDelete(comment)}
              className="transition-colors hover:text-red-500"
              aria-label="Delete comment"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {replyingTo === comment._id && (
          <div className="mt-2 flex gap-2">
            <Input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.user?.name}...`}
              className="h-8 flex-1 text-sm"
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(comment);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => handleReply(comment)}
              disabled={!replyContent.trim() || submitting}
              className="h-8 bg-yellow-500 px-3 text-black hover:bg-yellow-600"
            >
              {submitting ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-3 w-3" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}

        {!isReply && (comment.replyCount || 0) > 0 && (
          <button
            type="button"
            onClick={() => loadReplies(comment)}
            className="mt-2 flex items-center gap-1 text-xs text-yellow-500 hover:underline"
          >
            {expandedReplies[comment._id] ? (
              <ChevronUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            )}
            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {expandedReplies[comment._id] &&
          comment.replies?.map((reply) => <CommentItem key={reply._id} comment={reply} isReply />)}
      </div>
    </div>
  );

  if (error === 'not_available') {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Comments are coming soon for shop pages.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loggedIn ? (
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this shop..."
              className="flex-1"
              maxLength={500}
              disabled={submitting}
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        ) : (
          <Link
            href="/login"
            className="block py-2 text-center text-sm text-muted-foreground hover:text-yellow-500"
          >
            Sign in to comment
          </Link>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500" aria-hidden="true" />
          </div>
        ) : error === 'load_failed' ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Unable to load comments right now.</p>
            <button
              type="button"
              onClick={() => loadComments()}
              className="mt-2 text-sm text-yellow-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => loadComments(page + 1)}
                disabled={loading}
                className="w-full py-2 text-center text-sm text-yellow-500 hover:underline"
              >
                {loading ? 'Loading...' : 'Load more comments'}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
