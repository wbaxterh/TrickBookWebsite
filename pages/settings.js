import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import jwt from "jsonwebtoken";
import axios from "axios";
import { useTheme } from "next-themes";
import { AuthContext } from "../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
	User,
	Settings,
	Camera,
	Sun,
	Moon,
	Monitor,
	Users,
	Trash2,
	Save,
	Eye,
	Check,
	X,
} from "lucide-react";

// Sport categories
const SPORT_CATEGORIES = [
	{ id: "skateboarding", name: "Skateboarding", emoji: "🛹" },
	{ id: "snowboarding", name: "Snowboarding", emoji: "🏂" },
	{ id: "skiing", name: "Skiing", emoji: "⛷️" },
	{ id: "bmx", name: "BMX", emoji: "🚴" },
	{ id: "mtb", name: "Mountain Biking", emoji: "🚵" },
	{ id: "scooter", name: "Scooter", emoji: "🛴" },
	{ id: "surfing", name: "Surfing", emoji: "🏄" },
	{ id: "wakeboarding", name: "Wakeboarding", emoji: "🌊" },
	{ id: "rollerblading", name: "Rollerblading", emoji: "🛼" },
];

// Avatar icons
const DEFAULT_AVATARS = [
	{ id: "skater1", emoji: "🛹", bg: "bg-yellow-500" },
	{ id: "snowboarder", emoji: "🏂", bg: "bg-blue-500" },
	{ id: "fire", emoji: "🔥", bg: "bg-orange-500" },
	{ id: "lightning", emoji: "⚡", bg: "bg-purple-500" },
	{ id: "skull", emoji: "💀", bg: "bg-gray-700" },
	{ id: "alien", emoji: "👽", bg: "bg-green-500" },
	{ id: "robot", emoji: "🤖", bg: "bg-cyan-500" },
	{ id: "devil", emoji: "😈", bg: "bg-red-500" },
	{ id: "cool", emoji: "😎", bg: "bg-indigo-500" },
	{ id: "crown", emoji: "👑", bg: "bg-amber-500" },
	{ id: "rocket", emoji: "🚀", bg: "bg-pink-500" },
	{ id: "ghost", emoji: "👻", bg: "bg-slate-500" },
];

// Rider styles
const RIDER_STYLES = [
	"Freestyle", "Street", "Vert", "Park", "Downhill",
	"Flatground", "Technical", "Flow", "All-Mountain", "Backcountry",
];

