import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import jwt from "jsonwebtoken";
import { AuthContext } from "../../auth/AuthContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
	User,
	Heart,
	HandHeart,
	MapPin,
	List,
	Video,
	Settings,
	UserPlus,
	UserCheck,
	Quote,
	Zap,
	Target,
	Music,
	Film,
	BookOpen,
	Gamepad2,
	Globe,
	Award,
	TrendingUp,
} from "lucide-react";

// Sport emoji mapping
const SPORT_EMOJIS = {
	skateboarding: "🛹",
	snowboarding: "🏂",
	skiing: "⛷️",
	bmx: "🚴",
	mtb: "🚵",
	scooter: "🛴",
	surfing: "🏄",
	wakeboarding: "🌊",
	rollerblading: "🛼",
};

export default function PublicProfile() {
	const router = useRouter();
	const { userId } = router.query;
	const { token } = useContext(AuthContext);

	const [profile, setProfile] = useState(null);
	const [stats, setStats] = useState(null);
	const [tricklists, setTricklists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isOwnProfile, setIsOwnProfile] = useState(false);
	const [homieStatus, setHomieStatus] = useState("none"); // none, pending, homies
	const [actionLoading, setActionLoading] = useState(false);

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://api.thetrickbook.com";

	useEffect(() => {
		if (!userId) return;

		const fetchProfile = async () => {
			setLoading(true);
			try {
				// Check if this is the current user's profile
				if (token) {
					const decoded = jwt.decode(token);
					setIsOwnProfile(decoded?.userId === userId);
				}

				// Fetch public profile
				const profileRes = await axios.get(`${baseUrl}/api/user/${userId}/public`);
				setProfile(profileRes.data);

				// Fetch user stats
				const statsRes = await axios.get(`${baseUrl}/api/user/${userId}/stats`);
				setStats(statsRes.data);

				// Fetch public tricklists
				const tricklistsRes = await axios.get(`${baseUrl}/api/listings?userId=${userId}&public=true`);
				setTricklists(Array.isArray(tricklistsRes.data) ? tricklistsRes.data : []);

				// Check homie status if logged in
				if (token && !isOwnProfile) {
					try {
						const homieRes = await axios.get(`${baseUrl}/api/users/homie-status/${userId}`, {
							headers: { "x-auth-token": token },
						});
						setHomieStatus(homieRes.data.status);
					} catch (e) {
						// Endpoint might not exist yet
					}
				}
			} catch (err) {
				console.error("Error fetching profile:", err);
				setError("Profile not found or is private");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [userId, token]);

	const handleHomieAction = async () => {
		if (!token) {
			router.push("/login");
			return;
		}

		setActionLoading(true);
		try {
			if (homieStatus === "none") {
				await axios.post(
					`${baseUrl}/api/users/${userId}/homie-request`,
					{},
					{ headers: { "x-auth-token": token } }
				);
				setHomieStatus("pending");
			}
		} catch (err) {
			console.error("Error with homie action:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const renderAvatar = () => {
		if (profile?.imageUri) {
			return (
				<Image
					src={profile.imageUri}
					alt={profile.name}
					width={120}
					height={120}
					className="rounded-full object-cover border-4 border-primary"
					style={{ width: 120, height: 120 }}
				/>
			);
		}

		if (profile?.riderProfile?.avatarIcon) {
			const icon = profile.riderProfile.avatarIcon;
			return (
				<div
					className={`w-[120px] h-[120px] rounded-full ${icon.bg || "bg-primary"} flex items-center justify-center text-5xl border-4 border-primary`}
				>
					{icon.emoji}
				</div>
			);
		}

		return (
			<div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-border">
				<User className="w-12 h-12 text-muted-foreground" />
			</div>
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="max-w-md mx-auto">
					<CardContent className="pt-6 text-center">
						<User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
						<p className="text-muted-foreground mb-4">{error || "This profile doesn't exist or is private."}</p>
						<Link href="/">
							<Button>Go Home</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const rp = profile.riderProfile || {};

	return (
		<>
			<Head>
				<title>{profile.name} - TrickBook Profile</title>
				<meta name="description" content={`${profile.name}'s rider profile on TrickBook`} />
			</Head>

			<div className="min-h-screen bg-background">
				{/* Hero Section */}
				<div className="bg-gradient-to-b from-primary/20 to-background pt-8 pb-16">
					<div className="max-w-4xl mx-auto px-4">
						{/* Profile Header */}
						<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
							{renderAvatar()}

							<div className="flex-1 text-center sm:text-left">
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
									<h1 className="text-3xl font-bold">{profile.name}</h1>
									{rp.nickname && (
										<span className="text-muted-foreground text-lg">"{rp.nickname}"</span>
									)}
								</div>

								{rp.motto && (
									<p className="text-muted-foreground italic flex items-center justify-center sm:justify-start gap-2 mb-3">
										<Quote className="w-4 h-4" />
										{rp.motto}
									</p>
								)}

								{/* Sports badges */}
								{profile.sports && profile.sports.length > 0 && (
									<div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
										{profile.sports.map((sport) => (
											<Badge key={sport} variant="secondary" className="text-sm">
												{SPORT_EMOJIS[sport] || "🎿"} {sport}
											</Badge>
										))}
									</div>
								)}

								{/* Action buttons */}
								<div className="flex flex-wrap justify-center sm:justify-start gap-2">
									{isOwnProfile ? (
										<Link href="/settings">
											<Button variant="outline">
												<Settings className="w-4 h-4 mr-2" />
												Edit Profile
											</Button>
										</Link>
									) : (
										<>
											{homieStatus === "none" && (
												<Button onClick={handleHomieAction} disabled={actionLoading}>
													<UserPlus className="w-4 h-4 mr-2" />
													Add Homie
												</Button>
											)}
											{homieStatus === "pending" && (
												<Button variant="outline" disabled>
													<UserPlus className="w-4 h-4 mr-2" />
													Request Sent
												</Button>
											)}
											{homieStatus === "homies" && (
												<Button variant="secondary" disabled>
													<UserCheck className="w-4 h-4 mr-2" />
													Homies
												</Button>
											)}
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Bar */}
				<div className="max-w-4xl mx-auto px-4 -mt-8">
					<Card>
						<CardContent className="py-4">
							<div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
								<div>
									<div className="flex items-center justify-center gap-1 text-red-500">
										<Heart className="w-5 h-5 fill-current" />
										<span className="text-2xl font-bold">{stats?.totalLove || 0}</span>
									</div>
									<p className="text-sm text-muted-foreground">Love</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 text-yellow-500">
										<span className="text-2xl">🙏</span>
										<span className="text-2xl font-bold">{stats?.totalRespect || 0}</span>
									</div>
									<p className="text-sm text-muted-foreground">Respect</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 text-blue-500">
										<List className="w-5 h-5" />
										<span className="text-2xl font-bold">{stats?.tricklistCount || 0}</span>
									</div>
									<p className="text-sm text-muted-foreground">TrickLists</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 text-purple-500">
										<Video className="w-5 h-5" />
										<span className="text-2xl font-bold">{stats?.postCount || 0}</span>
									</div>
									<p className="text-sm text-muted-foreground">Posts</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 text-green-500">
										<MapPin className="w-5 h-5" />
										<span className="text-2xl font-bold">{stats?.spotCount || 0}</span>
									</div>
									<p className="text-sm text-muted-foreground">Spots</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<div className="max-w-4xl mx-auto px-4 py-8">
					<Tabs defaultValue="about" className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-6">
							<TabsTrigger value="about">About</TabsTrigger>
							<TabsTrigger value="tricklists">TrickLists</TabsTrigger>
							<TabsTrigger value="activity">Activity</TabsTrigger>
						</TabsList>

						{/* About Tab - Rider Card */}
						<TabsContent value="about">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Rider Info Card */}
								<Card>
									<CardContent className="pt-6">
										<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
											<Award className="w-5 h-5 text-primary" />
											Rider Info
										</h3>
										<div className="space-y-3">
											{rp.riderStyle && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Rider Style</span>
													<span className="font-medium">{rp.riderStyle}</span>
												</div>
											)}
											{rp.age && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Age</span>
													<span className="font-medium">{rp.age}</span>
												</div>
											)}
											{rp.nationality && (
												<div className="flex justify-between">
													<span className="text-muted-foreground flex items-center gap-1">
														<Globe className="w-4 h-4" /> Nationality
													</span>
													<span className="font-medium">{rp.nationality}</span>
												</div>
											)}
											{rp.sickestTrick && (
												<div className="flex justify-between">
													<span className="text-muted-foreground flex items-center gap-1">
														<Zap className="w-4 h-4" /> Sickest Trick
													</span>
													<span className="font-medium">{rp.sickestTrick}</span>
												</div>
											)}
											{rp.alternateSport && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Alternate Sport</span>
													<span className="font-medium">{rp.alternateSport}</span>
												</div>
											)}
											{rp.favoriteCourse && (
												<div className="flex justify-between">
													<span className="text-muted-foreground flex items-center gap-1">
														<MapPin className="w-4 h-4" /> Favorite Spot
													</span>
													<span className="font-medium">{rp.favoriteCourse}</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Strengths & Weaknesses */}
								<Card>
									<CardContent className="pt-6">
										<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
											<TrendingUp className="w-5 h-5 text-primary" />
											Strengths & Weaknesses
										</h3>
										<div className="space-y-3">
											{rp.greatestStrength && (
												<div className="flex justify-between">
													<span className="text-muted-foreground flex items-center gap-1">
														<Target className="w-4 h-4 text-green-500" /> Greatest Strength
													</span>
													<span className="font-medium text-green-500">{rp.greatestStrength}</span>
												</div>
											)}
											{rp.greatestWeakness && (
												<div className="flex justify-between">
													<span className="text-muted-foreground flex items-center gap-1">
														<Target className="w-4 h-4 text-red-500" /> Greatest Weakness
													</span>
													<span className="font-medium text-red-500">{rp.greatestWeakness}</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Favorites Card */}
								<Card className="md:col-span-2">
									<CardContent className="pt-6">
										<h3 className="font-bold text-lg mb-4">Favorites</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{rp.dreamDate && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
													<span className="text-2xl">💕</span>
													<div>
														<p className="text-sm text-muted-foreground">Dream Date</p>
														<p className="font-medium">{rp.dreamDate}</p>
													</div>
												</div>
											)}
											{rp.favoriteMovie && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
													<Film className="w-6 h-6 text-primary" />
													<div>
														<p className="text-sm text-muted-foreground">Favorite Movie</p>
														<p className="font-medium">{rp.favoriteMovie}</p>
													</div>
												</div>
											)}
											{rp.favoriteMusic && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
													<Music className="w-6 h-6 text-primary" />
													<div>
														<p className="text-sm text-muted-foreground">Favorite Music</p>
														<p className="font-medium">{rp.favoriteMusic}</p>
													</div>
												</div>
											)}
											{rp.favoriteReading && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
													<BookOpen className="w-6 h-6 text-primary" />
													<div>
														<p className="text-sm text-muted-foreground">Favorite Reading</p>
														<p className="font-medium">{rp.favoriteReading}</p>
													</div>
												</div>
											)}
											{rp.otherHobbies && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 sm:col-span-2">
													<Gamepad2 className="w-6 h-6 text-primary" />
													<div>
														<p className="text-sm text-muted-foreground">Other Hobbies</p>
														<p className="font-medium">{rp.otherHobbies}</p>
													</div>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						{/* TrickLists Tab */}
						<TabsContent value="tricklists">
							{tricklists.length === 0 ? (
								<Card>
									<CardContent className="py-12 text-center">
										<List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">No public tricklists yet</p>
									</CardContent>
								</Card>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{tricklists.map((list) => (
										<Link key={list._id} href={`/trickbook/my-lists/${list._id}`}>
											<Card className="hover:border-primary transition-colors cursor-pointer">
												<CardContent className="py-4">
													<div className="flex items-center justify-between">
														<div>
															<h4 className="font-medium">{list.name}</h4>
															<p className="text-sm text-muted-foreground">
																{list.tricks?.length || 0} tricks
															</p>
														</div>
														<Badge variant="outline">
															{list.category || "Mixed"}
														</Badge>
													</div>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							)}
						</TabsContent>

						{/* Activity Tab */}
						<TabsContent value="activity">
							<Card>
								<CardContent className="py-12 text-center">
									<Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">Recent activity coming soon</p>
									<p className="text-sm text-muted-foreground mt-2">
										Posts, spots, and interactions will appear here
									</p>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
