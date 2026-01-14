import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import PageHeader from "../../components/PageHeader";
import SpotCard from "../../components/SpotCard";
import {
	Typography,
	Grid,
	CircularProgress,
	Button,
	Box,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../../styles/spots.module.css";
import {
	getSpotList,
	getSpotsInList,
	removeSpotFromList,
} from "../../lib/apiSpots";
import { AuthContext } from "../../auth/AuthContext";

export default function SpotListDetail() {
	const router = useRouter();
	const { listId } = router.query;
	const { loggedIn, token } = useContext(AuthContext);

	const [list, setList] = useState(null);
	const [spots, setSpots] = useState([]);
	const [loading, setLoading] = useState(true);

	// Delete confirmation
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [spotToRemove, setSpotToRemove] = useState(null);

	useEffect(() => {
		if (loggedIn === null) return;
		if (!loggedIn) {
			router.push("/login");
			return;
		}
		if (!listId) return;

		fetchData();
	}, [loggedIn, token, listId, router]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [listData, spotsData] = await Promise.all([
				getSpotList(listId, token),
				getSpotsInList(listId, token),
			]);
			setList(listData);
			setSpots(spotsData);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveClick = (spot) => {
		setSpotToRemove(spot);
		setDeleteDialogOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!spotToRemove) return;

		try {
			await removeSpotFromList(listId, spotToRemove._id, token);
			setDeleteDialogOpen(false);
			setSpotToRemove(null);
			fetchData();
		} catch (error) {
			console.error("Error removing spot:", error);
			alert("Failed to remove spot from list");
		}
	};

	if (loggedIn === null || loading) {
		return (
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<div className={styles.loadingState}>
					<CircularProgress sx={{ color: "#fff000" }} />
					<Typography className="mt-3 text-light">Loading...</Typography>
				</div>
			</div>
		);
	}

	if (!list) {
		return (
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<PageHeader title="List Not Found" col="col-sm-4" />
				<div className={styles.emptyState}>
					<Typography variant="h5" className="text-light">
						List not found
					</Typography>
					<Button
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={() => router.push("/my-spots")}
						sx={{
							mt: 3,
							color: "#fff000",
							borderColor: "#fff000",
						}}
					>
						Back to My Lists
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{list.name} - My Spot Lists | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content={`View spots in ${list.name}`} />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<div className={`container-fluid ${styles.spotsContainer}`}>
				{/* Back Navigation */}
				<Box className="m-4">
					<Button
						variant="text"
						startIcon={<ArrowBackIcon />}
						onClick={() => router.push("/my-spots")}
						sx={{
							color: "#fff000",
							"&:hover": { backgroundColor: "rgba(255, 240, 0, 0.1)" },
						}}
					>
						Back to My Lists
					</Button>
				</Box>

				<PageHeader title={list.name} col="col-sm-6" />

				{list.description && (
					<Box className="mx-5 mb-4">
						<Typography variant="body1" className="text-light">
							{list.description}
						</Typography>
					</Box>
				)}

				<Box className="mx-5 mb-4">
					<Typography variant="body2" sx={{ color: "#aaa" }}>
						{spots.length} spot{spots.length !== 1 ? "s" : ""} in this list
					</Typography>
				</Box>

				{/* Spots Grid */}
				<section className="mx-5">
					<Grid container spacing={3}>
						{spots.map((spot) => (
							<Grid item key={spot._id} xs={12} sm={6} md={4} lg={3}>
								<Box position="relative">
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
									<IconButton
										size="small"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleRemoveClick(spot);
										}}
										sx={{
											position: "absolute",
											top: 8,
											right: 8,
											backgroundColor: "rgba(0,0,0,0.7)",
											color: "#f44336",
											"&:hover": {
												backgroundColor: "rgba(0,0,0,0.9)",
											},
										}}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Box>
							</Grid>
						))}
					</Grid>

					{spots.length === 0 && (
						<div className={styles.emptyState}>
							<Typography variant="h5" className="text-light">
								No spots in this list yet
							</Typography>
							<Typography variant="body1" className="text-light mt-2">
								Use our Chrome extension to add spots from Google Maps, or browse
								spots and add them to your lists.
							</Typography>
							<Button
								variant="contained"
								onClick={() => router.push("/spots")}
								sx={{
									mt: 3,
									backgroundColor: "#fff000",
									color: "#1f1f1f",
									"&:hover": { backgroundColor: "#e6d900" },
								}}
							>
								Browse Spots
							</Button>
						</div>
					)}
				</section>

				{/* Remove Confirmation Dialog */}
				<Dialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
					PaperProps={{
						sx: {
							backgroundColor: "#1f1f1f",
							color: "#fff",
						},
					}}
				>
					<DialogTitle>Remove Spot</DialogTitle>
					<DialogContent>
						<Typography>
							Remove &quot;{spotToRemove?.name}&quot; from this list?
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => setDeleteDialogOpen(false)}
							sx={{ color: "#aaa" }}
						>
							Cancel
						</Button>
						<Button onClick={handleConfirmRemove} sx={{ color: "#f44336" }}>
							Remove
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		</>
	);
}
