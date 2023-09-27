import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import Image from "next/image";
import Header from "../components/Header";

export default function Blog() {
	return (
		<>
			<Head>
				<title>The Trick Book - Profile</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="The Trick Book - Blog" />
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
				<h1 className="pt-3" style={{ textAlign: "left" }}>
					Blog
				</h1>
				<p>Hi From profile page</p>
				<Link href="/">
					{" "}
					<span className="material-icons align-middle pb-1">
						arrow_back
					</span>{" "}
					Back to home
				</Link>
			</Layout>
		</>
	);
}
