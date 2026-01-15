import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getSpotsByState } from "../lib/apiSpots";

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
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSpots = async () => {
			try {
				const data = await getSpotsByState();
				setSpotsByState(data);
			} catch (error) {
				console.error("Error fetching spots:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchSpots();
	}, []);

	// Get states sorted by number of spots
	const sortedStates = Object.keys(spotsByState)
		.filter((state) => state && state !== "Unknown")
		.sort((a, b) => spotsByState[b].length - spotsByState[a].length);

	const totalSpots = Object.values(spotsByState).reduce(
		(sum, spots) => sum + spots.length,
		0
	);

	return (
		<>
			<Head>
				<title>Skate Spots - The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content="Discover skate spots across the United States. Find skateparks, street spots, and more in your area."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-background">
				{/* Hero Section */}
				<section className="border-b border-border">
					<div className="container py-16 md:py-24">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="flex items-center gap-2">
								<MapPin className="h-8 w-8 text-yellow-500" />
								<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
									Find Skate Spots
								</h1>
							</div>
							<p className="text-xl text-muted-foreground max-w-2xl">
								{loading
									? "Loading spots..."
									: `Discover ${totalSpots} spots across ${sortedStates.length} states`}
							</p>
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
								Browse by State
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{sortedStates.map((state) => (
									<Link
										key={state}
										href={`/spots/${state.toLowerCase()}`}
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
								No spots found yet
							</h2>
							<p className="text-muted-foreground max-w-md">
								Check back soon or add spots using our Chrome extension!
							</p>
						</div>
					)}
				</section>
			</div>
		</>
	);
}
