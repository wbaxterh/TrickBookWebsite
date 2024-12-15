import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { deleteUser } from "../lib/apiUser";
import axios from "axios";

export default function Profile({ tricklists, tricks }) {
	const {
		token,
		logOut,
		email,
		name,
		setName,
		imageUri,
		setImageUri,
		role,
		loggedIn,
	} = useContext(AuthContext);
	console.log("image uri from authcontext == ", imageUri);
	const router = useRouter();
	const [newProfileImage, setNewProfileImage] = useState(null);

	const handleLogout = () => {
		logOut(); // Clear token from AuthContext state
		router.push("/login"); // Redirect to login page
	};

	const handleDeleteAccount = async () => {
		if (
			confirm(
				"Are you sure you want to delete your account? This action is irreversible."
			)
		) {
			try {
				const userId = jwt.decode(token)?.userId; // Decode JWT to get the user ID

				if (!userId || !token) {
					alert("Authentication failed. Please log in again.");
					router.push("/login");
					return;
				}

				await deleteUser(userId, token); // API call with user ID and token

				alert("Your account has been successfully deleted.");
				logOut(); // Clear AuthContext and sign out
				router.push("/goodbye");
			} catch (error) {
				console.error("Error deleting account:", error);
				alert("There was an issue deleting your account. Please try again.");
			}
		}
	};

	const handleProfileImageChange = async (event) => {
		event.preventDefault();

		if (!newProfileImage) {
			alert("Please select a new profile image.");
			return;
		}

		const formData = new FormData();
		formData.append("profileImage", newProfileImage);

		try {
			await axios.post("/api/user/update-profile-image", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			alert("Profile picture updated successfully!");
			router.reload(); // Reload to reflect the new profile image
		} catch (error) {
			console.error("Error updating profile picture:", error);
			alert(
				"There was an issue updating your profile picture. Please try again."
			);
		}
	};

	return (
		<>
			<Head>
				<title>The Trick Book - Profile</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Profile' />
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
						<div className='card shadow-sm p-5'>
							<div className='card-body'>
								<Image
									src={imageUri || "/default-profile.png"}
									alt='Profile Picture'
									className='rounded-circle mb-4'
									width={150}
									height={150}
									style={{
										objectFit: "cover",
										borderRadius: "50%", // Keep the rounded style
									}}
								/>
								<h2 className='card-title mb-4'>Welcome, {name}!</h2>
								<p className='card-text mb-4'>Email: {email}</p>

								<div className='mb-4'>
									<h5>Your Stats</h5>
									<p>
										TrickLists: <strong>{tricklists}</strong>
									</p>
									<p>
										Tricks: <strong>{tricks}</strong>
									</p>
								</div>

								<div className='d-flex justify-content-center gap-3 mb-4'>
									<Link href='/tricklist'>
										<button
											className='btn btn-primary'
											style={{ width: "200px" }}
										>
											Open TrickList Tool
										</button>
									</Link>
									<button
										className='btn btn-danger'
										onClick={handleLogout}
										style={{
											width: "200px",
											padding: "10px",
											fontWeight: "bold",
										}}
									>
										Logout
									</button>
								</div>

								<div className='mb-4'>
									<h5>Update Profile Picture</h5>
									<form onSubmit={handleProfileImageChange}>
										<input
											type='file'
											accept='image/*'
											onChange={(e) => setNewProfileImage(e.target.files[0])}
											className='form-control mb-3'
										/>
										<button type='submit' className='btn btn-success'>
											Update Picture
										</button>
									</form>
								</div>

								<button
									className='btn btn-outline-danger mt-3'
									onClick={handleDeleteAccount}
									style={{
										width: "200px",
										fontWeight: "bold",
									}}
								>
									Delete Account
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
