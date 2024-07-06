import Link from "next/link";
import styles from "../styles/about.module.css";
import Head from "next/head";
import React from "react";
import PageHeader from "../components/PageHeader";
import { Typography } from "@mui/material";

export default function About() {
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
			<div className={`container-fluid ${styles.aboutContainer}`}>
				<PageHeader title='Trickipedia' col='col-sm-4' />
				<section className={`my-5 p-5 ${styles.missionStatement}`}>
					<Typography variant='h2'>Trickipedia</Typography>
					<Typography variant='h5'>Choose a category / sport</Typography>
				</section>
				<section className={`m-5 ${styles.aboutUs}`}>
					<Typography variant='h2' className='my-2'>
						Skateboarding
					</Typography>
				</section>
			</div>
		</>
	);
}
