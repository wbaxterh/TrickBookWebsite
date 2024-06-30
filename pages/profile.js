import Link from "next/link";
import styles from "../styles/profile.module.css";
import Head from "next/head";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Profile() {
	const { email, loggedIn, logOut } = useContext(AuthContext);
	const router = useRouter();
	const handleLogout = () => {
		logOut(); // Clear token from AuthContext state
		router.push("/login"); // Redirect to login page
	};
	return (
		<>
			<Head>
				<title>The Trick Book - Profile</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Blog' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container ${styles.profileContainer}`}>
				<h1 className='pt-3' style={{ textAlign: "left" }}>
					Profile
				</h1>
				<p>Hi {email} your profile will be available on the web soon</p>
				<button className='btn btn-secondary' onClick={handleLogout}>
					Logout
				</button>
				<Link href='/'>
					{" "}
					<span className='material-icons align-middle pb-1'>
						arrow_back
					</span>{" "}
					Back to home
				</Link>
			</div>
		</>
	);
}
export async function getServerSideProps(context) {
	const { req } = context;
	console.log("request from server side props", req);
	const token = req.cookies.token; // Assuming the JWT is stored in a cookie named 'token'
	console.log("token from server side props == ", token);
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
