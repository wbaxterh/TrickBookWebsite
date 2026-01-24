import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark, User, MoreHorizontal, Flag, Link as LinkIcon } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import CommentSection from "./CommentSection";
import UserAvatar from "../UserAvatar";

export default function FeedPost({
	post,
	currentUserId,
	onReaction,
	onComment,
	onShare,
	onSave,
	autoPlay = false,
}) {
	const [loved, setLoved] = useState(post.userReactions?.includes("love") || false);
	const [respected, setRespected] = useState(post.userReactions?.includes("respect") || false);
	const [loveCount, setLoveCount] = useState(post.stats?.loveCount || 0);
	const [respectCount, setRespectCount] = useState(post.stats?.respectCount || 0);
	const [saved, setSaved] = useState(post.isSaved || false);
	const [showComments, setShowComments] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [isInView, setIsInView] = useState(false);
	const containerRef = useRef(null);
	const menuRef = useRef(null);

	// Intersection observer for autoplay when in view
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
			},
			{ threshold: 0.5 }
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showMenu]);

	const handleReaction = async (type) => {
		const isActive = type === "love" ? loved : respected;

		// Optimistic update
		if (type === "love") {
			setLoved(!isActive);
			setLoveCount((c) => (isActive ? c - 1 : c + 1));
		} else {
			setRespected(!isActive);
			setRespectCount((c) => (isActive ? c - 1 : c + 1));
		}

		try {
			await onReaction?.(post._id, type, !isActive);
		} catch (error) {
			// Revert on error
			if (type === "love") {
				setLoved(isActive);
				setLoveCount((c) => (isActive ? c + 1 : c - 1));
			} else {
				setRespected(isActive);
				setRespectCount((c) => (isActive ? c + 1 : c - 1));
			}
		}
	};

	const handleSave = async () => {
		const newSaved = !saved;
		setSaved(newSaved);
		try {
			await onSave?.(post._id, newSaved);
		} catch (error) {
			setSaved(!newSaved);
		}
	};

	const formatCount = (count) => {
		if (count >= 1000000) {
			return `${(count / 1000000).toFixed(1)}M`;
		}
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}K`;
		}
		return count.toString();
	};

	const timeAgo = (date) => {
		const seconds = Math.floor((new Date() - new Date(date)) / 1000);
		if (seconds < 60) return "just now";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d`;
		const weeks = Math.floor(days / 7);
		return `${weeks}w`;
	};

	const handleCopyLink = () => {
		const url = typeof window !== "undefined" ? `${window.location.origin}/media/feed/${post._id}` : "";
		navigator.clipboard?.writeText(url);
		setShowMenu(false);
	};

	return (
		<div
			ref={containerRef}
			className="bg-card rounded-lg overflow-hidden border border-border w-full"
		>
			{/* Creator Header */}
			<div className="flex items-center justify-between p-3">
				<Link
					href={`/profile/${post.user?._id}`}
					className="flex items-center gap-3 hover:opacity-80 transition-opacity"
				>
					<UserAvatar user={post.user} size={40} />
					<div>
						<p className="font-medium text-foreground text-sm">
							{post.user?.name || "Unknown"}
						</p>
						{post.location?.name && (
							<p className="text-xs text-muted-foreground">
								{post.location.name}
							</p>
						)}
					</div>
				</Link>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						{timeAgo(post.createdAt)}
					</span>
					{/* 3-dot Menu */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="text-muted-foreground hover:text-foreground transition-colors p-1"
						>
							<MoreHorizontal className="h-5 w-5" />
						</button>
						{showMenu && (
							<div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
								<button
									onClick={() => {
										handleSave();
										setShowMenu(false);
									}}
									className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
								>
									<Bookmark className={`h-4 w-4 ${saved ? "fill-current text-yellow-500" : ""}`} />
									{saved ? "Unsave" : "Save"}
								</button>
								<button
									onClick={() => {
										onShare?.(post._id);
										setShowMenu(false);
									}}
									className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
								>
									<Share2 className="h-4 w-4" />
									Share
								</button>
								<button
									onClick={handleCopyLink}
									className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
								>
									<LinkIcon className="h-4 w-4" />
									Copy Link
								</button>
								<button
									onClick={() => setShowMenu(false)}
									className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-secondary transition-colors"
								>
									<Flag className="h-4 w-4" />
									Report
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Video/Image Content */}
			<div className="relative bg-black flex justify-center">
				{post.mediaType === "video" ? (
					<div className={`w-full ${post.aspectRatio === "9:16" || !post.aspectRatio ? "max-w-[400px]" : ""}`}>
						<VideoPlayer
							src={post.hlsUrl || post.videoUrl}
							poster={post.thumbnailUrl}
							loop
							autoPlay={autoPlay && isInView}
							controls={true}
							aspectRatio={post.aspectRatio || "9:16"}
							objectFit="cover"
							className="max-h-[600px]"
						/>
					</div>
				) : (
					<Image
						src={post.imageUrls?.[0] || post.thumbnailUrl}
						alt={post.caption || "Post"}
						width={600}
						height={600}
						className="w-full object-cover max-h-[600px]"
					/>
				)}
			</div>

			{/* Reaction Bar - Simplified */}
			<div className="p-3">
				<div className="flex items-center gap-4 mb-2">
					{/* Love Button */}
					<button
						onClick={() => handleReaction("love")}
						className={`flex items-center gap-1.5 transition-colors ${
							loved ? "text-red-500" : "text-foreground hover:text-red-500"
						}`}
					>
						<Heart
							className={`h-6 w-6 ${loved ? "fill-current" : ""}`}
						/>
						<span className="text-sm font-medium">
							{formatCount(loveCount)}
						</span>
					</button>

					{/* Respect Button */}
					<button
						onClick={() => handleReaction("respect")}
						className={`flex items-center gap-1.5 transition-colors ${
							respected
								? "text-yellow-500"
								: "text-foreground hover:text-yellow-500"
						}`}
					>
						<span className={`text-xl ${respected ? "" : "grayscale opacity-70"}`}>
							🙏
						</span>
						<span className="text-sm font-medium">
							{formatCount(respectCount)}
						</span>
					</button>

					{/* Comments */}
					<button
						onClick={() => setShowComments(!showComments)}
						className="flex items-center gap-1.5 text-foreground hover:text-yellow-500 transition-colors"
					>
						<MessageCircle className="h-6 w-6" />
						<span className="text-sm font-medium">
							{formatCount(post.stats?.commentCount || 0)}
						</span>
					</button>
				</div>

				{/* Caption */}
				{post.caption && (
					<p className="text-sm text-foreground mb-2">
						<Link
							href={`/profile/${post.user?._id}`}
							className="font-medium hover:underline mr-2"
						>
							{post.user?.name}
						</Link>
						{post.caption}
					</p>
				)}

				{/* Tricks Tags */}
				{post.tricks?.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-2">
						{post.tricks.map((trick) => (
							<Link
								key={trick}
								href={`/trickbook?trick=${encodeURIComponent(trick)}`}
								className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded hover:bg-yellow-500/30 transition-colors"
							>
								{trick}
							</Link>
						))}
					</div>
				)}

				{/* Sport Type Tags */}
				{post.sportTypes?.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{post.sportTypes.map((sport) => (
							<span
								key={sport}
								className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded capitalize"
							>
								{sport}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Comments Section (expandable) */}
			{showComments && (
				<CommentSection
					postId={post._id}
					initialCommentCount={post.stats?.commentCount || 0}
					onCommentCountChange={(count) => {
						// Update local comment count if needed
					}}
				/>
			)}
		</div>
	);
}
