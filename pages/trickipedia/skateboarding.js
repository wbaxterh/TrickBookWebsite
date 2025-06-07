import Link from "next/link";
import styles from "../../styles/trickipedia.module.css";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { Typography, TextField, InputAdornment, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrickCard from "../../components/TrickCard";
import { getSortedTricksData } from "../../lib/api";

export default function Skateboarding() {
	const [tricks, setTricks] = useState([]);
	const [filteredTricks, setFilteredTricks] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const fetchTricks = async () => {
			const tricksData = await getSortedTricksData();
			setTricks(tricksData);
			setFilteredTricks(tricksData);
		};
		fetchTricks();
	}, []);

	useEffect(() => {
		const filtered = tricks.filter(
			(trick) =>
				trick.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				trick.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				trick.category.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredTricks(filtered);
	}, [searchTerm, tricks]);

	return (
		<>
			<Head>
				<title>The Trick Book - Skateboarding Tricks</title>
				<link rel='icon' href='/favicon.png' />
				<meta
					name='description'
					content='The Trick Book - Skateboarding Tricks Encyclopedia'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link
					rel='canonical'
					href='https://thetrickbook.com/trickipedia/skateboarding'
				/>
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Skateboarding, Tricks, How to, Tutorial, Skate, Skateboard'
				/>
			</Head>
			<div className={`container-fluid ${styles.trickipediaContainer}`}>
				<PageHeader title='Skateboarding Tricks' col='col-sm-4' />

				<div className='container mt-4'>
					<TextField
						fullWidth
						variant='outlined'
						placeholder='Search tricks...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							),
						}}
						className='mb-4'
					/>

					<Grid container spacing={3}>
						{filteredTricks.map((trick) => (
							<Grid item xs={12} sm={6} md={4} key={trick.id}>
								<TrickCard
									id={trick.id}
									name={trick.name}
									category={trick.category}
									difficulty={trick.difficulty}
									description={trick.description}
									images={trick.images}
								/>
							</Grid>
						))}
					</Grid>

					{filteredTricks.length === 0 && (
						<Typography variant='h6' className='text-center mt-4'>
							No tricks found matching your search.
						</Typography>
					)}
				</div>
			</div>
		</>
	);
}
