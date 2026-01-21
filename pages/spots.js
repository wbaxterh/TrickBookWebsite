import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { MapPin, Loader2, ChevronDown, Filter, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getSpotsByState } from "../lib/apiSpots";

// Sport categories with emojis
const SPORT_CATEGORIES = [
	{ id: "all", name: "All Sports", emoji: "🎯" },
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

// Country codes and names with flag emojis
const COUNTRIES = {
	US: { name: "United States", flag: "🇺🇸" },
	CA: { name: "Canada", flag: "🇨🇦" },
	GB: { name: "United Kingdom", flag: "🇬🇧" },
	AU: { name: "Australia", flag: "🇦🇺" },
	DE: { name: "Germany", flag: "🇩🇪" },
	FR: { name: "France", flag: "🇫🇷" },
	JP: { name: "Japan", flag: "🇯🇵" },
	ES: { name: "Spain", flag: "🇪🇸" },
	IT: { name: "Italy", flag: "🇮🇹" },
	NZ: { name: "New Zealand", flag: "🇳🇿" },
	CH: { name: "Switzerland", flag: "🇨🇭" },
	AT: { name: "Austria", flag: "🇦🇹" },
	MX: { name: "Mexico", flag: "🇲🇽" },
	BR: { name: "Brazil", flag: "🇧🇷" },
	NL: { name: "Netherlands", flag: "🇳🇱" },
	SE: { name: "Sweden", flag: "🇸🇪" },
	NO: { name: "Norway", flag: "🇳🇴" },
	PT: { name: "Portugal", flag: "🇵🇹" },
	ZA: { name: "South Africa", flag: "🇿🇦" },
	ID: { name: "Indonesia", flag: "🇮🇩" },
};

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

export default function Spots() {
	const [spotsByState, setSpotsByState] = useState({});
	const [spotsByCountry, setSpotsByCountry] = useState({});
	const [allSpots, setAllSpots] = useState({});
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedCountry, setSelectedCountry] = useState("all");
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	const [showCountryDropdown, setShowCountryDropdown] = useState(false);

	useEffect(() => {
		const fetchSpots = async () => {
			try {
				const data = await getSpotsByState();
				setAllSpots(data);
				setSpotsByState(data);

				// Group by country (for now, assume all are US unless specified)
				const byCountry = { US: data };
				setSpotsByCountry(byCountry);
			} catch (error) {
				console.error("Error fetching spots:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchSpots();
	}, []);

	// Filter spots by category
	useEffect(() => {
		if (selectedCategory === "all") {
			setSpotsByState(allSpots);
		} else {
			const filtered = {};
			Object.keys(allSpots).forEach((state) => {
				const filteredSpots = allSpots[state].filter(
					(spot) => spot.sportTypes?.includes(selectedCategory) || spot.category === selectedCategory
				);
				if (filteredSpots.length > 0) {
					filtered[state] = filteredSpots;
				}
			});
			setSpotsByState(filtered);
		}
	}, [selectedCategory, allSpots]);

	// Get states sorted by number of spots
	const sortedStates = Object.keys(spotsByState)
		.filter((state) => state && state !== "Unknown")
		.sort((a, b) => spotsByState[b].length - spotsByState[a].length);

	const totalSpots = Object.values(spotsByState).reduce(
		(sum, spots) => sum + spots.length,
		0
	);

	// Get countries that have spots
	const countriesWithSpots = Object.keys(spotsByCountry).filter(
		(country) => Object.keys(spotsByCountry[country]).length > 0
	);

	const selectedCategoryData = SPORT_CATEGORIES.find((c) => c.id === selectedCategory);

	return (
		<>
			<Head>
				<title>Spots - Find the Best Places to Ride | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content="Discover the best spots to ride around the world. Find skateparks, snow resorts, surf breaks, and more for all action sports."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-background">
				{/* Hero Section */}
				<section className="border-b border-border">
					<div className="container py-12 md:py-20">
						<div className="flex flex-col items-center text-center space-y-6">
							<div className="flex items-center gap-3">
								<MapPin className="h-10 w-10 text-yellow-500" />
								<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
									Find the Best Spots to Ride
								</h1>
							</div>
							<p className="text-xl text-muted-foreground max-w-2xl">
								{loading
									? "Loading spots..."
									: `Discover ${totalSpots} spots across ${sortedStates.length} regions worldwide`}
							</p>

							{/* Filters Row */}
							<div className="flex flex-wrap items-center justify-center gap-4 mt-4">
								{/* Category Filter */}
								<div className="relative">
									<button
										onClick={() => {
											setShowCategoryDropdown(!showCategoryDropdown);
											setShowCountryDropdown(false);
										}}
										className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl hover:border-yellow-500 transition-all"
									>
										<Filter className="h-5 w-5 text-yellow-500" />
										<span className="text-xl">{selectedCategoryData?.emoji}</span>
										<span className="font-medium">{selectedCategoryData?.name}</span>
										<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
									</button>

									{showCategoryDropdown && (
										<div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[220px]">
											{SPORT_CATEGORIES.map((category) => (
												<button
													key={category.id}
													onClick={() => {
														setSelectedCategory(category.id);
														setShowCategoryDropdown(false);
													}}
													className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
														selectedCategory === category.id ? "bg-yellow-500/10 text-yellow-500" : ""
													}`}
												>
													<span className="text-xl">{category.emoji}</span>
													<span className="font-medium">{category.name}</span>
													{selectedCategory === category.id && (
														<span className="ml-auto text-yellow-500">✓</span>
													)}
												</button>
											))}
										</div>
									)}
								</div>

								{/* Country Filter */}
								<div className="relative">
									<button
										onClick={() => {
											setShowCountryDropdown(!showCountryDropdown);
											setShowCategoryDropdown(false);
										}}
										className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl hover:border-yellow-500 transition-all"
									>
										<Globe className="h-5 w-5 text-yellow-500" />
										<span className="text-xl">
											{selectedCountry === "all" ? "🌍" : COUNTRIES[selectedCountry]?.flag}
										</span>
										<span className="font-medium">
											{selectedCountry === "all" ? "All Countries" : COUNTRIES[selectedCountry]?.name}
										</span>
										<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
									</button>

									{showCountryDropdown && (
										<div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[220px] max-h-[400px] overflow-y-auto">
											<button
												onClick={() => {
													setSelectedCountry("all");
													setShowCountryDropdown(false);
												}}
												className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
													selectedCountry === "all" ? "bg-yellow-500/10 text-yellow-500" : ""
												}`}
											>
												<span className="text-xl">🌍</span>
												<span className="font-medium">All Countries</span>
												{selectedCountry === "all" && (
													<span className="ml-auto text-yellow-500">✓</span>
												)}
											</button>
											{Object.entries(COUNTRIES).map(([code, country]) => (
												<button
													key={code}
													onClick={() => {
														setSelectedCountry(code);
														setShowCountryDropdown(false);
													}}
													className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
														selectedCountry === code ? "bg-yellow-500/10 text-yellow-500" : ""
													}`}
												>
													<span className="text-xl">{country.flag}</span>
													<span className="font-medium">{country.name}</span>
													{selectedCountry === code && (
														<span className="ml-auto text-yellow-500">✓</span>
													)}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Content Section */}
				<section className="container py-12">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-24">
							<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
							<p className="mt-4 text-muted-foreground">Loading spots...</p>
						</div>
					) : sortedStates.length > 0 ? (
						<>
							<h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
								Browse by Region
								{selectedCategory !== "all" && (
									<span className="text-yellow-500 ml-2">
										• {selectedCategoryData?.emoji} {selectedCategoryData?.name}
									</span>
								)}
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{sortedStates.map((state) => (
									<Link
										key={state}
										href={`/spots/${state.toLowerCase()}${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`}
										className="no-underline"
									>
										<Card className="group hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full">
											<CardContent className="p-6 flex flex-col items-center text-center">
												<h3 className="font-semibold text-lg text-foreground group-hover:text-yellow-500 transition-colors">
													{STATE_NAMES[state] || state}
												</h3>
												<Badge variant="secondary" className="mt-2">
													{spotsByState[state].length} spot{spotsByState[state].length !== 1 ? "s" : ""}
												</Badge>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<MapPin className="h-16 w-16 text-muted-foreground mb-4" />
							<h2 className="text-2xl font-semibold text-foreground mb-2">
								{selectedCategory !== "all"
									? `No ${selectedCategoryData?.name} spots found`
									: "No spots found yet"}
							</h2>
							<p className="text-muted-foreground max-w-md mb-4">
								{selectedCategory !== "all"
									? "Try selecting a different category or check back soon!"
									: "Check back soon or add spots using our Chrome extension!"}
							</p>
							{selectedCategory !== "all" && (
								<Button
									variant="outline"
									onClick={() => setSelectedCategory("all")}
								>
									Show All Sports
								</Button>
							)}
						</div>
					)}
				</section>
			</div>
		</>
	);
}
