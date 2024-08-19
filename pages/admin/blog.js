import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
	Typography,
	Button,
	CircularProgress,
	IconButton,
} from "@mui/material";
import { getSortedPostsData, deleteBlogPost } from "../../lib/api";
import { AuthContext } from "../../auth/AuthContext";
import BlogCard from "../../components/BlogCard";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../../styles/admin.module.css";

export default function BlogAdmin() {
	const { loggedIn, role, token } = useContext(AuthContext);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (loggedIn === null) {
			return;
		}

		if (loggedIn && role === "admin") {
			fetchPosts();
		} else {
			router.push("/login");
		}
	}, [loggedIn, role, router]);

	const fetchPosts = async () => {
		try {
			const fetchedPosts = await getSortedPostsData();
			setPosts(fetchedPosts);
		} catch (error) {
			console.error("Error fetching posts", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (postId) => {
		router.push({
			pathname: "/admin/create-blog-post",
			query: { isEdit: true, postId },
		});
	};

	const handleDelete = async (postId) => {
		if (!confirm("Are you sure you want to delete this post?")) {
			return;
		}

		try {
			await deleteBlogPost(postId, token);
			setPosts(posts.filter((post) => post.id !== postId));
			alert("Blog post deleted successfully!");
		} catch (error) {
			console.error("Error deleting post", error);
			alert("Failed to delete blog post");
		}
	};

	const handleCreateNewPost = () => {
		router.push("/admin/create-blog-post");
	};

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
				<title>The Trick Book - Blog Administration</title>
			</Head>
			<div className='container m-4 mt-5 pt-3'>
				<Typography variant='h2' gutterBottom>
					Manage Blog Posts
				</Typography>
				<Button
					variant='contained'
					color='primary'
					onClick={handleCreateNewPost}
					className='mb-4'
				>
					Create a New Post
				</Button>
				{posts.length > 0 ? (
					<div className='row'>
						{posts.map((post) => (
							<div className='col-md-4 col-sm-12 mb-4' key={post.id}>
								<BlogCard
									id={post.url}
									firstImage={post.images.find((image) =>
										image.includes("?hero=true")
									)}
									title={post.title}
									date={post.date}
									author={post.author}
								/>
								<div className='mt-2 text-center'>
									<IconButton
										onClick={() => handleEdit(post.id)}
										color='text-dark'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(post.id)}
										color='secondary'
									>
										<DeleteIcon />
									</IconButton>
								</div>
							</div>
						))}
					</div>
				) : (
					<Typography variant='h6' color='textSecondary'>
						No posts found.
					</Typography>
				)}
			</div>
		</div>
	);
}
