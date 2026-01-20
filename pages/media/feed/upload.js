import React, { useState, useRef, useContext, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { AuthContext } from "../../../auth/AuthContext";
import { Button } from "../../../components/ui/button";
import {
	Upload,
	X,
	Video,
	ImageIcon,
	ChevronLeft,
	Loader2,
	Plus,
	Check,
	Globe,
	Users,
	Lock,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { createPost } from "../../../lib/apiFeed";
import { createVideoEntry, uploadVideoTUS, waitForVideoProcessing, uploadImageToS3 } from "../../../lib/apiUpload";
import { SPORT_TYPES } from "../../../lib/apiMedia";

export default function UploadPost() {
	const router = useRouter();
	const { loggedIn, token, user } = useContext(AuthContext);
	const fileInputRef = useRef(null);

	// Form state
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [mediaType, setMediaType] = useState(null);
	const [caption, setCaption] = useState("");
	const [selectedSports, setSelectedSports] = useState([]);
	const [tricks, setTricks] = useState([]);
	const [trickInput, setTrickInput] = useState("");
	const [visibility, setVisibility] = useState("public");

	// Upload state
	const [uploadStep, setUploadStep] = useState("idle"); // idle, uploading, processing, creating, done, error
	const [uploadProgress, setUploadProgress] = useState(0);
	const [processingStatus, setProcessingStatus] = useState("");
	const [error, setError] = useState(null);
	const [videoData, setVideoData] = useState(null);

	// Redirect if not logged in
	useEffect(() => {
		if (!loggedIn) {
			router.push("/login?redirect=/media/feed/upload");
		}
	}, [loggedIn, router]);

	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const isVideo = file.type.startsWith("video/");
		const isImage = file.type.startsWith("image/");

		if (!isVideo && !isImage) {
			setError("Please select a video or image file");
			return;
		}

		// Check file size (max 500MB for videos, 10MB for images)
		const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
		if (file.size > maxSize) {
			setError(`File is too large. Max size: ${isVideo ? "500MB" : "10MB"}`);
			return;
		}

		setSelectedFile(file);
		setMediaType(isVideo ? "video" : "image");
		setError(null);
		setUploadStep("idle");

		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
	};

	const clearFile = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setSelectedFile(null);
		setPreviewUrl(null);
		setMediaType(null);
		setVideoData(null);
		setUploadStep("idle");
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleAddTrick = () => {
		const trimmed = trickInput.trim();
		if (trimmed && !tricks.includes(trimmed)) {
			setTricks([...tricks, trimmed]);
			setTrickInput("");
		}
	};

	const handleRemoveTrick = (trick) => {
		setTricks(tricks.filter((t) => t !== trick));
	};

	const handleTrickKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddTrick();
		}
	};

	const toggleSport = (sportValue) => {
		if (sportValue === "all") return;
		if (selectedSports.includes(sportValue)) {
			setSelectedSports(selectedSports.filter((s) => s !== sportValue));
		} else {
			setSelectedSports([...selectedSports, sportValue]);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!selectedFile) {
			setError("Please select a video or image to upload");
			return;
		}

		if (selectedSports.length === 0) {
			setError("Please select at least one sport type");
			return;
		}

		try {
			if (mediaType === "video") {
				// Video upload flow with Bunny.net
				await handleVideoUpload();
			} else {
				// Image upload flow (simpler)
				await handleImageUpload();
			}
		} catch (err) {
			console.error("Upload error:", err);
			setError(err.message || "Upload failed. Please try again.");
			setUploadStep("error");
		}
	};

	const handleVideoUpload = async () => {
		// Step 1: Create video entry in Bunny
		setUploadStep("uploading");
		setUploadProgress(0);
		setProcessingStatus("Creating video entry...");

		const videoTitle = caption.slice(0, 50) || `Video ${Date.now()}`;
		const videoEntry = await createVideoEntry(videoTitle, token);
		setVideoData(videoEntry);

		// Step 2: Upload video using TUS
		setProcessingStatus("Uploading video...");
		await uploadVideoTUS(
			selectedFile,
			{
				...videoEntry.uploadCredentials,
				videoId: videoEntry.videoId,
			},
			(progress) => {
				setUploadProgress(progress);
			}
		);

		// Step 3: Wait for processing
		setUploadStep("processing");
		setUploadProgress(100);
		setProcessingStatus("Processing video...");

		const processedVideo = await waitForVideoProcessing(videoEntry.videoId, 120, 3000);

		// Step 4: Create feed post
		setUploadStep("creating");
		setProcessingStatus("Creating post...");

		const post = await createPost(
			{
				mediaType: "video",
				bunnyVideoId: videoEntry.videoId,
				hlsUrl: processedVideo.hlsUrl,
				thumbnailUrl: processedVideo.thumbnailUrl,
				caption,
				sportTypes: selectedSports,
				tricks,
				visibility,
				duration: processedVideo.duration,
				aspectRatio: processedVideo.width > processedVideo.height ? "16:9" : "9:16",
			},
			token
		);

		setUploadStep("done");
		setProcessingStatus("Post created!");

		// Redirect after short delay
		setTimeout(() => {
			router.push("/media");
		}, 1500);
	};

	const handleImageUpload = async () => {
		// Step 1: Upload image to S3
		setUploadStep("uploading");
		setUploadProgress(0);
		setProcessingStatus("Uploading image...");

		const uploadResult = await uploadImageToS3(
			selectedFile,
			token,
			(progress) => {
				setUploadProgress(progress);
			}
		);

		// Step 2: Create feed post with S3 URL
		setUploadStep("creating");
		setProcessingStatus("Creating post...");

		const post = await createPost(
			{
				mediaType: "image",
				imageUrls: [uploadResult.fileUrl],
				thumbnailUrl: uploadResult.fileUrl,
				caption,
				sportTypes: selectedSports,
				tricks,
				visibility,
			},
			token
		);

		setUploadStep("done");
		setProcessingStatus("Post created!");

		setTimeout(() => {
			router.push("/media");
		}, 1500);
	};

	const getStepIcon = (step) => {
		if (uploadStep === "done") return <CheckCircle className="h-5 w-5 text-green-500" />;
		if (uploadStep === "error") return <AlertCircle className="h-5 w-5 text-red-500" />;
		return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
	};

	if (!loggedIn) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Create Post | Trick Book</title>
				<meta name="description" content="Share your tricks with the community" />
			</Head>

			<div className="min-h-screen bg-background">
				{/* Header */}
				<div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
					<div className="container mx-auto px-4">
						<div className="flex items-center justify-between h-14">
							<Link
								href="/media"
								className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
							>
								<ChevronLeft className="h-5 w-5" />
								<span>Back</span>
							</Link>
							<h1 className="font-semibold text-foreground">Create Post</h1>
							<div className="w-16" />
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-6 max-w-2xl">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* File Upload Area */}
						{!selectedFile ? (
							<div
								onClick={() => fileInputRef.current?.click()}
								className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-colors"
							>
								<Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-lg font-medium text-foreground mb-2">
									Upload your clip
								</p>
								<p className="text-sm text-muted-foreground mb-4">
									Video (max 3 min, 500MB) or Image (max 10MB)
								</p>
								<div className="flex justify-center gap-4">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Video className="h-4 w-4" />
										<span className="text-sm">MP4, MOV, WebM</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<ImageIcon className="h-4 w-4" />
										<span className="text-sm">JPG, PNG, WebP</span>
									</div>
								</div>
							</div>
						) : (
							<div className="relative rounded-xl overflow-hidden bg-black">
								{mediaType === "video" ? (
									<video
										src={previewUrl}
										controls
										className="w-full max-h-[500px] object-contain"
									/>
								) : (
									<div className="relative w-full aspect-square max-h-[500px]">
										<Image
											src={previewUrl}
											alt="Preview"
											fill
											className="object-contain"
										/>
									</div>
								)}
								{uploadStep === "idle" && (
									<button
										type="button"
										onClick={clearFile}
										className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
									>
										<X className="h-5 w-5 text-white" />
									</button>
								)}
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="video/*,image/*"
							onChange={handleFileSelect}
							className="hidden"
							disabled={uploadStep !== "idle"}
						/>

						{/* Caption */}
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Caption
							</label>
							<textarea
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder="What trick is this? Add some context..."
								rows={3}
								maxLength={500}
								disabled={uploadStep !== "idle"}
								className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none disabled:opacity-50"
							/>
							<p className="text-xs text-muted-foreground mt-1 text-right">
								{caption.length}/500
							</p>
						</div>

						{/* Sport Types */}
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Sport Type <span className="text-red-500">*</span>
							</label>
							<div className="flex flex-wrap gap-2">
								{SPORT_TYPES.filter((s) => s.value !== "all").map((sport) => (
									<button
										key={sport.value}
										type="button"
										onClick={() => toggleSport(sport.value)}
										disabled={uploadStep !== "idle"}
										className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
											selectedSports.includes(sport.value)
												? "bg-yellow-500 text-black"
												: "bg-secondary text-foreground hover:bg-secondary/80"
										}`}
									>
										{selectedSports.includes(sport.value) && (
											<Check className="h-3 w-3 inline mr-1" />
										)}
										{sport.label}
									</button>
								))}
							</div>
						</div>

						{/* Tricks Tags */}
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Tag Tricks
							</label>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={trickInput}
									onChange={(e) => setTrickInput(e.target.value)}
									onKeyDown={handleTrickKeyDown}
									placeholder="e.g., Kickflip, Backside 360"
									disabled={uploadStep !== "idle"}
									className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
								/>
								<Button
									type="button"
									onClick={handleAddTrick}
									variant="outline"
									className="px-3"
									disabled={uploadStep !== "idle"}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{tricks.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{tricks.map((trick) => (
										<span
											key={trick}
											className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-sm"
										>
											{trick}
											{uploadStep === "idle" && (
												<button
													type="button"
													onClick={() => handleRemoveTrick(trick)}
													className="hover:text-yellow-700 dark:hover:text-yellow-300"
												>
													<X className="h-3 w-3" />
												</button>
											)}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Visibility */}
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Who can see this?
							</label>
							<div className="grid grid-cols-3 gap-3">
								{[
									{ value: "public", icon: Globe, label: "Public" },
									{ value: "homies", icon: Users, label: "Homies" },
									{ value: "private", icon: Lock, label: "Only Me" },
								].map(({ value, icon: Icon, label }) => (
									<button
										key={value}
										type="button"
										onClick={() => setVisibility(value)}
										disabled={uploadStep !== "idle"}
										className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors disabled:opacity-50 ${
											visibility === value
												? "border-yellow-500 bg-yellow-500/10"
												: "border-border bg-secondary hover:bg-secondary/80"
										}`}
									>
										<Icon
											className={`h-5 w-5 ${
												visibility === value ? "text-yellow-500" : "text-muted-foreground"
											}`}
										/>
										<span
											className={`text-sm font-medium ${
												visibility === value ? "text-yellow-500" : "text-foreground"
											}`}
										>
											{label}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
								<p className="text-sm text-red-500">{error}</p>
							</div>
						)}

						{/* Upload Progress */}
						{uploadStep !== "idle" && uploadStep !== "error" && (
							<div className="p-4 bg-secondary rounded-lg space-y-3">
								<div className="flex items-center gap-3">
									{getStepIcon(uploadStep)}
									<span className="text-sm font-medium text-foreground">
										{processingStatus}
									</span>
								</div>

								{(uploadStep === "uploading" || uploadStep === "processing") && (
									<div className="space-y-2">
										<div className="h-2 bg-background rounded-full overflow-hidden">
											<div
												className={`h-full transition-all duration-300 ${
													uploadStep === "processing"
														? "bg-yellow-500 animate-pulse"
														: "bg-yellow-500"
												}`}
												style={{
													width: uploadStep === "processing" ? "100%" : `${uploadProgress}%`,
												}}
											/>
										</div>
										{uploadStep === "uploading" && (
											<p className="text-xs text-muted-foreground text-right">
												{uploadProgress.toFixed(0)}%
											</p>
										)}
									</div>
								)}

								{uploadStep === "done" && (
									<p className="text-sm text-green-500">
										Redirecting to feed...
									</p>
								)}
							</div>
						)}

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={uploadStep !== "idle" || !selectedFile}
							className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 disabled:opacity-50"
						>
							{uploadStep !== "idle" ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{uploadStep === "done" ? "Done!" : "Uploading..."}
								</>
							) : (
								"Share Post"
							)}
						</Button>
					</form>
				</div>
			</div>
		</>
	);
}