export default function SettingsPage() {
	const router = useRouter();
	const { token, logOut, name, email, imageUri, setImageUri, setName } = useContext(AuthContext);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [userId, setUserId] = useState(null);

	// Profile data
	const [profileData, setProfileData] = useState({
		name: "",
		sports: [],
		riderProfile: {
			nickname: "",
			age: "",
			nationality: "",
			riderStyle: "",
			motto: "",
			sickestTrick: "",
			alternateSport: "",
			greatestStrength: "",
			greatestWeakness: "",
			dreamDate: "",
			favoriteMovie: "",
			favoriteMusic: "",
			favoriteReading: "",
			favoriteCourse: "",
			otherHobbies: "",
			avatarType: "icon",
			avatarIcon: null,
		},
	});

	// Network settings
	const [networkEnabled, setNetworkEnabled] = useState(false);
	const [networkLoading, setNetworkLoading] = useState(false);

	// Avatar upload
	const [uploadPreview, setUploadPreview] = useState(null);
	const [uploadedFile, setUploadedFile] = useState(null);

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://api.thetrickbook.com";

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!token) {
			router.push("/login");
			return;
		}

		const decoded = jwt.decode(token);
		if (decoded?.userId) {
			setUserId(decoded.userId);
			fetchUserData(decoded.userId);
		}
	}, [token]);

	const fetchUserData = async (uid) => {
		try {
			const response = await axios.get(`${baseUrl}/api/user/${uid}`, {
				headers: { "x-auth-token": token },
			});

			const user = response.data;
			setProfileData({
				name: user.name || "",
				sports: user.sports || [],
				riderProfile: {
					nickname: user.riderProfile?.nickname || "",
					age: user.riderProfile?.age || "",
					nationality: user.riderProfile?.nationality || "",
					riderStyle: user.riderProfile?.riderStyle || "",
					motto: user.riderProfile?.motto || "",
					sickestTrick: user.riderProfile?.sickestTrick || "",
					alternateSport: user.riderProfile?.alternateSport || "",
					greatestStrength: user.riderProfile?.greatestStrength || "",
					greatestWeakness: user.riderProfile?.greatestWeakness || "",
					dreamDate: user.riderProfile?.dreamDate || "",
					favoriteMovie: user.riderProfile?.favoriteMovie || "",
					favoriteMusic: user.riderProfile?.favoriteMusic || "",
					favoriteReading: user.riderProfile?.favoriteReading || "",
					favoriteCourse: user.riderProfile?.favoriteCourse || "",
					otherHobbies: user.riderProfile?.otherHobbies || "",
					avatarType: user.riderProfile?.avatarType || "icon",
					avatarIcon: user.riderProfile?.avatarIcon || null,
				},
			});
			setNetworkEnabled(user.network || false);

			if (user.imageUri) {
				setUploadPreview(user.imageUri);
			}
		} catch (err) {
			console.error("Error fetching user data:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await axios.put(
				`${baseUrl}/api/user/${userId}`,
				{
					name: profileData.name,
					sports: profileData.sports,
					riderProfile: profileData.riderProfile,
				},
				{ headers: { "x-auth-token": token } }
			);

			// Update context
			setName(profileData.name);

			alert("Profile updated successfully!");
		} catch (err) {
			console.error("Error saving profile:", err);
			alert("Failed to save profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setUploadedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setUploadPreview(reader.result);
				setProfileData((prev) => ({
					...prev,
					riderProfile: {
						...prev.riderProfile,
						avatarType: "upload",
						avatarIcon: null,
					},
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleIconSelect = (icon) => {
		setProfileData((prev) => ({
			...prev,
			riderProfile: {
				...prev.riderProfile,
				avatarType: "icon",
				avatarIcon: icon,
			},
		}));
		setUploadPreview(null);
		setUploadedFile(null);
	};

	const toggleSport = (sportId) => {
		setProfileData((prev) => ({
			...prev,
			sports: prev.sports.includes(sportId)
				? prev.sports.filter((s) => s !== sportId)
				: [...prev.sports, sportId],
		}));
	};

	const updateRiderProfile = (field, value) => {
		setProfileData((prev) => ({
			...prev,
			riderProfile: {
				...prev.riderProfile,
				[field]: value,
			},
		}));
	};

	const handleNetworkToggle = async (checked) => {
		setNetworkLoading(true);
		try {
			await axios.put(
				`${baseUrl}/api/users/${userId}/network`,
				{ network: checked },
				{ headers: { "x-auth-token": token } }
			);
			setNetworkEnabled(checked);
		} catch (err) {
			console.error("Error toggling network:", err);
		} finally {
			setNetworkLoading(false);
		}
	};

	const handleLogout = () => {
		logOut();
		router.push("/login");
	};

	const handleDeleteAccount = async () => {
		if (
			confirm(
				"Are you sure you want to delete your account? This action is irreversible."
			)
		) {
			try {
				await axios.delete(`${baseUrl}/api/users/${userId}`, {
					headers: { "x-auth-token": token },
				});
				alert("Your account has been deleted.");
				logOut();
				router.push("/");
			} catch (error) {
				console.error("Error deleting account:", error);
				alert("Failed to delete account. Please try again.");
			}
		}
	};

	const renderAvatar = () => {
		if (uploadPreview) {
			return (
				<Image
					src={uploadPreview}
					alt="Profile"
					width={100}
					height={100}
					className="rounded-full object-cover"
					style={{ width: 100, height: 100 }}
				/>
			);
		}

		if (profileData.riderProfile.avatarIcon) {
			const icon = profileData.riderProfile.avatarIcon;
			return (
				<div
					className={`w-[100px] h-[100px] rounded-full ${icon.bg || "bg-primary"} flex items-center justify-center text-4xl`}
				>
					{icon.emoji}
				</div>
			);
		}

		return (
			<div className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center">
				<User className="w-10 h-10 text-muted-foreground" />
			</div>
		);
	};

	if (!mounted || loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Settings - TrickBook</title>
			</Head>

			<div className="min-h-screen bg-background py-8 px-4">
				<div className="max-w-3xl mx-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<Settings className="w-8 h-8 text-primary" />
							<h1 className="text-2xl font-bold">Settings</h1>
						</div>
						<Link href={`/profile/${userId}`}>
							<Button variant="outline">
								<Eye className="w-4 h-4 mr-2" />
								View Profile
							</Button>
						</Link>
					</div>

					<Tabs defaultValue="profile" className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-6">
							<TabsTrigger value="profile">Profile</TabsTrigger>
							<TabsTrigger value="preferences">Preferences</TabsTrigger>
							<TabsTrigger value="account">Account</TabsTrigger>
						</TabsList>

						{/* Profile Tab */}
						<TabsContent value="profile" className="space-y-6">
							{/* Avatar Section */}
							<Card>
								<CardHeader>
									<CardTitle>Profile Picture</CardTitle>
									<CardDescription>Upload a photo or choose an icon</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col sm:flex-row items-center gap-6">
										{renderAvatar()}

										<div className="flex-1 space-y-4">
											<label className="cursor-pointer">
												<div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
													<Camera className="w-4 h-4" />
													<span>Upload Photo</span>
												</div>
												<input
													type="file"
													accept="image/*"
													onChange={handleImageUpload}
													className="hidden"
												/>
											</label>

											<div className="flex flex-wrap gap-2">
												{DEFAULT_AVATARS.map((avatar) => (
													<button
														key={avatar.id}
														type="button"
														onClick={() => handleIconSelect(avatar)}
														className={`w-10 h-10 rounded-full ${avatar.bg} flex items-center justify-center text-lg transition-all hover:scale-110 ${
															profileData.riderProfile.avatarIcon?.id === avatar.id
																? "ring-2 ring-primary ring-offset-2"
																: ""
														}`}
													>
														{avatar.emoji}
													</button>
												))}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Basic Info */}
							<Card>
								<CardHeader>
									<CardTitle>Basic Info</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-1">Name</label>
										<Input
											value={profileData.name}
											onChange={(e) =>
												setProfileData((prev) => ({ ...prev, name: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Email</label>
										<Input value={email} disabled className="bg-muted" />
										<p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1">Nickname</label>
											<Input
												placeholder='"The Kid"'
												value={profileData.riderProfile.nickname}
												onChange={(e) => updateRiderProfile("nickname", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Rider Style</label>
											<select
												className="w-full px-3 py-2 rounded-md border border-input bg-background"
												value={profileData.riderProfile.riderStyle}
												onChange={(e) => updateRiderProfile("riderStyle", e.target.value)}
											>
												<option value="">Select style...</option>
												{RIDER_STYLES.map((style) => (
													<option key={style} value={style}>{style}</option>
												))}
											</select>
										</div>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Motto</label>
										<Input
											placeholder='"Try anything once"'
											value={profileData.riderProfile.motto}
											onChange={(e) => updateRiderProfile("motto", e.target.value)}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Sports */}
							<Card>
								<CardHeader>
									<CardTitle>Sports</CardTitle>
									<CardDescription>Select all the sports you ride</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
										{SPORT_CATEGORIES.map((sport) => (
											<button
												key={sport.id}
												type="button"
												onClick={() => toggleSport(sport.id)}
												className={`p-2 rounded-lg border-2 transition-all text-center ${
													profileData.sports.includes(sport.id)
														? "border-primary bg-primary/10"
														: "border-border hover:border-primary/50"
												}`}
											>
												<div className="text-xl">{sport.emoji}</div>
												<div className="text-xs mt-1">{sport.name}</div>
											</button>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Rider Details */}
							<Card>
								<CardHeader>
									<CardTitle>Rider Details</CardTitle>
									<CardDescription>Optional fun stuff for your profile</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1">Age</label>
											<Input
												type="number"
												value={profileData.riderProfile.age}
												onChange={(e) => updateRiderProfile("age", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Nationality</label>
											<Input
												value={profileData.riderProfile.nationality}
												onChange={(e) => updateRiderProfile("nationality", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Sickest Trick</label>
											<Input
												value={profileData.riderProfile.sickestTrick}
												onChange={(e) => updateRiderProfile("sickestTrick", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Alternate Sport</label>
											<Input
												value={profileData.riderProfile.alternateSport}
												onChange={(e) => updateRiderProfile("alternateSport", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Greatest Strength</label>
											<Input
												value={profileData.riderProfile.greatestStrength}
												onChange={(e) => updateRiderProfile("greatestStrength", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Greatest Weakness</label>
											<Input
												value={profileData.riderProfile.greatestWeakness}
												onChange={(e) => updateRiderProfile("greatestWeakness", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Dream Date</label>
											<Input
												value={profileData.riderProfile.dreamDate}
												onChange={(e) => updateRiderProfile("dreamDate", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Favorite Movie</label>
											<Input
												value={profileData.riderProfile.favoriteMovie}
												onChange={(e) => updateRiderProfile("favoriteMovie", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Favorite Music</label>
											<Input
												value={profileData.riderProfile.favoriteMusic}
												onChange={(e) => updateRiderProfile("favoriteMusic", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Favorite Reading</label>
											<Input
												value={profileData.riderProfile.favoriteReading}
												onChange={(e) => updateRiderProfile("favoriteReading", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Favorite Spot</label>
											<Input
												value={profileData.riderProfile.favoriteCourse}
												onChange={(e) => updateRiderProfile("favoriteCourse", e.target.value)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Other Hobbies</label>
											<Input
												value={profileData.riderProfile.otherHobbies}
												onChange={(e) => updateRiderProfile("otherHobbies", e.target.value)}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Save Button */}
							<Button onClick={handleSave} disabled={saving} className="w-full">
								<Save className="w-4 h-4 mr-2" />
								{saving ? "Saving..." : "Save Changes"}
							</Button>
						</TabsContent>

						{/* Preferences Tab */}
						<TabsContent value="preferences" className="space-y-6">
							{/* Theme */}
							<Card>
								<CardHeader>
									<CardTitle>Appearance</CardTitle>
									<CardDescription>Customize how TrickBook looks</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium mr-4">Theme:</span>
										<div className="flex gap-2">
											<Button
												variant={theme === "light" ? "default" : "outline"}
												size="sm"
												onClick={() => setTheme("light")}
											>
												<Sun className="w-4 h-4 mr-1" />
												Light
											</Button>
											<Button
												variant={theme === "dark" ? "default" : "outline"}
												size="sm"
												onClick={() => setTheme("dark")}
											>
												<Moon className="w-4 h-4 mr-1" />
												Dark
											</Button>
											<Button
												variant={theme === "system" ? "default" : "outline"}
												size="sm"
												onClick={() => setTheme("system")}
											>
												<Monitor className="w-4 h-4 mr-1" />
												System
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Network */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="w-5 h-5" />
										Network Settings
									</CardTitle>
									<CardDescription>Control how others can find you</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
										<div>
											<p className="font-medium">Discoverable</p>
											<p className="text-sm text-muted-foreground">
												Allow other riders to find you and send homie requests
											</p>
										</div>
										<Switch
											checked={networkEnabled}
											onCheckedChange={handleNetworkToggle}
											disabled={networkLoading}
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Account Tab */}
						<TabsContent value="account" className="space-y-6">
							{/* Logout */}
							<Card>
								<CardHeader>
									<CardTitle>Session</CardTitle>
								</CardHeader>
								<CardContent>
									<Button variant="outline" onClick={handleLogout}>
										Logout
									</Button>
								</CardContent>
							</Card>

							{/* Danger Zone */}
							<Card className="border-destructive">
								<CardHeader>
									<CardTitle className="text-destructive">Danger Zone</CardTitle>
									<CardDescription>
										Permanently delete your account and all associated data
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="destructive" onClick={handleDeleteAccount}>
										<Trash2 className="w-4 h-4 mr-2" />
										Delete Account
									</Button>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
