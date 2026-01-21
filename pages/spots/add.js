import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../../auth/AuthContext";
import { createSpot } from "../../lib/apiSpots";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
	MapPin,
	ArrowLeft,
	Loader2,
	Link2,
	Globe,
	Check,
	AlertCircle,
	Info,
} from "lucide-react";

const AVAILABLE_TAGS = ["bowl", "street", "lights", "indoor", "beginner", "advanced", "park", "diy"];

// US State names mapping
const STATE_NAMES = {
	AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
	CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
	HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
	KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
	MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
	MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
	NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
	OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
	SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
	VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
	DC: "Washington D.C."
};

export default function AddSpot() {
	const { token, loggedIn } = useContext(AuthContext);
	const router = useRouter();

	const [formData, setFormData] = useState({
		name: "",
		latitude: "",
		longitude: "",
		city: "",
		state: "",
		description: "",
		imageURL: "",
		tags: [],
		isPublic: false,
	});
	const [googleMapsUrl, setGoogleMapsUrl] = useState("");
	const [inputMode, setInputMode] = useState("coordinates"); // "coordinates" or "url"
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [urlParsed, setUrlParsed] = useState(false);

	// Redirect if not logged in
	useEffect(() => {
		if (loggedIn === false) {
			router.push("/login?redirect=/spots/add");
		}
	}, [loggedIn, router]);

	// Parse Google Maps URL to extract coordinates
	const parseGoogleMapsUrl = (url) => {
		setError("");
		setUrlParsed(false);

		if (!url) return;

		try {
			// Pattern 1: https://www.google.com/maps/place/.../@43.6447,-70.2553,17z
			// Pattern 2: https://maps.google.com/?q=43.6447,-70.2553
			// Pattern 3: https://goo.gl/maps/... (short URLs)
			// Pattern 4: https://www.google.com/maps?q=43.6447,-70.2553
			// Pattern 5: https://www.google.com/maps/search/.../@43.6447,-70.2553

			let lat = null;
			let lng = null;
			let extractedName = "";

			// Try to extract coordinates from /@lat,lng pattern
			const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
			const atMatch = url.match(atPattern);

			if (atMatch) {
				lat = parseFloat(atMatch[1]);
				lng = parseFloat(atMatch[2]);
			}

			// Try ?q=lat,lng or ?ll=lat,lng pattern
			if (!lat || !lng) {
				const qPattern = /[?&](?:q|ll)=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
				const qMatch = url.match(qPattern);
				if (qMatch) {
					lat = parseFloat(qMatch[1]);
					lng = parseFloat(qMatch[2]);
				}
			}

			// Try to extract place name from URL
			const placePattern = /\/place\/([^/@]+)/;
			const placeMatch = url.match(placePattern);
			if (placeMatch) {
				extractedName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
			}

			if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
				setFormData((prev) => ({
					...prev,
					latitude: lat.toString(),
					longitude: lng.toString(),
					name: extractedName || prev.name,
				}));
				setUrlParsed(true);

				// Try to reverse geocode for city/state
				reverseGeocode(lat, lng);
			} else {
				setError("Could not extract coordinates from the URL. Please enter coordinates manually.");
			}
		} catch (err) {
			setError("Invalid URL format. Please enter coordinates manually.");
		}
	};

	// Reverse geocode to get city and state
	const reverseGeocode = async (lat, lng) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
				{
					headers: {
						"User-Agent": "TrickBook/1.0",
					},
				}
			);
			const data = await response.json();

			if (data.address) {
				const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
				const state = data.address.state || "";

				// Convert state name to abbreviation if in US
				let stateAbbr = state;
				const foundState = Object.entries(STATE_NAMES).find(
					([abbr, name]) => name.toLowerCase() === state.toLowerCase()
				);
				if (foundState) {
					stateAbbr = foundState[0];
				}

				setFormData((prev) => ({
					...prev,
					city: city || prev.city,
					state: stateAbbr || prev.state,
				}));
			}
		} catch (err) {
			console.error("Reverse geocoding failed:", err);
		}
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Validate required fields
		if (!formData.name.trim()) {
			setError("Spot name is required");
			setLoading(false);
			return;
		}

		const lat = parseFloat(formData.latitude);
		const lng = parseFloat(formData.longitude);

		if (isNaN(lat) || lat < -90 || lat > 90) {
			setError("Invalid latitude. Must be between -90 and 90.");
			setLoading(false);
			return;
		}

		if (isNaN(lng) || lng < -180 || lng > 180) {
			setError("Invalid longitude. Must be between -180 and 180.");
			setLoading(false);
			return;
		}

		try {
			const spotData = {
				name: formData.name.trim(),
				latitude: lat,
				longitude: lng,
				city: formData.city.trim(),
				state: formData.state.trim().toUpperCase(),
				description: formData.description.trim(),
				imageURL: formData.imageURL.trim() || null,
				tags: formData.tags.join(","),
				isPublic: formData.isPublic,
			};

			const result = await createSpot(spotData, token);
			setSuccess(true);

			// Redirect to the spot page after a short delay
			setTimeout(() => {
				const spotSlug = result.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
				router.push(`/spots/${result.state?.toLowerCase() || "unknown"}/${spotSlug}?id=${result._id}`);
			}, 1500);
		} catch (err) {
			console.error("Error creating spot:", err);
			setError(err.response?.data?.error || "Failed to create spot. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Show loading while checking auth
	if (loggedIn === undefined || loggedIn === false) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="max-w-md w-full mx-4">
					<CardContent className="pt-6 text-center">
						<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<Check className="h-8 w-8 text-white" />
						</div>
						<h2 className="text-2xl font-bold text-foreground mb-2">Spot Added!</h2>
						<p className="text-muted-foreground mb-4">
							{formData.isPublic
								? "Your spot has been submitted for review. It will appear publicly once approved."
								: "Your spot has been saved to your private collection."}
						</p>
						<Loader2 className="h-5 w-5 animate-spin mx-auto text-yellow-500" />
						<p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Add a Spot | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Add a new skate spot to The Trick Book" />
			</Head>

			<div className="min-h-screen bg-background">
				<div className="container max-w-2xl py-8">
					{/* Back Link */}
					<Link
						href="/spots"
						className="inline-flex items-center gap-1 text-muted-foreground hover:text-yellow-500 transition-colors mb-6 no-underline"
					>
						<ArrowLeft className="h-4 w-4" />
						<span>Back to Spots</span>
					</Link>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-6 w-6 text-yellow-500" />
								Add a New Spot
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Input Mode Toggle */}
								<div className="flex gap-2 p-1 bg-muted rounded-lg">
									<button
										type="button"
										onClick={() => setInputMode("coordinates")}
										className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
											inputMode === "coordinates"
												? "bg-background text-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										<Globe className="h-4 w-4" />
										Coordinates
									</button>
									<button
										type="button"
										onClick={() => setInputMode("url")}
										className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
											inputMode === "url"
												? "bg-background text-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										<Link2 className="h-4 w-4" />
										Google Maps URL
									</button>
								</div>

								{/* Google Maps URL Input */}
								{inputMode === "url" && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">
											Google Maps Link
										</label>
										<div className="flex gap-2">
											<input
												type="text"
												value={googleMapsUrl}
												onChange={(e) => setGoogleMapsUrl(e.target.value)}
												placeholder="https://www.google.com/maps/place/..."
												className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
											/>
											<Button
												type="button"
												onClick={() => parseGoogleMapsUrl(googleMapsUrl)}
												className="bg-yellow-500 text-black hover:bg-yellow-400"
											>
												Parse
											</Button>
										</div>
										{urlParsed && (
											<p className="text-sm text-green-500 flex items-center gap-1">
												<Check className="h-4 w-4" />
												Coordinates extracted successfully!
											</p>
										)}
										<p className="text-xs text-muted-foreground">
											Paste a Google Maps link and we'll extract the coordinates automatically
										</p>
									</div>
								)}

								{/* Spot Name */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-foreground">
										Spot Name *
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										placeholder="e.g., Portland Skatepark"
										className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
										required
									/>
								</div>

								{/* Coordinates */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">
											Latitude *
										</label>
										<input
											type="number"
											name="latitude"
											value={formData.latitude}
											onChange={handleInputChange}
											placeholder="43.6447"
											step="any"
											className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
											required
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">
											Longitude *
										</label>
										<input
											type="number"
											name="longitude"
											value={formData.longitude}
											onChange={handleInputChange}
											placeholder="-70.2553"
											step="any"
											className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
											required
										/>
									</div>
								</div>

								{/* City and State */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">
											City
										</label>
										<input
											type="text"
											name="city"
											value={formData.city}
											onChange={handleInputChange}
											placeholder="Portland"
											className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-foreground">
											State
										</label>
										<input
											type="text"
											name="state"
											value={formData.state}
											onChange={handleInputChange}
											placeholder="ME"
											maxLength={2}
											className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 uppercase"
										/>
									</div>
								</div>

								{/* Description */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-foreground">
										Description
									</label>
									<textarea
										name="description"
										value={formData.description}
										onChange={handleInputChange}
										placeholder="Describe the spot - features, obstacles, etc."
										rows={3}
										className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
									/>
								</div>

								{/* Image URL */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-foreground">
										Image URL
									</label>
									<input
										type="url"
										name="imageURL"
										value={formData.imageURL}
										onChange={handleInputChange}
										placeholder="https://example.com/image.jpg"
										className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
									/>
									<p className="text-xs text-muted-foreground">
										Optional: Add a direct link to an image of the spot
									</p>
								</div>

								{/* Tags */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-foreground">
										Tags
									</label>
									<div className="flex flex-wrap gap-2">
										{AVAILABLE_TAGS.map((tag) => (
											<Badge
												key={tag}
												variant={formData.tags.includes(tag) ? "default" : "outline"}
												className={`cursor-pointer transition-colors ${
													formData.tags.includes(tag)
														? "bg-yellow-500 text-black hover:bg-yellow-400"
														: "hover:border-yellow-500 hover:text-yellow-500"
												}`}
												onClick={() => handleTagToggle(tag)}
											>
												{tag}
											</Badge>
										))}
									</div>
								</div>

								{/* Public Checkbox */}
								<div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
									<input
										type="checkbox"
										name="isPublic"
										id="isPublic"
										checked={formData.isPublic}
										onChange={handleInputChange}
										className="mt-1 h-4 w-4 rounded border-border text-yellow-500 focus:ring-yellow-500"
									/>
									<div>
										<label htmlFor="isPublic" className="text-sm font-medium text-foreground cursor-pointer">
											Submit for public listing
										</label>
										<p className="text-xs text-muted-foreground mt-1">
											If checked, this spot will be reviewed and may appear in the public spots directory.
											Otherwise, it will be saved to your private collection.
										</p>
									</div>
								</div>

								{/* Error Message */}
								{error && (
									<div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
										<AlertCircle className="h-5 w-5 flex-shrink-0" />
										<p className="text-sm">{error}</p>
									</div>
								)}

								{/* Info */}
								<div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500">
									<Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
									<p className="text-sm">
										You can also add spots directly from Google Maps using our{" "}
										<Link href="/chrome-extension" className="underline hover:text-blue-400">
											Chrome extension
										</Link>.
									</p>
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={loading}
									className="w-full bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
								>
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Adding Spot...
										</>
									) : (
										<>
											<MapPin className="h-4 w-4 mr-2" />
											Add Spot
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
