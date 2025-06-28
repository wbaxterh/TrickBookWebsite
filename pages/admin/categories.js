import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from "../../lib/api";
import {
	Button,
	Typography,
	Box,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminCategories() {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [editCategory, setEditCategory] = useState(null);
	const [form, setForm] = useState({
		name: "",
		icon: "",
		backgroundColor: "",
		color: "",
	});

	useEffect(() => {
		fetchCategories();
	}, []);

	async function fetchCategories() {
		setLoading(true);
		const cats = await getCategories();
		setCategories(cats);
		setLoading(false);
	}

	function handleOpenDialog(category = null) {
		setEditCategory(category);
		setForm(
			category
				? { ...category }
				: { name: "", icon: "", backgroundColor: "", color: "" }
		);
		setOpenDialog(true);
	}

	function handleCloseDialog() {
		setOpenDialog(false);
		setEditCategory(null);
		setForm({ name: "", icon: "", backgroundColor: "", color: "" });
	}

	async function handleSave() {
		// TODO: Replace with real token from auth
		const token = "demo-admin-token";
		try {
			if (editCategory) {
				await updateCategory(editCategory._id, form, token);
			} else {
				await createCategory(form, token);
			}
			await fetchCategories();
			handleCloseDialog();
		} catch (e) {
			alert("Error saving category");
		}
	}

	async function handleDelete(id) {
		// TODO: Replace with real token from auth
		const token = "demo-admin-token";
		if (!window.confirm("Are you sure you want to delete this category?"))
			return;
		try {
			await deleteCategory(id, token);
			await fetchCategories();
		} catch (e) {
			alert("Error deleting category");
		}
	}

	return (
		<>
			<Head>
				<title>Admin - Manage Categories</title>
			</Head>
			<Header />
			<Box className='container my-5'>
				<Typography variant='h4' gutterBottom>
					Manage Categories
				</Typography>
				<Button
					variant='contained'
					color='primary'
					sx={{ mb: 2 }}
					onClick={() => handleOpenDialog()}
				>
					Add Category
				</Button>
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Icon</TableCell>
								<TableCell>Background</TableCell>
								<TableCell>Color</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{categories.map((cat) => (
								<TableRow key={cat._id}>
									<TableCell>{cat.name}</TableCell>
									<TableCell>{cat.icon}</TableCell>
									<TableCell>
										<span
											style={{
												background: cat.backgroundColor,
												color: cat.color,
												padding: "2px 8px",
												borderRadius: 4,
											}}
										>
											{cat.backgroundColor}
										</span>
									</TableCell>
									<TableCell>{cat.color}</TableCell>
									<TableCell>
										<IconButton onClick={() => handleOpenDialog(cat)}>
											<EditIcon />
										</IconButton>
										<IconButton onClick={() => handleDelete(cat._id)}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Dialog open={openDialog} onClose={handleCloseDialog}>
					<DialogTitle>
						{editCategory ? "Edit Category" : "Add Category"}
					</DialogTitle>
					<DialogContent>
						<TextField
							margin='dense'
							label='Name'
							fullWidth
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
						<TextField
							margin='dense'
							label='Icon'
							fullWidth
							value={form.icon}
							onChange={(e) => setForm({ ...form, icon: e.target.value })}
						/>
						<TextField
							margin='dense'
							label='Background Color'
							fullWidth
							value={form.backgroundColor}
							onChange={(e) =>
								setForm({ ...form, backgroundColor: e.target.value })
							}
						/>
						<TextField
							margin='dense'
							label='Text Color'
							fullWidth
							value={form.color}
							onChange={(e) => setForm({ ...form, color: e.target.value })}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog}>Cancel</Button>
						<Button onClick={handleSave} variant='contained' color='primary'>
							Save
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</>
	);
}
