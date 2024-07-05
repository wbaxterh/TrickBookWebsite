import Link from "next/link";
import Head from "next/head";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie"; // Importing js-cookie to manage cookies
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Profile({ name, imageUri }) {
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
			<div className='container my-5'>
				<div className='row justify-content-center'>
					<div className='col-md-8 text-center'>
						<div className='card shadow-sm p-4'>
							<div className='card-body'>
								<img
									src={imageUri}
									alt='Profile Picture'
									className='rounded-circle mb-4'
									style={{ width: "150px", height: "150px" }}
								/>
								<h2 className='card-title'>Welcome, {name}!</h2>
								<p className='card-text'>
									Hi {email}, your profile will be available on the web soon.
								</p>
								<button
									className='btn btn-secondary my-3'
									onClick={handleLogout}
								>
									Logout
								</button>
								<Link className='btn btn-primary' href='/'>
									<span className='material-icons align-middle pb-1'>
										arrow_back
									</span>{" "}
									Back to home
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export async function getServerSideProps(context) {
	const { req } = context;
	const session = await getSession(context);
	console.log("session data from profile js == ", session);

	if (
		!session ||
		!session.user ||
		!session.user.jwtToken ||
		!session.user.jwtToken.token
	) {
		return {
			redirect: {
				destination: "/login", // Redirect to login page if no token
				permanent: false,
			},
		};
	}

	const token = session.user.jwtToken.token; // Assuming the JWT is stored in the session
	console.log("token from server side props == ", token);

	let profileInfo = {};
	try {
		jwt.verify(token, "jwtPrivateKey"); // Replace 'your-secret-key' with the actual secret key
		profileInfo = jwt.verify(token, "jwtPrivateKey");
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
			name: profileInfo.name,
			imageUri: profileInfo.imageUri,
		},
	};
}
