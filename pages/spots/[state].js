import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import SpotCard from "../../components/SpotCard";
import {
	Typography,
	Grid,
	CircularProgress,
	TextField,
	InputAdornment,
	Chip,
	Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styles from "../../styles/spots.module.css";
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
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<PageHeader title={`Spots in ${stateName}`} col="col-sm-6" />

				{/* Search and Filter Section */}
				<section className={`mx-5 ${styles.searchSection}`}>
					<Grid container spacing={3} alignItems="center">
						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								placeholder="Search spots..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon sx={{ color: "#aaa" }} />
										</InputAdornment>
									),
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										backgroundColor: "#2a2a2a",
										color: "#fff",
										"& fieldset": { borderColor: "#444" },
										"&:hover fieldset": { borderColor: "#fff000" },
										"&.Mui-focused fieldset": { borderColor: "#fff000" },
									},
									"& .MuiInputBase-input": { color: "#fff" },
								}}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<Box display="flex" flexWrap="wrap" gap={1}>
								<Typography variant="body2" className="text-light me-2">
									Filter:
								</Typography>
								{AVAILABLE_TAGS.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										clickable
										onClick={() => handleTagToggle(tag)}
										sx={{
											backgroundColor: selectedTags.includes(tag)
												? "#fff000"
												: "#2a2a2a",
											color: selectedTags.includes(tag) ? "#1f1f1f" : "#fff",
											borderColor: "#fff000",
											"&:hover": {
												backgroundColor: selectedTags.includes(tag)
													? "#e6d900"
													: "#3a3a3a",
											},
										}}
									/>
								))}
							</Box>
						</Grid>
					</Grid>
				</section>

				{/* Results Info */}
				<section className="mx-5 my-3">
					<Typography variant="body1" className="text-light">
						{loading
							? "Searching..."
							: `Found ${pagination.totalCount || spots.length} spot${
									(pagination.totalCount || spots.length) !== 1 ? "s" : ""
							  }`}
					</Typography>
				</section>

				{/* Spots Grid */}
				{loading ? (
					<div className={styles.loadingState}>
						<CircularProgress sx={{ color: "#fff000" }} />
						<Typography className="mt-3 text-light">Loading spots...</Typography>
					</div>
				) : (
					<section className="m-5">
						<Grid container spacing={3}>
							{spots.map((spot) => (
								<Grid item key={spot._id} xs={12} sm={6} md={4} lg={3}>
									<SpotCard
										id={spot._id}
										name={spot.name}
										city={spot.city}
										state={spot.state}
										imageURL={spot.imageURL}
										description={spot.description}
										tags={spot.tags}
										rating={spot.rating}
									/>
								</Grid>
							))}
						</Grid>

						{spots.length === 0 && (
							<div className={styles.emptyState}>
								<Typography variant="h5" className="text-light">
									No spots found
								</Typography>
								<Typography variant="body1" className="text-light mt-2">
									{searchQuery || selectedTags.length > 0
										? "Try adjusting your search or filters"
										: "No spots have been added for this state yet"}
								</Typography>
							</div>
						)}

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div className={styles.pagination}>
								{Array.from({ length: pagination.totalPages }, (_, i) => (
									<Chip
										key={i + 1}
										label={i + 1}
										clickable
										onClick={() =>
											setPagination((prev) => ({ ...prev, page: i + 1 }))
										}
										sx={{
											backgroundColor:
												pagination.page === i + 1 ? "#fff000" : "#2a2a2a",
											color: pagination.page === i + 1 ? "#1f1f1f" : "#fff",
											"&:hover": {
												backgroundColor:
													pagination.page === i + 1 ? "#e6d900" : "#3a3a3a",
											},
										}}
									/>
								))}
							</div>
						)}
					</section>
				)}
			</div>
		</>
	);
}
