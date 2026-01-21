import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthContext } from "../../auth/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	getComments,
	addComment,
	deleteComment,
	loveComment,
	getCommentReplies,
} from "../../lib/apiFeed";
import { connectFeedSocket, getFeedSocket } from "../../lib/socket";
import {
	Heart,
	Trash2,
	User,
	ChevronDown,
	ChevronUp,
	Loader2,
	Send,
	Reply,
} from "lucide-react";

export default function CommentSection({
	postId,
	initialCommentCount = 0,
	onCommentCountChange,
}) {
	const { token, user, loggedIn } = useContext(AuthContext);
	const userId = user?.userId || user?._id;

	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [newComment, setNewComment] = useState("");
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyContent, setReplyContent] = useState("");
	const [expandedReplies, setExpandedReplies] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [commentCount, setCommentCount] = useState(initialCommentCount);

	const socketRef = useRef(null);
	const inputRef = useRef(null);

	// Load comments on mount
	useEffect(() => {
		loadComments();
	}, [postId]);

	// Socket connection for real-time updates
	useEffect(() => {
		if (!token) return;

		const socket = connectFeedSocket(token);
		socketRef.current = socket;

		// Join the post room
		socket.emit("join:post", postId);

		// Listen for new comments
		socket.on("comment:new", (comment) => {
			if (comment.postId === postId && !comment.parentCommentId) {
				// Only add top-level comments to the main list
				// Avoid duplicates (in case we're the sender)
				setComments((prev) => {
					if (prev.some((c) => c._id === comment._id)) return prev;
					return [comment, ...prev];
				});
				setCommentCount((c) => c + 1);
				onCommentCountChange?.(commentCount + 1);
			}
		});

		// Listen for deleted comments
		socket.on("comment:deleted", ({ commentId }) => {
			setComments((prev) => prev.filter((c) => c._id !== commentId));
			setCommentCount((c) => Math.max(0, c - 1));
			onCommentCountChange?.(Math.max(0, commentCount - 1));
		});

		// Listen for comment loves
		socket.on("comment:loved", ({ commentId, loveCount }) => {
			setComments((prev) =>
				prev.map((c) => (c._id === commentId ? { ...c, loveCount } : c))
			);
		});

		return () => {
			socket.emit("leave:post", postId);
			socket.off("comment:new");
			socket.off("comment:deleted");
			socket.off("comment:loved");
		};
	}, [postId, token, commentCount, onCommentCountChange]);

	const loadComments = async (pageNum = 1) => {
		setLoading(true);
		try {
			const data = await getComments(postId, { page: pageNum, limit: 20 }, token);
			if (pageNum === 1) {
				setComments(data.comments || []);
			} else {
				setComments((prev) => [...prev, ...(data.comments || [])]);
			}
			setHasMore((data.comments || []).length === 20);
			setPage(pageNum);
		} catch (error) {
			console.error("Error loading comments:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitComment = async (e) => {
		e.preventDefault();
		if (!newComment.trim() || !token || submitting) return;

		setSubmitting(true);
		try {
			const comment = await addComment(postId, newComment.trim(), null, token);
			setNewComment("");
			// Socket will add it via real-time event, but add optimistically
			setComments((prev) => {
				if (prev.some((c) => c._id === comment._id)) return prev;
				return [comment, ...prev];
			});
			setCommentCount((c) => c + 1);
			onCommentCountChange?.(commentCount + 1);
		} catch (error) {
			console.error("Error adding comment:", error);
			alert("Failed to add comment. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleReply = async (parentComment) => {
		if (!replyContent.trim() || !token || submitting) return;

		setSubmitting(true);
		try {
			const reply = await addComment(
				postId,
				replyContent.trim(),
				parentComment._id,
				token
			);
			setReplyContent("");
			setReplyingTo(null);

			// Update parent's reply count and add to expanded replies
			setComments((prev) =>
				prev.map((c) =>
					c._id === parentComment._id
						? {
								...c,
								replyCount: (c.replyCount || 0) + 1,
								replies: [...(c.replies || []), reply],
						  }
						: c
				)
			);

			// Auto-expand replies for this comment
			setExpandedReplies((prev) => ({ ...prev, [parentComment._id]: true }));
		} catch (error) {
			console.error("Error adding reply:", error);
			alert("Failed to add reply. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (comment) => {
		if (!confirm("Delete this comment?")) return;

		try {
			await deleteComment(postId, comment._id, token);
			setComments((prev) => prev.filter((c) => c._id !== comment._id));
			setCommentCount((c) => Math.max(0, c - 1));
			onCommentCountChange?.(Math.max(0, commentCount - 1));
		} catch (error) {
			console.error("Error deleting comment:", error);
			alert("Failed to delete comment. Please try again.");
		}
	};

	const handleLove = async (comment) => {
		if (!token) return;

		// Optimistic update
		const wasLoved = comment.loved;
		setComments((prev) =>
			prev.map((c) =>
				c._id === comment._id
					? {
							...c,
							loved: !wasLoved,
							loveCount: wasLoved ? (c.loveCount || 1) - 1 : (c.loveCount || 0) + 1,
					  }
					: c
			)
		);

		try {
			const result = await loveComment(postId, comment._id, token);
			// Update with server response
			setComments((prev) =>
				prev.map((c) =>
					c._id === comment._id
						? { ...c, loved: result.loved, loveCount: result.loveCount }
						: c
				)
			);
		} catch (error) {
			// Revert on error
			setComments((prev) =>
				prev.map((c) =>
					c._id === comment._id
						? {
								...c,
								loved: wasLoved,
								loveCount: wasLoved ? (c.loveCount || 0) + 1 : (c.loveCount || 1) - 1,
						  }
						: c
				)
			);
			console.error("Error loving comment:", error);
		}
	};

	const loadReplies = async (comment) => {
		if (expandedReplies[comment._id] && comment.replies?.length > 0) {
			// Collapse
			setExpandedReplies((prev) => ({ ...prev, [comment._id]: false }));
			return;
		}

		try {
			const data = await getCommentReplies(postId, comment._id, { limit: 50 }, token);
			setComments((prev) =>
				prev.map((c) =>
					c._id === comment._id ? { ...c, replies: data.replies || [] } : c
				)
			);
			setExpandedReplies((prev) => ({ ...prev, [comment._id]: true }));
		} catch (error) {
			console.error("Error loading replies:", error);
		}
	};

	const timeAgo = (date) => {
		const seconds = Math.floor((new Date() - new Date(date)) / 1000);
		if (seconds < 60) return "now";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		return `${Math.floor(hours / 24)}d`;
	};

	const CommentItem = ({ comment, isReply = false }) => (
		<div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}>
			<Link href={`/profile/${comment.user?._id}`} className="flex-shrink-0">
				{comment.user?.imageUri ? (
					<Image
						src={comment.user.imageUri}
						alt={comment.user.name || "User"}
						width={isReply ? 28 : 36}
						height={isReply ? 28 : 36}
						className="rounded-full object-cover"
						style={{
							width: isReply ? 28 : 36,
							height: isReply ? 28 : 36,
						}}
					/>
				) : (
					<div
						className={`${isReply ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-muted flex items-center justify-center`}
					>
						<User className="h-4 w-4 text-muted-foreground" />
					</div>
				)}
			</Link>

			<div className="flex-1 min-w-0">
				<div className="bg-secondary/50 rounded-lg px-3 py-2">
					<Link
						href={`/profile/${comment.user?._id}`}
						className="font-medium text-sm hover:underline"
					>
						{comment.user?.name || "Unknown"}
					</Link>
					<p className="text-sm text-foreground break-words">{comment.content}</p>
				</div>

				<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
					<span>{timeAgo(comment.createdAt)}</span>

					{/* Love button */}
					<button
						onClick={() => handleLove(comment)}
						disabled={!token}
						className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
							comment.loved ? "text-red-500" : ""
						} ${!token ? "cursor-not-allowed opacity-50" : ""}`}
					>
						<Heart
							className={`h-3 w-3 ${comment.loved ? "fill-current" : ""}`}
						/>
						{(comment.loveCount || 0) > 0 && comment.loveCount}
					</button>

					{/* Reply button (only for top-level comments) */}
					{!isReply && token && (
						<button
							onClick={() =>
								setReplyingTo(replyingTo === comment._id ? null : comment._id)
							}
							className="hover:text-foreground transition-colors"
						>
							Reply
						</button>
					)}

					{/* Delete button (only for own comments) */}
					{comment.userId === userId && (
						<button
							onClick={() => handleDelete(comment)}
							className="hover:text-red-500 transition-colors"
						>
							<Trash2 className="h-3 w-3" />
						</button>
					)}
				</div>

				{/* Reply Input */}
				{replyingTo === comment._id && (
					<div className="flex gap-2 mt-2">
						<Input
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder={`Reply to ${comment.user?.name}...`}
							className="text-sm h-8 flex-1"
							maxLength={500}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleReply(comment);
								}
							}}
						/>
						<Button
							size="sm"
							onClick={() => handleReply(comment)}
							disabled={!replyContent.trim() || submitting}
							className="h-8 bg-yellow-500 hover:bg-yellow-600 text-black px-3"
						>
							{submitting ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								<Send className="h-3 w-3" />
							)}
						</Button>
					</div>
				)}

				{/* Show replies toggle */}
				{!isReply && (comment.replyCount || 0) > 0 && (
					<button
						onClick={() => loadReplies(comment)}
						className="flex items-center gap-1 text-xs text-yellow-500 mt-2 hover:underline"
					>
						{expandedReplies[comment._id] ? (
							<ChevronUp className="h-3 w-3" />
						) : (
							<ChevronDown className="h-3 w-3" />
						)}
						{comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
					</button>
				)}

				{/* Replies */}
				{expandedReplies[comment._id] &&
					comment.replies?.map((reply) => (
						<CommentItem key={reply._id} comment={reply} isReply />
					))}
			</div>
		</div>
	);

	return (
		<div className="border-t border-border p-3 space-y-4">
			{/* New Comment Input */}
			{loggedIn ? (
				<form onSubmit={handleSubmitComment} className="flex gap-2">
					<Input
						ref={inputRef}
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Add a comment..."
						className="flex-1"
						maxLength={500}
						disabled={submitting}
					/>
					<Button
						type="submit"
						disabled={!newComment.trim() || submitting}
						className="bg-yellow-500 hover:bg-yellow-600 text-black"
					>
						{submitting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</form>
			) : (
				<Link
					href="/login"
					className="block text-center text-sm text-muted-foreground hover:text-yellow-500 py-2"
				>
					Sign in to comment
				</Link>
			)}

			{/* Comments List */}
			{loading ? (
				<div className="flex justify-center py-4">
					<Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
				</div>
			) : comments.length === 0 ? (
				<p className="text-center text-sm text-muted-foreground py-4">
					No comments yet. Be the first!
				</p>
			) : (
				<div className="space-y-4">
					{comments.map((comment) => (
						<CommentItem key={comment._id} comment={comment} />
					))}

					{hasMore && (
						<button
							onClick={() => loadComments(page + 1)}
							disabled={loading}
							className="w-full text-center text-sm text-yellow-500 hover:underline py-2"
						>
							{loading ? "Loading..." : "Load more comments"}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
