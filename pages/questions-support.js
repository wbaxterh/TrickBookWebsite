import Link from "next/link";
import styles from "../styles/questions.module.css";
import Head from "next/head";
import React from "react";
import PageHeader from "../components/PageHeader";
import Image from "next/image";
import { Button } from "@mui/material";

export default function QuestionsSupport() {
	return (
		<>
			<Head>
				<title>The Trick Book - Questions & Support</title>
				<link rel='icon' href='/favicon.png' />
				<meta
					name='description'
					content='The Trick Book - App Privacy Policy'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container-fluid ${styles.questionsContainer}`}>
				<PageHeader title='Questions & Support' col='col-sm-6' />
				<div className='container'>
					<h3>
						For Questions & Support please email me{" "}
						<a href='mailto:wesleybaxterhuber@gmail.com'>
							wesleybaxterhuber@gmail.com
						</a>
					</h3>

					<Link href='/'>
						<Button variant='outlined' color={"secondary"}>
							<span className='material-icons align-middle'>arrow_back</span>
							Back to home
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
}
