import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import Image from "next/image";
import Header from "../components/Header";
import jwt from "jsonwebtoken";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext"; // Adjust the path to where your AuthContext is located
import Footer from "../components/Footer";

export default function Profile() {
	const { email, token } = useContext(AuthContext);
	console.log("email from context: ", email);
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
					Profile
				</h1>
				<p>Hi {email} your profile will be available on the web soon</p>
				<Link href="/">
					{" "}
					<span className="material-icons align-middle pb-1">
						arrow_back
					</span>{" "}
					Back to home
				</Link>
			</Layout>
			<Footer />
		</>
	);
}
export async function getServerSideProps(context) {
	const { req } = context;
	const token = req.cookies.token; // Assuming the JWT is stored in a cookie named 'token'

	if (!token) {
		return {
			redirect: {
				destination: "/login", // Redirect to login page if no token
				permanent: false,
			},
		};
	}

	try {
		jwt.verify(token, "jwtPrivateKey"); // Replace 'your-secret-key' with the actual secret key
	} catch (e) {
		return {
			redirect: {
				destination: "/login", // Redirect to login if token is invalid
				permanent: false,
			},
		};
	}

	// If token is valid, proceed to render the Profile page
	return {
		props: {
			isloggedIn: "true",
		},
	};
}
