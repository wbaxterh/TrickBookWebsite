import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import PageHeader from "../../../components/PageHeader";
import {
	Typography,
	Grid,
	CircularProgress,
	Chip,
	Button,
	Box,
	Paper,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import styles from "../../../styles/spots.module.css";
import { getSpotData } from "../../../lib/apiSpots";
import { AuthContext } from "../../../auth/AuthContext";

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

export default function SpotDetail() {
	const router = useRouter();
	const { state, spotSlug, id } = router.query;
	const { loggedIn } = useContext(AuthContext);

	const [spot, setSpot] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const stateName = STATE_NAMES[state?.toLowerCase()] || state?.toUpperCase();

	useEffect(() => {
		if (!id) return;

		const fetchSpot = async () => {
			setLoading(true);
			try {
				const data = await getSpotData(id);
				if (data) {
					setSpot(data);
				} else {
					setError("Spot not found");
				}
			} catch (err) {
				console.error("Error fetching spot:", err);
				setError("Failed to load spot");
			} finally {
				setLoading(false);
			}
		};

		fetchSpot();
	}, [id]);

	// Parse tags
	const tagList = spot?.tags
		? typeof spot.tags === "string"
			? spot.tags.split(",").map((t) => t.trim()).filter(Boolean)
			: spot.tags
		: [];

	// Generate Google Maps URL
	const googleMapsUrl = spot
		? `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
		: null;

	if (loading) {
		return (
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<div className={styles.loadingState}>
					<CircularProgress sx={{ color: "#fff000" }} />
					<Typography className="mt-3 text-light">Loading spot...</Typography>
				</div>
			</div>
		);
	}

	if (error || !spot) {
		return (
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<PageHeader title="Spot Not Found" col="col-sm-4" />
				<div className={styles.emptyState}>
					<Typography variant="h5" className="text-light">
						{error || "Spot not found"}
					</Typography>
					<Button
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={() => router.back()}
						sx={{
							mt: 3,
							color: "#fff000",
							borderColor: "#fff000",
							"&:hover": { borderColor: "#e6d900" },
						}}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{spot.name} - Skate Spot in {stateName} | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content={`${spot.name} skate spot in ${spot.city}, ${stateName}. ${spot.description || "Find directions, photos, and info."}`}
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<div className={`container-fluid ${styles.spotsContainer}`}>
				{/* Back Navigation */}
				<Box className="m-4">
					<Button
						variant="text"
						startIcon={<ArrowBackIcon />}
						onClick={() => router.back()}
						sx={{
							color: "#fff000",
							"&:hover": { backgroundColor: "rgba(255, 240, 0, 0.1)" },
						}}
					>
						Back to {stateName} Spots
					</Button>
				</Box>

				<Grid container spacing={4} className="px-4 pb-5">
					{/* Image Section */}
					<Grid item xs={12} md={6}>
						<div className={styles.spotDetailImage}>
							{spot.imageURL ? (
								<Image
									src={spot.imageURL}
									alt={spot.name}
									fill
									style={{ objectFit: "cover" }}
									unoptimized
								/>
							) : (
								<div className={styles.noImage} style={{ height: "100%" }}>
									<LocationOnIcon sx={{ fontSize: 100, color: "#fff000" }} />
								</div>
							)}
						</div>
					</Grid>

					{/* Details Section */}
					<Grid item xs={12} md={6}>
						<Paper className={styles.detailsSection}>
							<Typography variant="h3" className="app-primary mb-3">
								{spot.name}
							</Typography>

							{/* Location */}
							<Box display="flex" alignItems="center" gap={1} mb={2}>
								<LocationOnIcon sx={{ color: "#fff000" }} />
								<Typography variant="h6" className="text-light">
									{spot.city && spot.state
										? `${spot.city}, ${STATE_NAMES[spot.state.toLowerCase()] || spot.state}`
										: spot.state
										? STATE_NAMES[spot.state.toLowerCase()] || spot.state
										: "Unknown location"}
								</Typography>
							</Box>

							{/* Tags */}
							{tagList.length > 0 && (
								<div className={styles.tagContainer}>
									{tagList.map((tag, index) => (
										<Chip
											key={index}
											label={tag}
											sx={{
												color: "#fff000",
												borderColor: "#fff000",
												fontSize: "0.9rem",
											}}
											variant="outlined"
										/>
									))}
								</div>
							)}

							{/* Coordinates */}
							<Box my={3}>
								<Typography variant="body2" className="text-light">
									<strong>Coordinates:</strong> {spot.latitude?.toFixed(6)}, {spot.longitude?.toFixed(6)}
								</Typography>
							</Box>

							{/* Description */}
							{spot.description && (
								<Box my={3}>
									<Typography variant="h6" className="app-primary mb-2">
										About this spot
									</Typography>
									<Typography variant="body1" className="text-light">
										{spot.description}
									</Typography>
								</Box>
							)}

							{/* Actions */}
							<Box mt={4} display="flex" flexWrap="wrap" gap={2}>
								<Button
									variant="contained"
									startIcon={<OpenInNewIcon />}
									href={googleMapsUrl}
									target="_blank"
									rel="noopener noreferrer"
									sx={{
										backgroundColor: "#fff000",
										color: "#1f1f1f",
										fontWeight: "bold",
										"&:hover": { backgroundColor: "#e6d900" },
									}}
								>
									Open in Google Maps
								</Button>

								{loggedIn && (
									<Link href="/my-spots" passHref>
										<Button
											variant="outlined"
											sx={{
												color: "#fff000",
												borderColor: "#fff000",
												"&:hover": {
													borderColor: "#e6d900",
													backgroundColor: "rgba(255, 240, 0, 0.1)",
												},
											}}
										>
											Add to My Lists
										</Button>
									</Link>
								)}
							</Box>
						</Paper>
					</Grid>
				</Grid>
			</div>
		</>
	);
}
