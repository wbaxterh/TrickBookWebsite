import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import PageHeader from "../components/PageHeader";
import {
	Typography,
	Grid,
	CircularProgress,
	Button,
	Box,
	Card,
	CardContent,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import styles from "../styles/spots.module.css";
import {
	getSpotLists,
	createSpotList,
	updateSpotList,
	deleteSpotList,
	getSpotUsage,
} from "../lib/apiSpots";
import { AuthContext } from "../auth/AuthContext";

export default function MySpots() {
	const router = useRouter();
	const { loggedIn, token } = useContext(AuthContext);

	const [spotLists, setSpotLists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [usage, setUsage] = useState(null);

	// Dialog states
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
	const [editingList, setEditingList] = useState(null);
	const [listName, setListName] = useState("");
	const [listDescription, setListDescription] = useState("");
	const [saving, setSaving] = useState(false);

	// Delete confirmation
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [listToDelete, setListToDelete] = useState(null);

	useEffect(() => {
		if (loggedIn === null) return;
		if (!loggedIn) {
			router.push("/login");
			return;
		}

		fetchData();
	}, [loggedIn, token, router]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [lists, usageData] = await Promise.all([
				getSpotLists(token),
				getSpotUsage(token),
			]);
			setSpotLists(lists);
			setUsage(usageData);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenCreateDialog = () => {
		setDialogMode("create");
		setListName("");
		setListDescription("");
		setEditingList(null);
		setDialogOpen(true);
	};

	const handleOpenEditDialog = (list) => {
		setDialogMode("edit");
		setListName(list.name);
		setListDescription(list.description || "");
		setEditingList(list);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setListName("");
		setListDescription("");
		setEditingList(null);
	};

	const handleSaveList = async () => {
		if (!listName.trim()) return;

		setSaving(true);
		try {
			if (dialogMode === "create") {
				await createSpotList(listName, listDescription, token);
			} else {
				await updateSpotList(editingList._id, listName, listDescription, token);
			}
			handleCloseDialog();
			fetchData();
		} catch (error) {
			console.error("Error saving list:", error);
			alert(error.response?.data?.error || "Failed to save list");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteClick = (list) => {
		setListToDelete(list);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!listToDelete) return;

		try {
			await deleteSpotList(listToDelete._id, token);
			setDeleteDialogOpen(false);
			setListToDelete(null);
			fetchData();
		} catch (error) {
			console.error("Error deleting list:", error);
			alert("Failed to delete list");
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

	return (
		<>
			<Head>
				<title>My Spot Lists - The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Manage your saved skate spot lists" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<div className={`container-fluid ${styles.spotsContainer}`}>
				<PageHeader title="My Spot Lists" col="col-sm-4" />

				{/* Usage Info */}
				{usage && (
					<Box className="mx-5 mb-4">
						<Typography variant="body1" className="text-light">
							{usage.spotListCount} of {usage.maxSpotLists === -1 ? "Unlimited" : usage.maxSpotLists} lists used
							{usage.maxSpotLists !== -1 && (
								<span className="ms-3">
									| {usage.totalSpotsCount} of {usage.maxTotalSpots === -1 ? "Unlimited" : usage.maxTotalSpots} total spots
								</span>
							)}
						</Typography>
						{usage.subscription !== "premium" && (
							<Link href="/pricing" passHref>
								<Button
									variant="text"
									size="small"
									sx={{ color: "#fff000", mt: 1 }}
								>
									Upgrade for unlimited lists
								</Button>
							</Link>
						)}
					</Box>
				)}

				{/* Create Button */}
				<Box className="mx-5 mb-4">
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreateDialog}
						sx={{
							backgroundColor: "#fff000",
							color: "#1f1f1f",
							fontWeight: "bold",
							"&:hover": { backgroundColor: "#e6d900" },
						}}
					>
						Create New List
					</Button>
				</Box>

				{/* Spot Lists */}
				<section className="mx-5">
					<Grid container spacing={3}>
						{spotLists.map((list) => (
							<Grid item key={list._id} xs={12} sm={6} md={4}>
								<Card
									className={styles.spotListCard}
									onClick={() => router.push(`/my-spots/${list._id}`)}
								>
									<CardContent>
										<Box display="flex" justifyContent="space-between" alignItems="flex-start">
											<Box display="flex" alignItems="center" gap={1}>
												<FolderIcon sx={{ color: "#fff000", fontSize: 30 }} />
												<Typography variant="h6" className="app-primary">
													{list.name}
												</Typography>
											</Box>
											<Box>
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenEditDialog(list);
													}}
													sx={{ color: "#aaa", "&:hover": { color: "#fff000" } }}
												>
													<EditIcon fontSize="small" />
												</IconButton>
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteClick(list);
													}}
													sx={{ color: "#aaa", "&:hover": { color: "#f44336" } }}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Box>
										</Box>
										{list.description && (
											<Typography variant="body2" className="text-light mt-2">
												{list.description}
											</Typography>
										)}
										<Typography variant="body2" sx={{ color: "#aaa", mt: 2 }}>
											{list.spotCount || 0} spot{list.spotCount !== 1 ? "s" : ""}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{spotLists.length === 0 && (
						<div className={styles.emptyState}>
							<Typography variant="h5" className="text-light">
								No spot lists yet
							</Typography>
							<Typography variant="body1" className="text-light mt-2">
								Create a list to start saving your favorite skate spots
							</Typography>
						</div>
					)}
				</section>

				{/* Create/Edit Dialog */}
				<Dialog
					open={dialogOpen}
					onClose={handleCloseDialog}
					PaperProps={{
						sx: {
							backgroundColor: "#1f1f1f",
							color: "#fff",
							minWidth: 400,
						},
					}}
				>
					<DialogTitle className="app-primary">
						{dialogMode === "create" ? "Create New List" : "Edit List"}
					</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							label="List Name"
							fullWidth
							value={listName}
							onChange={(e) => setListName(e.target.value)}
							sx={{
								mt: 2,
								"& .MuiOutlinedInput-root": {
									color: "#fff",
									"& fieldset": { borderColor: "#444" },
									"&:hover fieldset": { borderColor: "#fff000" },
									"&.Mui-focused fieldset": { borderColor: "#fff000" },
								},
								"& .MuiInputLabel-root": { color: "#aaa" },
								"& .MuiInputLabel-root.Mui-focused": { color: "#fff000" },
							}}
						/>
						<TextField
							margin="dense"
							label="Description (optional)"
							fullWidth
							multiline
							rows={3}
							value={listDescription}
							onChange={(e) => setListDescription(e.target.value)}
							sx={{
								mt: 2,
								"& .MuiOutlinedInput-root": {
									color: "#fff",
									"& fieldset": { borderColor: "#444" },
									"&:hover fieldset": { borderColor: "#fff000" },
									"&.Mui-focused fieldset": { borderColor: "#fff000" },
								},
								"& .MuiInputLabel-root": { color: "#aaa" },
								"& .MuiInputLabel-root.Mui-focused": { color: "#fff000" },
							}}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog} sx={{ color: "#aaa" }}>
							Cancel
						</Button>
						<Button
							onClick={handleSaveList}
							disabled={!listName.trim() || saving}
							sx={{
								color: "#fff000",
								"&:disabled": { color: "#666" },
							}}
						>
							{saving ? "Saving..." : dialogMode === "create" ? "Create" : "Save"}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Delete Confirmation Dialog */}
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
					<DialogTitle>Delete List</DialogTitle>
					<DialogContent>
						<Typography>
							Are you sure you want to delete &quot;{listToDelete?.name}&quot;? This action
							cannot be undone.
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#aaa" }}>
							Cancel
						</Button>
						<Button onClick={handleConfirmDelete} sx={{ color: "#f44336" }}>
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		</>
	);
}
