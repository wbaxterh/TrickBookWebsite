import React, { useState, useEffect, useContext, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../../../auth/AuthContext";
import { Button } from "../../../components/ui/button";
import {
	ArrowLeft,
	Heart,
	MessageCircle,
	Share2,
	Loader2,
	Play,
	MoreHorizontal,
	Bookmark,
	Flag,
	Link as LinkIcon,
} from "lucide-react";
import {
	getVideoDetails,
	getVideoStreamUrl,
	getVideoReaction,
	addVideoReaction,
	removeVideoReaction,
} from "../../../lib/apiMedia";

export default function VideoPage() {
	const router = useRouter();
	const { id } = router.query;
	const { loggedIn, token } = useContext(AuthContext);

	const [video, setVideo] = useState(null);
	const [streamUrl, setStreamUrl] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userReaction, setUserReaction] = useState({ love: false, respect: false });
	const [isPlaying, setIsPlaying] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const videoRef = useRef(null);

	// Auto-play video when isPlaying becomes true
	useEffect(() => {
		if (isPlaying && videoRef.current) {
			videoRef.current.play().catch((err) => {
				console.log("Autoplay prevented:", err);
			});
		}
	}, [isPlaying]);

	useEffect(() => {
		if (!id) return;

		const fetchVideo = async () => {
			setLoading(true);
			try {
				const [videoData, streamData] = await Promise.all([
					getVideoDetails(id),
					getVideoStreamUrl(id),
				]);
				setVideo(videoData);
				setStreamUrl(streamData);

				if (token) {
					const reaction = await getVideoReaction(id, token);
					setUserReaction(reaction);
				}
			} catch (err) {
				console.error("Error fetching video:", err);
				setError("Failed to load video");
			} finally {
				setLoading(false);
			}
		};

		fetchVideo();
	}, [id, token]);

	const handleReaction = async (type) => {
		if (!token) {
			router.push("/login");
			return;
		}

		try {
			const isAdding = !userReaction[type];
			if (isAdding) {
				await addVideoReaction(id, type, token);
			} else {
				await removeVideoReaction(id, type, token);
			}
			setUserReaction((prev) => ({ ...prev, [type]: isAdding }));

			// Update local stats
			setVideo((prev) => ({
				...prev,
				stats: {
					...prev.stats,
					[`${type}Count`]: prev.stats[`${type}Count`] + (isAdding ? 1 : -1),
				},
			}));
		} catch (err) {
			console.error("Error handling reaction:", err);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	if (error || !video) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center">
				<p className="text-muted-foreground mb-4">{error || "Video not found"}</p>
				<Link href="/media">
					<Button variant="outline">Back to Media</Button>
				</Link>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{video.title} | The Couch | Trick Book</title>
				<meta name="description" content={video.description || `Watch ${video.title} on The Couch`} />
			</Head>

			<div className="min-h-screen bg-black">
				{/* Video Player */}
				<div className="relative w-full" style={{ paddingTop: "56.25%" }}>
					{!isPlaying ? (
						<div
							className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black"
							onClick={() => setIsPlaying(true)}
						>
							{video.driveThumbnail ? (
								<img
									src={video.driveThumbnail}
									alt={video.title}
									className="absolute inset-0 w-full h-full object-contain"
								/>
							) : (
								<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-black" />
							)}
							<div className="absolute inset-0 bg-black/40" />
							<div className="relative z-10 w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
								<Play className="h-10 w-10 text-black ml-1" fill="currentColor" />
							</div>
						</div>
					) : streamUrl?.embedUrl ? (
						<iframe
							src={`${streamUrl.embedUrl}${streamUrl.embedUrl.includes('?') ? '&' : '?'}autoplay=true`}
							className="absolute inset-0 w-full h-full"
							allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
							allowFullScreen
						/>
					) : (
						<video
							ref={videoRef}
							src={streamUrl?.mp4Url || streamUrl?.hlsUrl || streamUrl?.streamUrl}
							className="absolute inset-0 w-full h-full"
							controls
							autoPlay
							playsInline
						/>
					)}
				</div>

				{/* Video Info */}
				<div className="bg-background">
					<div className="container mx-auto px-4 py-6">
						{/* Back Button */}
						<Link href="/media" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to The Couch
						</Link>

						{/* Title and Meta */}
						<h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
							{video.title}
						</h1>

						<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
							{video.releaseYear && <span>{video.releaseYear}</span>}
							{video.sportTypes?.length > 0 && (
								<span className="capitalize">{video.sportTypes.join(", ")}</span>
							)}
							{video.stats?.viewCount > 0 && (
								<span>{video.stats.viewCount} views</span>
							)}
						</div>

						{/* Reaction Buttons - matching feed style */}
						<div className="flex items-center gap-6 mb-6">
							{/* Love Button */}
							<button
								onClick={() => handleReaction("love")}
								className={`flex items-center gap-2 transition-colors ${
									userReaction.love ? "text-red-500" : "text-foreground hover:text-red-500"
								}`}
							>
								<Heart className={`h-7 w-7 ${userReaction.love ? "fill-current" : ""}`} />
								<span className="text-base font-medium">
									{video.stats?.loveCount || 0}
								</span>
							</button>

							{/* Respect Button */}
							<button
								onClick={() => handleReaction("respect")}
								className={`flex items-center gap-2 transition-colors ${
									userReaction.respect ? "text-yellow-500" : "text-foreground hover:text-yellow-500"
								}`}
							>
								<span className={`text-2xl ${userReaction.respect ? "" : "grayscale opacity-70"}`}>
									🙏
								</span>
								<span className="text-base font-medium">
									{video.stats?.respectCount || 0}
								</span>
							</button>

							{/* Comments Button */}
							<button
								onClick={() => setShowComments(!showComments)}
								className="flex items-center gap-2 text-foreground hover:text-yellow-500 transition-colors"
							>
								<MessageCircle className="h-7 w-7" />
								<span className="text-base font-medium">
									{video.stats?.commentCount || 0}
								</span>
							</button>

							{/* Share Button */}
							<button
								onClick={() => {
									if (navigator.share) {
										navigator.share({
											title: video.title,
											url: window.location.href,
										});
									} else {
										navigator.clipboard?.writeText(window.location.href);
									}
								}}
								className="text-foreground hover:text-yellow-500 transition-colors"
							>
								<Share2 className="h-6 w-6" />
							</button>
						</div>

						{/* Description */}
						{video.description && (
							<div className="prose prose-invert max-w-none">
								<p className="text-muted-foreground">{video.description}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
