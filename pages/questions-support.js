import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function QuestionsSupport() {
	return (
		<>
			<Head>
				<title>The Trick Book - Questions & Support</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content="The Trick Book - App Privacy Policy"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://thetrickbook.com/" />
				<meta name="author" content="Wes Huber" />
				<meta
					name="keywords"
					content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
				/>
			</Head>
			<Header />
			<Layout>
				<div
					style={{
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
					}}
				>
					<Image
						className={styles.icon}
						src="/adaptive-icon.png" // Route of the image file
						style={{
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto",
						}}
						height={250} // Desired size with correct aspect ratio
						width={250} // Desired size with correct aspect ratio
						alt="Trick Book"
					/>
					<h1 className="pt-3">Questions & Support</h1>

					<h3>
						For Questions & Support please email me{" "}
						<a href="mailto:wesleybaxterhuber@gmail.com">
							wesleybaxterhuber@gmail.com
						</a>
					</h3>

					<h2>
						<Link href="/">
							<span class="material-icons">arrow_back</span> Back to home
						</Link>
					</h2>
				</div>
			</Layout>
			<Footer />
		</>
	);
}
