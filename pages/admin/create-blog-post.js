import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
	Typography,
	Button,
	TextField,
	CircularProgress,
	FormControlLabel,
	Checkbox,
	IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	createBlogPost,
	updateBlogPost,
	getBlogPostById,
	uploadImage,
	updateBlogPostImages,
} from "../../lib/api";
import { AuthContext } from "../../auth/AuthContext";
import styles from "../../styles/admin.module.css";

export default function CreateBlogPost() {
	const { token, loggedIn, role } = useContext(AuthContext);
	console.log("Token from create / edit == ", token);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [date, setDate] = useState("");
	const [content, setContent] = useState("");
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [heroImageIndex, setHeroImageIndex] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const { isEdit, postId } = router.query; // Accessing query parameters

	useEffect(() => {
		if (isEdit && postId) {
			fetchPostData(postId);
		} else {
			setLoading(false);
		}
	}, [isEdit, postId]);

	const fetchPostData = async (id) => {
		try {
			const postData = await getBlogPostById(id);
			setTitle(postData.title);
			setAuthor(postData.author);
			setDate(postData.date);
			setContent(postData.content);
			setSelectedFiles(postData.images || []);
			// If the post has a hero image, find its index
			const heroIndex = postData.images.findIndex((image) =>
				image.includes("?hero=true")
			);
			setHeroImageIndex(heroIndex !== -1 ? heroIndex : null);
			setLoading(false);
		} catch (error) {
			console.error("Error loading post data for editing", error);
		}
	};

	const handleFileChange = (event) => {
		setSelectedFiles([...selectedFiles, ...event.target.files]);
	};

	const handleHeroImageChange = (index) => {
		setHeroImageIndex(index);
	};

	const handleRemoveImage = (index) => {
		const updatedFiles = selectedFiles.filter((_, i) => i !== index);
		setSelectedFiles(updatedFiles);
		// If the removed image was the hero image, reset the hero image index
		if (index === heroImageIndex) {
			setHeroImageIndex(null);
		} else if (index < heroImageIndex) {
			setHeroImageIndex(heroImageIndex - 1);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Create the base post data without images
		const postData = {
			title,
			author,
			date,
			content,
			images: [], // We will add images later
		};

		try {
			let postResponse;

			// If it's an edit, update the post data
			if (isEdit === "true") {
				await updateBlogPost(postId, postData, token);
				postResponse = { _id: postId, url: title }; // Assuming title is used to generate the blogUrl
				alert("Blog post updated successfully!");
			} else {
				// Create a new post without images
				postResponse = await createBlogPost(postData, token);
				alert("Blog post created successfully!");
			}

			// After creating or updating the post, handle image uploads
			const blogUrl = postResponse.url;
			const imageUrls = [];

			// Upload images and collect their URLs
			for (let i = 0; i < selectedFiles.length; i++) {
				const imageUrl = await uploadImage(selectedFiles[i], blogUrl, token);
				// Mark the hero image with ?hero=true
				if (i === heroImageIndex) {
					imageUrls.push(`${imageUrl}?hero=true`);
				} else {
					imageUrls.push(imageUrl);
				}
			}

			// Update the post with the image URLs
			if (imageUrls.length > 0) {
				await updateBlogPostImages(postResponse._id, imageUrls, token);
				alert(
					"Images uploaded and blog post updated with images successfully!"
				);
			}

			router.push("/admin/blog");
		} catch (error) {
			console.error("Error submitting blog post", error);
			alert("Failed to submit blog post");
		}
	};

	// const uploadImages = async (blogUrl) => {
	// 	const imageUrls = [];
	// 	for (let file of selectedFiles) {
	// 		const imageUrl = await uploadImage(file, blogUrl, token);
	// 		imageUrls.push(imageUrl);
	// 	}
	// 	return imageUrls;
	// };

	if (loading) {
		return (
			<div className='loading'>
				<CircularProgress />
				<Typography variant='h5'>Loading...</Typography>
			</div>
		);
	}

	return (
		<div className={`container ${styles.container}`}>
			<Head>
				<title>{isEdit === "true" ? "Edit" : "Create"} Blog Post</title>
			</Head>
			<div className='container m-4 mt-5 pt-3'>
				<Typography variant='h2' gutterBottom>
					{isEdit === "true" ? "Edit" : "Create"} Blog Post
				</Typography>
				<form onSubmit={handleSubmit} className={styles.form}>
					<TextField
						label='Title'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						fullWidth
						margin='normal'
					/>
					<TextField
						label='Author'
						value={author}
						onChange={(e) => setAuthor(e.target.value)}
						fullWidth
						margin='normal'
					/>
					<TextField
						label='Date'
						type='date'
						value={date}
						onChange={(e) => setDate(e.target.value)}
						fullWidth
						margin='normal'
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						label='Content'
						value={content}
						onChange={(e) => setContent(e.target.value)}
						fullWidth
						margin='normal'
						multiline
						rows={10}
					/>
					<div className='row'>
						<div className='col-6 mx-auto text-center'>
							<h3>Add an Image</h3>
							<input type='file' onChange={handleFileChange} />
						</div>
					</div>
					<div className='row mt-4'>
						{selectedFiles.map((file, index) => (
							<div key={index} className='col-6 mx-auto text-center'>
								<FormControlLabel
									control={
										<Checkbox
											checked={heroImageIndex === index}
											onChange={() => handleHeroImageChange(index)}
											name='heroImage'
											color='primary'
										/>
									}
									label='Set as Hero Image'
								/>
								<Typography>{file.name || file}</Typography>
								<IconButton
									color='secondary'
									onClick={() => handleRemoveImage(index)}
								>
									<DeleteIcon />
								</IconButton>
							</div>
						))}
					</div>
					<div className='row mt-4'>
						<Button
							type='submit'
							className='col-6 mx-auto'
							variant='contained'
							color='primary'
						>
							{isEdit === "true" ? "Update Post" : "Submit Post"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
