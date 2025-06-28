import Link from "next/link";
import styles from "../styles/trickipedia.module.css";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Typography, Button, Grid } from "@mui/material";
import { useCategory } from "../auth/CategoryContext";
import { getCategories } from "../lib/api";

export default function Trickipedia() {
	const { setSelectedCategory } = useCategory();
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		const fetchCategories = async () => {
			const data = await getCategories();
			setCategories(data);
		};
		fetchCategories();
	}, []);

	const handleCategoryClick = (category) => {
		setSelectedCategory(category.name.toLowerCase());
	};

	return (
		<>
			<Head>
				<title>The Trick Book - Trickipedia</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - About Us' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container-fluid ${styles.trickipediaContainer}`}>
				<PageHeader title='Trickipedia' col='col-sm-4' />

				<section className={`my-5 p-5 ${styles.missionStatement}`}>
					<Typography variant='h2' align='center'>
						Choose a Category
					</Typography>
				</section>

				<section className={`m-5 text-center`}>
					<Grid container spacing={4} justifyContent='center'>
						{categories.map((category) => (
							<Grid item key={category._id} xs={12} sm={6} md={4}>
								<Link
									href={`/trickipedia/${category.name.toLowerCase()}`}
									passHref
								>
									<Button
										variant='contained'
										fullWidth
										sx={{
											backgroundColor: "#1f1f1f",
											color: "#fff000",
											padding: "20px",
											fontSize: "1.5rem",
											border: "2px solid #fff000",
											boxShadow: "0 4px 15px rgba(255, 240, 0, 0.25)",
											transition: "transform 0.2s, box-shadow 0.2s",
											"&:hover": {
												backgroundColor: "#1f1f1f",
												transform: "translateY(-3px)",
												boxShadow: "0 8px 20px rgba(255, 240, 0, 0.35)",
											},
										}}
										onClick={() => handleCategoryClick(category)}
									>
										{category.name}
									</Button>
								</Link>
							</Grid>
						))}
					</Grid>
				</section>
			</div>
		</>
	);
}
