import { React, useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import axios from "axios";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
	ChevronLeft,
	ChevronRight,
	Upload,
	User,
	Sparkles,
	Camera,
	Check,
	Skateboard,
} from "lucide-react";

// Sport categories with icons
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

// Default avatar icons - cool action sports themed
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

// Rider style options
const RIDER_STYLES = [
	"Freestyle",
	"Street",
	"Vert",
	"Park",
	"Downhill",
	"Flatground",
	"Technical",
	"Flow",
	"All-Mountain",
	"Backcountry",
];

export default function Signup() {
	const { logIn } = useContext(AuthContext);
	const router = useRouter();

	// Multi-step form state
	const [step, setStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	// Step 1: Basic info
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Step 2: Avatar
	const [avatarType, setAvatarType] = useState("icon"); // "icon" or "upload"
	const [selectedIcon, setSelectedIcon] = useState(null);
	const [uploadedImage, setUploadedImage] = useState(null);
	const [uploadPreview, setUploadPreview] = useState(null);

	// Step 3: Sports
	const [selectedSports, setSelectedSports] = useState([]);

	// Step 4: Rider profile (optional)
	const [riderProfile, setRiderProfile] = useState({
		nickname: "",
		age: "",
		height: "",
		weight: "",
		nationality: "",
		riderStyle: "",
		alternateSport: "",
		motto: "",
		dreamDate: "",
		favoriteMovie: "",
		favoriteReading: "",
		favoriteMusic: "",
		favoriteCourse: "",
		sickestTrick: "",
		greatestStrength: "",
		greatestWeakness: "",
		otherHobbies: "",
	});

	const validateStep1 = () => {
		const newErrors = {};
		if (!name.trim()) newErrors.name = "Name is required";
		if (!email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
		if (!password) newErrors.password = "Password is required";
		else if (password.length < 8) newErrors.password = "Must be 8+ characters";
		if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setUploadedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setUploadPreview(reader.result);
			};
			reader.readAsDataURL(file);
			setAvatarType("upload");
			setSelectedIcon(null);
		}
	};

	const handleIconSelect = (icon) => {
		setSelectedIcon(icon);
		setAvatarType("icon");
		setUploadedImage(null);
		setUploadPreview(null);
	};

	const toggleSport = (sportId) => {
		setSelectedSports((prev) =>
			prev.includes(sportId)
				? prev.filter((s) => s !== sportId)
				: [...prev, sportId]
		);
	};

	const handleGoogleSignIn = async () => {
		signIn("google", { callbackUrl: "/profile" });
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			// Build user data
			const userData = {
				name,
				email,
				password,
				sports: selectedSports,
				riderProfile: {
					...riderProfile,
					avatarType,
					avatarIcon: selectedIcon,
				},
			};

			// Register user
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
				userData
			);

			// Upload profile image if provided
			if (uploadedImage) {
				const formData = new FormData();
				formData.append("profileImage", uploadedImage);
				// This would need a separate endpoint - for now we'll handle it later
			}

			// Auto-login after registration
			const loginResult = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (loginResult.error) {
				setErrors({ submit: "Account created but login failed. Please try logging in." });
				return;
			}

			logIn(loginResult.token, email);
			router.push("/profile");
		} catch (error) {
			console.error("Registration error:", error);
			setErrors({
				submit: error.response?.data?.message || "Registration failed. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const nextStep = () => {
		if (step === 1 && !validateStep1()) return;
		setStep((s) => Math.min(s + 1, 4));
	};

	const prevStep = () => setStep((s) => Math.max(s - 1, 1));

	const renderProgressBar = () => (
		<div className="flex items-center justify-center gap-2 mb-8">
			{[1, 2, 3, 4].map((s) => (
				<div key={s} className="flex items-center">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
							s < step
								? "bg-primary text-primary-foreground"
								: s === step
								? "bg-primary text-primary-foreground ring-4 ring-primary/30"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{s < step ? <Check className="w-5 h-5" /> : s}
					</div>
					{s < 4 && (
						<div
							className={`w-8 h-1 mx-1 ${
								s < step ? "bg-primary" : "bg-muted"
							}`}
						/>
					)}
				</div>
			))}
		</div>
	);

	const renderStep1 = () => (
		<div className="space-y-4">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold">Create Your Account</h2>
				<p className="text-muted-foreground mt-1">Let's get you started on your journey</p>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Name</label>
				<Input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your name"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Email</label>
				<Input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="your@email.com"
					className={errors.email ? "border-destructive" : ""}
				/>
				{errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Password</label>
				<Input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="8+ characters"
					className={errors.password ? "border-destructive" : ""}
				/>
				{errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Confirm Password</label>
				<Input
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirm your password"
					className={errors.confirmPassword ? "border-destructive" : ""}
				/>
				{errors.confirmPassword && (
					<p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
				)}
			</div>

			<div className="pt-4">
				<div className="flex items-center gap-4 mb-4">
					<div className="flex-1 h-px bg-border" />
					<span className="text-muted-foreground text-sm">or</span>
					<div className="flex-1 h-px bg-border" />
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={handleGoogleSignIn}
					type="button"
				>
					<GoogleIcon className="mr-2 h-4 w-4" />
					Sign up with Google
				</Button>
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold">Choose Your Avatar</h2>
				<p className="text-muted-foreground mt-1">
					Upload a photo or pick a cool icon
				</p>
			</div>

			{/* Current selection preview */}
			<div className="flex justify-center mb-6">
				<div className="relative">
					{uploadPreview ? (
						<Image
							src={uploadPreview}
							alt="Profile preview"
							width={120}
							height={120}
							className="rounded-full object-cover border-4 border-primary"
							style={{ width: 120, height: 120 }}
						/>
					) : selectedIcon ? (
						<div
							className={`w-[120px] h-[120px] rounded-full ${selectedIcon.bg} flex items-center justify-center text-5xl border-4 border-primary`}
						>
							{selectedIcon.emoji}
						</div>
					) : (
						<div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-border">
							<User className="w-12 h-12 text-muted-foreground" />
						</div>
					)}
				</div>
			</div>

			{/* Upload option */}
			<div className="mb-6">
				<label className="block text-sm font-medium mb-2 text-center">
					Upload Your Photo
				</label>
				<div className="flex justify-center">
					<label className="cursor-pointer">
						<div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
							<Camera className="w-5 h-5" />
							<span>Choose Photo</span>
						</div>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="hidden"
						/>
					</label>
				</div>
			</div>

			{/* Icon options */}
			<div>
				<label className="block text-sm font-medium mb-3 text-center">
					Or Pick an Icon
				</label>
				<div className="grid grid-cols-4 sm:grid-cols-6 gap-3 justify-items-center">
					{DEFAULT_AVATARS.map((avatar) => (
						<button
							key={avatar.id}
							type="button"
							onClick={() => handleIconSelect(avatar)}
							className={`w-14 h-14 rounded-full ${avatar.bg} flex items-center justify-center text-2xl transition-all hover:scale-110 ${
								selectedIcon?.id === avatar.id
									? "ring-4 ring-primary ring-offset-2"
									: ""
							}`}
						>
							{avatar.emoji}
						</button>
					))}
				</div>
			</div>

			<p className="text-center text-sm text-muted-foreground mt-4">
				You can always change this later in your profile
			</p>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold">What Do You Ride?</h2>
				<p className="text-muted-foreground mt-1">
					Select all the sports you're into
				</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{SPORT_CATEGORIES.map((sport) => (
					<button
						key={sport.id}
						type="button"
						onClick={() => toggleSport(sport.id)}
						className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
							selectedSports.includes(sport.id)
								? "border-primary bg-primary/10"
								: "border-border hover:border-primary/50"
						}`}
					>
						<div className="text-3xl mb-2">{sport.emoji}</div>
						<div className="font-medium text-sm">{sport.name}</div>
						{selectedSports.includes(sport.id) && (
							<Check className="w-4 h-4 text-primary mx-auto mt-1" />
						)}
					</button>
				))}
			</div>

			{selectedSports.length === 0 && (
				<p className="text-center text-muted-foreground text-sm">
					Select at least one sport to personalize your experience
				</p>
			)}
		</div>
	);

	const renderStep4 = () => (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<div className="flex items-center justify-center gap-2 mb-2">
					<Sparkles className="w-6 h-6 text-primary" />
					<h2 className="text-2xl font-bold">Rider Profile</h2>
					<Sparkles className="w-6 h-6 text-primary" />
				</div>
				<p className="text-muted-foreground mt-1">
					Optional but fun! Build your rider card
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Nickname</label>
					<Input
						type="text"
						placeholder='"The Kid"'
						value={riderProfile.nickname}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, nickname: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Rider Style</label>
					<select
						className="w-full px-3 py-2 rounded-md border border-input bg-background"
						value={riderProfile.riderStyle}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, riderStyle: e.target.value })
						}
					>
						<option value="">Select style...</option>
						{RIDER_STYLES.map((style) => (
							<option key={style} value={style}>
								{style}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Age</label>
					<Input
						type="number"
						placeholder="19"
						value={riderProfile.age}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, age: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Nationality</label>
					<Input
						type="text"
						placeholder="American"
						value={riderProfile.nationality}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, nationality: e.target.value })
						}
					/>
				</div>

				<div className="sm:col-span-2">
					<label className="block text-sm font-medium mb-1">Motto</label>
					<Input
						type="text"
						placeholder='"Try anything once"'
						value={riderProfile.motto}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, motto: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Sickest Trick</label>
					<Input
						type="text"
						placeholder="Coffin Roll"
						value={riderProfile.sickestTrick}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, sickestTrick: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Alternate Sport</label>
					<Input
						type="text"
						placeholder="Street Luge"
						value={riderProfile.alternateSport}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, alternateSport: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Greatest Strength</label>
					<Input
						type="text"
						placeholder="Speed"
						value={riderProfile.greatestStrength}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, greatestStrength: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Greatest Weakness</label>
					<Input
						type="text"
						placeholder="Gear"
						value={riderProfile.greatestWeakness}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, greatestWeakness: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Dream Date</label>
					<Input
						type="text"
						placeholder="Pamela Zoolalian"
						value={riderProfile.dreamDate}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, dreamDate: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Favorite Movie</label>
					<Input
						type="text"
						placeholder="Enter the Dragon"
						value={riderProfile.favoriteMovie}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, favoriteMovie: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Favorite Music</label>
					<Input
						type="text"
						placeholder="70's Rock"
						value={riderProfile.favoriteMusic}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, favoriteMusic: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Favorite Reading</label>
					<Input
						type="text"
						placeholder="Thrasher Magazine"
						value={riderProfile.favoriteReading}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, favoriteReading: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Favorite Spot</label>
					<Input
						type="text"
						placeholder="Merqury City"
						value={riderProfile.favoriteCourse}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, favoriteCourse: e.target.value })
						}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Other Hobbies</label>
					<Input
						type="text"
						placeholder="Computer hacking, photography..."
						value={riderProfile.otherHobbies}
						onChange={(e) =>
							setRiderProfile({ ...riderProfile, otherHobbies: e.target.value })
						}
					/>
				</div>
			</div>

			<p className="text-center text-sm text-muted-foreground">
				Don't worry, you can fill these out or edit them anytime!
			</p>
		</div>
	);

	return (
		<>
			<Head>
				<title>The Trick Book - Sign Up</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Create your TrickBook account and join the action sports community" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-background py-8 px-4">
				<div className="max-w-lg mx-auto">
					{/* Logo */}
					<div className="text-center mb-6">
						<Link href="/">
							<Image
								src="/adaptive-icon.png"
								width={80}
								height={80}
								alt="TrickBook"
								className="mx-auto"
							/>
						</Link>
					</div>

					{renderProgressBar()}

					<Card className="border-2">
						<CardContent className="pt-6">
							{step === 1 && renderStep1()}
							{step === 2 && renderStep2()}
							{step === 3 && renderStep3()}
							{step === 4 && renderStep4()}

							{errors.submit && (
								<div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
									{errors.submit}
								</div>
							)}

							{/* Navigation buttons */}
							<div className="flex justify-between mt-8 pt-4 border-t">
								{step > 1 ? (
									<Button variant="ghost" onClick={prevStep} type="button">
										<ChevronLeft className="w-4 h-4 mr-1" />
										Back
									</Button>
								) : (
									<div />
								)}

								{step < 4 ? (
									<Button onClick={nextStep} type="button">
										{step === 1 ? "Get Started" : "Continue"}
										<ChevronRight className="w-4 h-4 ml-1" />
									</Button>
								) : (
									<Button
										onClick={handleSubmit}
										disabled={isSubmitting}
										className="bg-primary hover:bg-primary/90"
									>
										{isSubmitting ? "Creating Account..." : "Create My Account"}
									</Button>
								)}
							</div>

							{step === 1 && (
								<p className="text-center text-sm text-muted-foreground mt-4">
									Already have an account?{" "}
									<Link href="/login" className="text-primary hover:underline font-medium">
										Log in
									</Link>
								</p>
							)}

							{step > 1 && step < 4 && (
								<button
									type="button"
									onClick={() => setStep(4)}
									className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground"
								>
									Skip to finish →
								</button>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
