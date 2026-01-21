import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import SpotCard from "../../components/SpotCard";
import { searchSpots } from "../../lib/apiSpots";

// US State names mapping
const STATE_NAMES = {
	al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
	co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
	hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
	ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
	ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri",
	mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey",
	nm: "New Mexico", ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio",
	ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
	sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
	va: "Virginia", wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
	dc: "Washington D.C."
};

const AVAILABLE_TAGS = ["bowl", "street", "lights", "indoor", "beginner", "advanced"];

export default function StateSpots() {
	const router = useRouter();
	const { state } = router.query;

	const [spots, setSpots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchFocused, setSearchFocused] = useState(false);
	const searchInputRef = useRef(null);
	const [selectedTags, setSelectedTags] = useState([]);
	const [pagination, setPagination] = useState({
		page: 1,
		totalCount: 0,
		totalPages: 0,
	});

	const stateName = STATE_NAMES[state?.toLowerCase()] || state?.toUpperCase();

	useEffect(() => {
		if (!state) return;

		const fetchSpots = async () => {
			setLoading(true);
			try {
				const tagsFilter = selectedTags.length > 0 ? selectedTags.join(",") : "";
				const data = await searchSpots(
					searchQuery,
					"",
					state.toUpperCase(),
					tagsFilter,
					pagination.page,
					50
				);
				setSpots(data.spots || []);
				setPagination(data.pagination || {});
			} catch (error) {
				console.error("Error fetching spots:", error);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(fetchSpots, 300);
		return () => clearTimeout(debounceTimer);
	}, [state, searchQuery, selectedTags, pagination.page]);

	const handleTagToggle = (tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	return (
		<>
			<Head>
				<title>Skate Spots in {stateName} - The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content={`Discover skate spots in ${stateName}. Find skateparks, street spots, and more.`}
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-background">
				{/* Header */}
				<section className="border-b border-border">
					<div className="container py-8">
						{/* Back Link */}
						<Link href="/spots" className="inline-flex items-center gap-1 text-muted-foreground hover:text-yellow-500 transition-colors mb-6 no-underline">
							<ArrowLeft className="h-4 w-4" />
							<span>All States</span>
						</Link>

						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="flex items-center gap-2">
								<MapPin className="h-6 w-6 text-yellow-500" />
								<h1 className="text-3xl font-bold text-foreground">
									Spots in {stateName}
								</h1>
							</div>
							<p className="text-muted-foreground">
								{loading
									? "Searching..."
									: `${pagination.totalCount || spots.length} spot${(pagination.totalCount || spots.length) !== 1 ? "s" : ""} found`}
							</p>
						</div>
					</div>
				</section>

				{/* Filters */}
				<section className="border-b border-border bg-card">
					<div className="container py-6">
						<div className="flex flex-col md:flex-row gap-4">
							{/* Search */}
							<div className="relative flex-1 max-w-md">
								<div
									className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-all duration-200 ease-out ${
										searchFocused || searchQuery
											? "opacity-0 -translate-x-2"
											: "opacity-100 translate-x-0"
									}`}
								>
									<Search className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground text-sm">Search spots...</span>
								</div>
								<input
									ref={searchInputRef}
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onFocus={() => setSearchFocused(true)}
									onBlur={() => setSearchFocused(false)}
									className="w-full h-10 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200"
								/>
							</div>

							{/* Tag Filters */}
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm text-muted-foreground">Filter:</span>
								{AVAILABLE_TAGS.map((tag) => (
									<Badge
										key={tag}
										variant={selectedTags.includes(tag) ? "default" : "outline"}
										className={`cursor-pointer transition-colors ${
											selectedTags.includes(tag)
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
					</div>
				</section>

				{/* Spots Grid */}
				<section className="container py-8">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-24">
							<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
							<p className="mt-4 text-muted-foreground">Loading spots...</p>
						</div>
					) : spots.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{spots.map((spot) => (
									<SpotCard
										key={spot._id}
										id={spot._id}
										name={spot.name}
										city={spot.city}
										state={spot.state}
										imageURL={spot.imageURL}
										description={spot.description}
										tags={spot.tags}
										rating={spot.rating}
									/>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex justify-center gap-2 mt-8">
									{Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => (
										<Button
											key={i + 1}
											variant={pagination.page === i + 1 ? "default" : "outline"}
											size="sm"
											onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
											className={pagination.page === i + 1 ? "bg-yellow-500 text-black hover:bg-yellow-400" : ""}
										>
											{i + 1}
										</Button>
									))}
								</div>
							)}
						</>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<MapPin className="h-16 w-16 text-muted-foreground mb-4" />
							<h2 className="text-2xl font-semibold text-foreground mb-2">
								No spots found
							</h2>
							<p className="text-muted-foreground max-w-md">
								{searchQuery || selectedTags.length > 0
									? "Try adjusting your search or filters"
									: "No spots have been added for this state yet"}
							</p>
						</div>
					)}
				</section>
			</div>
		</>
	);
}
