import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Typography, Button, TextField, CircularProgress } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../auth/AuthContext";
import styles from "../../styles/admin.module.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000"; // process.env.NEXT_PUBLIC_BASE_URL ||

export default function BlogAdmin() {
	const { user, token, loggedIn, role } = useContext(AuthContext);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [date, setDate] = useState("");
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true); // Add loading state
	const router = useRouter();

	useEffect(() => {
		if (loggedIn === null) {
			// Still checking login status
			return;
		}

		if (loggedIn && role === "admin") {
			setLoading(false); // User is authenticated and has admin role
		} else {
			router.push("/login");
		}
	}, [loggedIn, role, router]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const postData = {
			title,
			author,
			date,
			content,
		};

		try {
			await axios.post(`${baseUrl}/api/blog`, postData, {
				headers: {
					"x-auth-token": token,
				},
			});
			alert("Blog post submitted successfully!");
		} catch (error) {
			console.error("Error submitting blog post", error);
			alert("Failed to submit blog post");
		}
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
				<title>The Trick Book - Blog Admin</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Admin' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className='container m-4 mt-5 pt-3'>
				<Typography variant='h2' gutterBottom>
					Blog Administration
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
					<Button type='submit' variant='contained' color='primary'>
						Submit
					</Button>
				</form>
			</div>
		</div>
	);
}
