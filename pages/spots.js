import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Typography, Button, Grid, CircularProgress } from "@mui/material";
import styles from "../styles/spots.module.css";
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
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://thetrickbook.com/spots" />
				<meta name="author" content="Wes Huber" />
				<meta
					name="keywords"
					content="skate spots, skateparks, street spots, skateboarding locations, skate spot finder"
				/>
			</Head>
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<PageHeader title="Skate Spots" col="col-sm-4" />

				<section className={`my-5 p-5 ${styles.headerSection}`}>
					<Typography variant="h2" align="center" className="app-primary">
						Find Skate Spots
					</Typography>
					<Typography variant="h6" align="center" className="text-light mt-3">
						{loading
							? "Loading spots..."
							: `${totalSpots} spots across ${sortedStates.length} states`}
					</Typography>
				</section>

				{loading ? (
					<div className={styles.loadingState}>
						<CircularProgress sx={{ color: "#fff000" }} />
						<Typography className="mt-3 text-light">
							Loading spots...
						</Typography>
					</div>
				) : (
					<section className="m-5 text-center">
						<Typography variant="h4" className="mb-4 text-light">
							Browse by State
						</Typography>
						<Grid container spacing={3} justifyContent="center">
							{sortedStates.map((state) => (
								<Grid item key={state} xs={12} sm={6} md={4} lg={3}>
									<Link href={`/spots/${state.toLowerCase()}`} passHref>
										<Button
											variant="contained"
											fullWidth
											sx={{
												backgroundColor: "#1f1f1f",
												color: "#fff000",
												padding: "20px",
												fontSize: "1.2rem",
												border: "2px solid #fff000",
												boxShadow: "0 4px 15px rgba(255, 240, 0, 0.25)",
												transition: "transform 0.2s, box-shadow 0.2s",
												display: "flex",
												flexDirection: "column",
												"&:hover": {
													backgroundColor: "#1f1f1f",
													transform: "translateY(-3px)",
													boxShadow: "0 8px 20px rgba(255, 240, 0, 0.35)",
												},
											}}
										>
											<span>{STATE_NAMES[state] || state}</span>
											<span
												style={{
													fontSize: "0.8rem",
													color: "#aaa",
													marginTop: "4px",
												}}
											>
												{spotsByState[state].length} spot
												{spotsByState[state].length !== 1 ? "s" : ""}
											</span>
										</Button>
									</Link>
								</Grid>
							))}
						</Grid>

						{sortedStates.length === 0 && (
							<div className={styles.emptyState}>
								<Typography variant="h5" className="text-light">
									No spots found yet
								</Typography>
								<Typography variant="body1" className="text-light mt-2">
									Check back soon or add spots using our Chrome extension!
								</Typography>
							</div>
						)}
					</section>
				)}
			</div>
		</>
	);
}
