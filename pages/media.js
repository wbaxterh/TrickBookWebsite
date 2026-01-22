import React, { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { AuthContext } from "../auth/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import {
	Film,
	Play,
	Tv,
	Compass,
	TrendingUp,
	Users,
	Plus,
	Search,
	Loader2,
	User,
} from "lucide-react";
import FeedPost from "../components/media/FeedPost";
import VideoCard from "../components/media/VideoCard";
import { getFeatured, getCollections, getCouchVideos, SPORT_TYPES } from "../lib/apiMedia";
import { getFeed, getTrendingFeed, addReaction, removeReaction } from "../lib/apiFeed";

export default function Media() {
	const router = useRouter();
	const { loggedIn, token } = useContext(AuthContext);
	const [activeTab, setActiveTab] = useState("couch");
	const [feedFilter, setFeedFilter] = useState("for-you");
	const [sportFilter, setSportFilter] = useState("all");

	// Data states
	const [featured, setFeatured] = useState(null);
	const [collections, setCollections] = useState([]);
	const [recentVideos, setRecentVideos] = useState([]);
	const [feedPosts, setFeedPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);

	// Loading states
	const [loadingCouch, setLoadingCouch] = useState(true);
	const [loadingFeed, setLoadingFeed] = useState(true);

	// Fetch Couch data
	useEffect(() => {
		const fetchCouchData = async () => {
			setLoadingCouch(true);
			try {
				const [featuredData, collectionsData, videosData] = await Promise.all([
					getFeatured().catch(() => null),
					getCollections({ sport: sportFilter }).catch(() => []),
					getCouchVideos({ sport: sportFilter, limit: 20 }).catch(() => []),
				]);
				setFeatured(featuredData);
				setCollections(collectionsData);
				setRecentVideos(videosData || []);
			} catch (error) {
				console.error("Error fetching couch data:", error);
			} finally {
				setLoadingCouch(false);
			}
		};

		if (activeTab === "couch") {
			fetchCouchData();
		}
	}, [activeTab, sportFilter]);

	// Fetch Feed data
	useEffect(() => {
		const fetchFeedData = async () => {
			setLoadingFeed(true);
			try {
				if (feedFilter === "trending") {
					const data = await getTrendingFeed({ sport: sportFilter });
					setTrendingPosts(data.posts || []);
				} else {
					const data = await getFeed({ page: 1, limit: 20 }, token);
					setFeedPosts(data.posts || []);
				}
			} catch (error) {
				console.error("Error fetching feed:", error);
			} finally {
				setLoadingFeed(false);
			}
		};

		if (activeTab === "feed") {
			fetchFeedData();
		}
	}, [activeTab, feedFilter, sportFilter, token]);

	const handleReaction = async (postId, type, isAdding) => {
		if (!token) {
			router.push("/login");
			return;
		}
		try {
			if (isAdding) {
				await addReaction(postId, type, token);
			} else {
				await removeReaction(postId, type, token);
			}
		} catch (error) {
			console.error("Error handling reaction:", error);
			throw error;
		}
	};

	// Sample/placeholder data for demo
	const sampleCollections = [
		{
			_id: "1",
			name: "Skateboarding Classics",
			description: "Iconic skate videos that defined the sport",
			videos: [
				{ _id: "v1", title: "Video Days", releaseYear: 1991, sportTypes: ["skateboarding"], thumbnails: {}, avgRating: 4.8 },
				{ _id: "v2", title: "Yeah Right!", releaseYear: 2003, sportTypes: ["skateboarding"], thumbnails: {}, avgRating: 4.9 },
				{ _id: "v3", title: "Fully Flared", releaseYear: 2007, sportTypes: ["skateboarding"], thumbnails: {}, avgRating: 4.7 },
			],
		},
		{
			_id: "2",
			name: "Snow Films",
			description: "Epic snowboarding and skiing documentaries",
			videos: [
				{ _id: "v4", title: "The Art of Flight", releaseYear: 2011, sportTypes: ["snowboarding"], thumbnails: {}, avgRating: 4.9 },
				{ _id: "v5", title: "The Fourth Phase", releaseYear: 2016, sportTypes: ["snowboarding"], thumbnails: {}, avgRating: 4.6 },
			],
		},
	];

	const samplePosts = [
		{
			_id: "p1",
			user: { _id: "u1", name: "Pro Skater", imageUri: null },
			mediaType: "video",
			videoUrl: "",
			thumbnailUrl: "/placeholder-video.jpg",
			caption: "Clean kickflip at the local park! First one in a while.",
			sportTypes: ["skateboarding"],
			tricks: ["Kickflip"],
			stats: { loveCount: 234, respectCount: 89, commentCount: 12 },
			createdAt: new Date(Date.now() - 3600000),
		},
		{
			_id: "p2",
			user: { _id: "u2", name: "Snow Rider", imageUri: null },
			mediaType: "video",
			videoUrl: "",
			thumbnailUrl: "/placeholder-video.jpg",
			caption: "Fresh powder day was insane!",
			sportTypes: ["snowboarding"],
			tricks: ["Backside 360"],
			stats: { loveCount: 567, respectCount: 234, commentCount: 45 },
			createdAt: new Date(Date.now() - 7200000),
		},
	];

	const displayCollections = collections.length > 0 ? collections : [];
	const displayPosts = feedPosts.length > 0 ? feedPosts : samplePosts;

	return (
		<>
			<Head>
				<title>Media | Trick Book</title>
				<meta
					name="description"
					content="Watch action sports films and share clips with the community on Trick Book"
				/>
			</Head>

			<div className="min-h-screen bg-background">
				{/* Header with Tabs */}
				<div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
					<div className="container mx-auto px-4">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<div className="flex items-center justify-between py-4">
								<TabsList className="grid grid-cols-2 w-auto">
									<TabsTrigger
										value="couch"
										className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black px-6"
									>
										<Tv className="h-4 w-4 mr-2" />
										The Couch
									</TabsTrigger>
									<TabsTrigger
										value="feed"
										className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black px-6"
									>
										<Compass className="h-4 w-4 mr-2" />
										The Feed
									</TabsTrigger>
								</TabsList>

								<div className="flex items-center gap-2">
									{activeTab === "feed" && loggedIn && (
										<Link href="/media/feed/upload">
											<Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
												<Plus className="h-4 w-4 mr-2" />
												Post
											</Button>
										</Link>
									)}
									<Link href="/media/search">
										<Button variant="ghost" size="icon">
											<Search className="h-5 w-5" />
										</Button>
									</Link>
								</div>
							</div>
						</Tabs>
					</div>
				</div>

				{/* The Couch Content */}
				{activeTab === "couch" && (
					<div>
						{/* Hero Section */}
						{featured ? (
							<div className="relative h-[60vh] overflow-hidden">
								<Image
									src={featured.thumbnails?.backdrop || "/hero-placeholder.jpg"}
									alt={featured.title}
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
									<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
										{featured.title}
									</h1>
									<p className="text-lg text-white/80 max-w-2xl mb-6 line-clamp-2">
										{featured.description}
									</p>
									<div className="flex gap-4">
										<Link href={`/media/couch/${featured._id}`}>
											<Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
												<Play className="h-5 w-5 mr-2" fill="currentColor" />
												Watch Now
											</Button>
										</Link>
										<Button variant="outline" className="text-white border-white hover:bg-white/10">
											More Info
										</Button>
									</div>
								</div>
							</div>
						) : (
							<div className="relative h-[40vh] bg-gradient-to-br from-yellow-500/20 via-background to-background flex items-center">
								<div className="container mx-auto px-4">
									<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
										The Couch
									</h1>
									<p className="text-lg text-muted-foreground max-w-2xl">
										Your home for action sports films, documentaries, and edits.
										Sit back, relax, and watch the best content from the community.
									</p>
								</div>
							</div>
						)}

						{/* Sport Filter */}
						<div className="container mx-auto px-4 py-6">
							<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
								{SPORT_TYPES.map((sport) => (
									<button
										key={sport.value}
										onClick={() => setSportFilter(sport.value)}
										className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
											sportFilter === sport.value
												? "bg-yellow-500 text-black"
												: "bg-secondary text-foreground hover:bg-secondary/80"
										}`}
									>
										{sport.label}
									</button>
								))}
							</div>
						</div>

						{/* Collections and Videos */}
						<div className="container mx-auto px-4 pb-12">
							{loadingCouch ? (
								<div className="flex justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
								</div>
							) : (
								<div className="space-y-10">
									{/* Show collections if any */}
									{displayCollections.map((collection) => (
										<div key={collection._id}>
											<div className="flex items-center justify-between mb-4">
												<div>
													<h2 className="text-xl font-bold text-foreground">
														{collection.name}
													</h2>
													{collection.description && (
														<p className="text-sm text-muted-foreground">
															{collection.description}
														</p>
													)}
												</div>
												<Link
													href={`/media/couch/collection/${collection._id}`}
													className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
												>
													See All
												</Link>
											</div>

											<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
												{collection.videos?.map((video) => (
													<VideoCard key={video._id} video={video} size="medium" />
												))}
											</div>
										</div>
									))}

									{/* Show recent videos */}
									{recentVideos.length > 0 && (
										<div>
											<div className="flex items-center justify-between mb-4">
												<div>
													<h2 className="text-xl font-bold text-foreground">
														Recent Videos
													</h2>
													<p className="text-sm text-muted-foreground">
														Latest additions to The Couch
													</p>
												</div>
											</div>

											<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
												{recentVideos.map((video) => (
													<VideoCard key={video._id} video={video} size="medium" />
												))}
											</div>
										</div>
									)}

									{/* Empty state */}
									{displayCollections.length === 0 && recentVideos.length === 0 && (
										<div className="text-center py-16">
											<Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
											<h2 className="text-xl font-bold text-foreground mb-2">No videos yet</h2>
											<p className="text-muted-foreground">
												Check back soon for action sports films and documentaries.
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* The Feed Content */}
				{activeTab === "feed" && (
					<div className="container mx-auto px-4 py-6">
						{/* Feed Filters */}
						<div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
							<button
								onClick={() => setFeedFilter("for-you")}
								className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
									feedFilter === "for-you"
										? "bg-yellow-500 text-black"
										: "bg-secondary text-foreground hover:bg-secondary/80"
								}`}
							>
								<Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								For You
							</button>
							{loggedIn && (
								<button
									onClick={() => setFeedFilter("homies")}
									className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
										feedFilter === "homies"
											? "bg-yellow-500 text-black"
											: "bg-secondary text-foreground hover:bg-secondary/80"
									}`}
								>
									<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
									Homies
								</button>
							)}
							<button
								onClick={() => setFeedFilter("trending")}
								className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
									feedFilter === "trending"
										? "bg-yellow-500 text-black"
										: "bg-secondary text-foreground hover:bg-secondary/80"
								}`}
							>
								<TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								Trending
							</button>
						</div>

						{/* Feed Posts */}
						{loadingFeed ? (
							<div className="flex justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
							</div>
						) : displayPosts.length === 0 ? (
							<div className="text-center py-16">
								<Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
								<h2 className="text-xl font-bold text-foreground mb-2">No posts yet</h2>
								<p className="text-muted-foreground mb-6">
									Be the first to share a clip with the community!
								</p>
								{loggedIn ? (
									<Link href="/media/feed/upload">
										<Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
											<Plus className="h-4 w-4 mr-2" />
											Create Post
										</Button>
									</Link>
								) : (
									<Link href="/login">
										<Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
											Sign in to Post
										</Button>
									</Link>
								)}
							</div>
						) : (
							<div className="max-w-lg mx-auto space-y-6">
								{displayPosts.map((post) => (
									<FeedPost
										key={post._id}
										post={post}
										currentUserId={null}
										onReaction={handleReaction}
										autoPlay={false}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
