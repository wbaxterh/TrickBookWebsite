import React, { useState, useContext, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../../../auth/AuthContext";
import Header from "../../../components/Header";
import { Button } from "../../../components/ui/button";
import {
	ArrowLeft,
	Loader2,
	Youtube,
	Upload,
	X,
	Plus,
	Save,
	Eye,
	Film,
	CheckCircle,
} from "lucide-react";
import {
	fetchYouTubeMetadata,
	createVideo,
	createBunnyVideo,
	SPORT_TYPES,
	CONTENT_TYPES,
} from "../../../lib/apiMedia";

const TAGS = [
	"street",
	"park",
	"vert",
	"freestyle",
	"backcountry",
	"big mountain",
	"rail",
	"jib",
	"flatground",
	"mega ramp",
	"contest",
	"documentary",
	"classic",
];

export default function AddVideo() {
	const router = useRouter();
	const { loggedIn, token, role } = useContext(AuthContext);

	// Form state
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		sportTypes: [],
		type: "film",
		tags: [],
		releaseYear: "",
		producedBy: "",
		riders: [],
		sponsors: [],
		duration: "",
		youtubeUrl: "",
		thumbnails: {
			poster: "",
			backdrop: "",
		},
		bunnyVideoId: "",
		hlsUrl: "",
		isPublished: false,
		isFeatured: false,
	});

	// UI state
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [fetchingYouTube, setFetchingYouTube] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Input state for array fields
	const [riderInput, setRiderInput] = useState("");
	const [sponsorInput, setSponsorInput] = useState("");
	const [youtubeInput, setYoutubeInput] = useState("");

	useEffect(() => {
		if (loggedIn === false || (loggedIn && role !== "admin")) {
			router.push("/login");
		}
	}, [loggedIn, role, router]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSportToggle = (sport) => {
		setFormData((prev) => ({
			...prev,
			sportTypes: prev.sportTypes.includes(sport)
				? prev.sportTypes.filter((s) => s !== sport)
				: [...prev.sportTypes, sport],
		}));
	};

	const handleTagToggle = (tag) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.includes(tag)
				? prev.tags.filter((t) => t !== tag)
				: [...prev.tags, tag],
		}));
	};

	const addRider = () => {
		if (riderInput.trim() && !formData.riders.includes(riderInput.trim())) {
			setFormData((prev) => ({
				...prev,
				riders: [...prev.riders, riderInput.trim()],
			}));
			setRiderInput("");
		}
	};

	const removeRider = (rider) => {
		setFormData((prev) => ({
			...prev,
			riders: prev.riders.filter((r) => r !== rider),
		}));
	};

	const addSponsor = () => {
		if (sponsorInput.trim() && !formData.sponsors.includes(sponsorInput.trim())) {
			setFormData((prev) => ({
				...prev,
				sponsors: [...prev.sponsors, sponsorInput.trim()],
			}));
			setSponsorInput("");
		}
	};

	const removeSponsor = (sponsor) => {
		setFormData((prev) => ({
			...prev,
			sponsors: prev.sponsors.filter((s) => s !== sponsor),
		}));
	};

	const handleFetchYouTube = async () => {
		if (!youtubeInput.trim()) return;

		setFetchingYouTube(true);
		setError("");

		try {
			const metadata = await fetchYouTubeMetadata(youtubeInput, token);
			setFormData((prev) => ({
				...prev,
				title: metadata.title || prev.title,
				description: metadata.description || prev.description,
				releaseYear: metadata.releaseYear || prev.releaseYear,
				producedBy: metadata.author || prev.producedBy,
				youtubeUrl: youtubeInput,
				thumbnails: {
					...prev.thumbnails,
					poster: metadata.thumbnail || prev.thumbnails.poster,
				},
			}));
			setYoutubeInput("");
			setSuccess("YouTube metadata imported successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError("Failed to fetch YouTube metadata. Please check the URL.");
		} finally {
			setFetchingYouTube(false);
		}
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!formData.title) {
			setError("Please enter a title before uploading");
			return;
		}

		setUploading(true);
		setUploadProgress(0);
		setError("");

		try {
			// Create Bunny video first
			const bunnyVideo = await createBunnyVideo(formData.title, token);

			// Upload to Bunny.net using TUS
			const uploadUrl = `https://video.bunnycdn.com/tusupload`;
			const libraryId = bunnyVideo.libraryId;
			const videoId = bunnyVideo.guid;

			// Use fetch with PUT for simple upload
			const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
				method: "PUT",
				headers: {
					"AccessKey": bunnyVideo.uploadKey,
					"Content-Type": "application/octet-stream",
				},
				body: file,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			// Update form with Bunny video info
			setFormData((prev) => ({
				...prev,
				bunnyVideoId: videoId,
				hlsUrl: `https://${bunnyVideo.cdnHostname}/${videoId}/playlist.m3u8`,
			}));

			setUploadProgress(100);
			setSuccess("Video uploaded successfully! It may take a few minutes to process.");
			setTimeout(() => setSuccess(""), 5000);
		} catch (err) {
			console.error("Upload error:", err);
			setError("Failed to upload video. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (publish = false) => {
		if (!formData.title) {
			setError("Title is required");
			return;
		}

		if (formData.sportTypes.length === 0) {
			setError("Please select at least one sport type");
			return;
		}

		setSaving(true);
		setError("");

		try {
			const videoData = {
				...formData,
				isPublished: publish,
				releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null,
				duration: formData.duration ? parseInt(formData.duration) : null,
			};

			await createVideo(videoData, token);
			setSuccess("Video created successfully!");
			setTimeout(() => {
				router.push("/admin/couch");
			}, 1500);
		} catch (err) {
			setError("Failed to create video. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	if (loggedIn === null) {
		return (
			<>
				<Header />
				<div className="min-h-screen bg-background flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>Add Video | Admin | Trick Book</title>
			</Head>
			<Header />

			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					{/* Header */}
					<div className="flex items-center gap-4 mb-8">
						<Link href="/admin/couch">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold text-foreground">Add New Video</h1>
							<p className="text-muted-foreground">
								Import from YouTube or upload directly to Bunny.net
							</p>
						</div>
					</div>

					{/* Alerts */}
					{error && (
						<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
							{error}
						</div>
					)}
					{success && (
						<div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center gap-2">
							<CheckCircle className="h-5 w-5" />
							{success}
						</div>
					)}

					<div className="space-y-8">
						{/* YouTube Import Section */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
								<Youtube className="h-5 w-5 text-red-500" />
								Import from YouTube
							</h2>
							<div className="flex gap-2">
								<input
									type="text"
									value={youtubeInput}
									onChange={(e) => setYoutubeInput(e.target.value)}
									placeholder="Paste YouTube URL..."
									className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
								/>
								<Button
									onClick={handleFetchYouTube}
									disabled={fetchingYouTube || !youtubeInput}
									className="bg-red-500 hover:bg-red-600 text-white"
								>
									{fetchingYouTube ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Fetch Metadata"
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								This will import the title, description, thumbnail, and year from YouTube
							</p>
						</div>

						{/* Video Upload Section */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
								<Upload className="h-5 w-5 text-yellow-500" />
								Upload Video to Bunny.net
							</h2>
							{formData.bunnyVideoId ? (
								<div className="flex items-center gap-2 text-green-500">
									<CheckCircle className="h-5 w-5" />
									<span>Video uploaded: {formData.bunnyVideoId}</span>
								</div>
							) : uploading ? (
								<div className="space-y-2">
									<div className="h-2 bg-secondary rounded-full overflow-hidden">
										<div
											className="h-full bg-yellow-500 transition-all"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
									<p className="text-sm text-muted-foreground">
										Uploading... {uploadProgress}%
									</p>
								</div>
							) : (
								<div>
									<label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
										<Upload className="h-8 w-8 text-muted-foreground mb-2" />
										<span className="text-sm text-muted-foreground">
											Click to upload video file
										</span>
										<input
											type="file"
											accept="video/*"
											onChange={handleFileUpload}
											className="hidden"
										/>
									</label>
									<p className="text-xs text-muted-foreground mt-2">
										Supports MP4, MOV, MKV. Max 10GB.
									</p>
								</div>
							)}
						</div>

						{/* Basic Info */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Basic Information
							</h2>
							<div className="space-y-4">
								{/* Title */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-1">
										Title *
									</label>
									<input
										type="text"
										name="title"
										value={formData.title}
										onChange={handleChange}
										placeholder="Enter video title"
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-1">
										Description
									</label>
									<textarea
										name="description"
										value={formData.description}
										onChange={handleChange}
										placeholder="Enter video description"
										rows={4}
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
									/>
								</div>

								{/* Thumbnail Preview */}
								{formData.thumbnails.poster && (
									<div>
										<label className="block text-sm font-medium text-foreground mb-1">
											Thumbnail Preview
										</label>
										<div className="relative w-48 h-28 bg-muted rounded-lg overflow-hidden">
											<img
												src={formData.thumbnails.poster}
												alt="Thumbnail"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
								)}

								{/* Custom Thumbnail URL */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-1">
										Custom Thumbnail URL
									</label>
									<input
										type="text"
										value={formData.thumbnails.poster}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												thumbnails: { ...prev.thumbnails, poster: e.target.value },
											}))
										}
										placeholder="https://..."
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>
							</div>
						</div>

						{/* Categories */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Categories & Tags
							</h2>
							<div className="space-y-6">
								{/* Sport Types */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-2">
										Sport Types *
									</label>
									<div className="flex flex-wrap gap-2">
										{SPORT_TYPES.filter((s) => s.value !== "all").map((sport) => (
											<button
												key={sport.value}
												type="button"
												onClick={() => handleSportToggle(sport.value)}
												className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
													formData.sportTypes.includes(sport.value)
														? "bg-yellow-500 text-black"
														: "bg-secondary text-foreground hover:bg-secondary/80"
												}`}
											>
												{sport.label}
											</button>
										))}
									</div>
								</div>

								{/* Content Type */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-2">
										Content Type
									</label>
									<select
										name="type"
										value={formData.type}
										onChange={handleChange}
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									>
										{CONTENT_TYPES.filter((t) => t.value !== "all").map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								{/* Tags */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-2">
										Tags
									</label>
									<div className="flex flex-wrap gap-2">
										{TAGS.map((tag) => (
											<button
												key={tag}
												type="button"
												onClick={() => handleTagToggle(tag)}
												className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
													formData.tags.includes(tag)
														? "bg-yellow-500 text-black"
														: "bg-secondary text-foreground hover:bg-secondary/80"
												}`}
											>
												{tag}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Credits */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Credits & Details
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Release Year */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-1">
										Release Year
									</label>
									<input
										type="number"
										name="releaseYear"
										value={formData.releaseYear}
										onChange={handleChange}
										placeholder="e.g. 2023"
										min="1950"
										max={new Date().getFullYear()}
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>

								{/* Duration */}
								<div>
									<label className="block text-sm font-medium text-foreground mb-1">
										Duration (seconds)
									</label>
									<input
										type="number"
										name="duration"
										value={formData.duration}
										onChange={handleChange}
										placeholder="e.g. 3600 for 1 hour"
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>

								{/* Produced By */}
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-foreground mb-1">
										Produced By
									</label>
									<input
										type="text"
										name="producedBy"
										value={formData.producedBy}
										onChange={handleChange}
										placeholder="e.g. Girl Skateboards, Brain Farm"
										className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>

								{/* Riders */}
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-foreground mb-1">
										Featured Riders
									</label>
									<div className="flex gap-2 mb-2">
										<input
											type="text"
											value={riderInput}
											onChange={(e) => setRiderInput(e.target.value)}
											onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRider())}
											placeholder="Add rider name"
											className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
										/>
										<Button type="button" onClick={addRider} variant="outline">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{formData.riders.map((rider) => (
											<span
												key={rider}
												className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
											>
												{rider}
												<button
													type="button"
													onClick={() => removeRider(rider)}
													className="hover:text-red-500"
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										))}
									</div>
								</div>

								{/* Sponsors */}
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-foreground mb-1">
										Sponsors
									</label>
									<div className="flex gap-2 mb-2">
										<input
											type="text"
											value={sponsorInput}
											onChange={(e) => setSponsorInput(e.target.value)}
											onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSponsor())}
											placeholder="Add sponsor"
											className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
										/>
										<Button type="button" onClick={addSponsor} variant="outline">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{formData.sponsors.map((sponsor) => (
											<span
												key={sponsor}
												className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
											>
												{sponsor}
												<button
													type="button"
													onClick={() => removeSponsor(sponsor)}
													className="hover:text-red-500"
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Publishing Options */}
						<div className="bg-card border border-border rounded-lg p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Publishing Options
							</h2>
							<div className="space-y-4">
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="checkbox"
										name="isFeatured"
										checked={formData.isFeatured}
										onChange={handleChange}
										className="w-5 h-5 rounded border-border bg-secondary text-yellow-500 focus:ring-yellow-500"
									/>
									<div>
										<span className="font-medium text-foreground">Featured Video</span>
										<p className="text-sm text-muted-foreground">
											Display prominently on The Couch homepage
										</p>
									</div>
								</label>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-between pt-4 border-t border-border">
							<Link href="/admin/couch">
								<Button variant="ghost">Cancel</Button>
							</Link>
							<div className="flex gap-3">
								<Button
									onClick={() => handleSubmit(false)}
									disabled={saving}
									variant="outline"
								>
									{saving ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Save className="h-4 w-4 mr-2" />
									)}
									Save as Draft
								</Button>
								<Button
									onClick={() => handleSubmit(true)}
									disabled={saving}
									className="bg-yellow-500 hover:bg-yellow-600 text-black"
								>
									{saving ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Eye className="h-4 w-4 mr-2" />
									)}
									Publish
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
