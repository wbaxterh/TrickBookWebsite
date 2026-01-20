import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTheme } from "next-themes";
import { AuthContext } from "../auth/AuthContext";
import { deleteUser } from "../lib/apiUser";
import { toggleNetwork, getNetworkStatus } from "../lib/apiHomies";
import axios from "axios";
import AdminNav from "../components/AdminNav";
import { Sun, Moon, Users, User } from "lucide-react";
import { Switch } from "../components/ui/switch";

export default function Profile() {
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
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [newProfileImage, setNewProfileImage] = useState(null);
	const [tricklists, setTricklists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [networkEnabled, setNetworkEnabled] = useState(false);
	const [networkLoading, setNetworkLoading] = useState(false);

	// Avoid hydration mismatch for theme
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (!token) return;
			const baseUrl =
				process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";
			try {
				const userId = jwt.decode(token)?.userId;
				if (!userId) {
					setError("Could not determine user ID.");
					setLoading(false);
					return;
				}
				const tricklistsRes = await axios.get(
					`${baseUrl}/api/listings?userId=${userId}`
				);
				setTricklists(
					Array.isArray(tricklistsRes.data) ? tricklistsRes.data : []
				);
			} catch (err) {
				console.error(err);
				setError("Failed to load your tricklists.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [token]);

	// Fetch network status
	useEffect(() => {
		const fetchNetworkStatus = async () => {
			if (!token) return;
			try {
				const status = await getNetworkStatus(token);
				setNetworkEnabled(status.network || false);
			} catch (err) {
				// If endpoint doesn't exist yet, default to false
				console.log("Network status not available yet");
				setNetworkEnabled(false);
			}
		};
		fetchNetworkStatus();
	}, [token]);

	const handleNetworkToggle = async (checked) => {
		setNetworkLoading(true);
		try {
			const userId = jwt.decode(token)?.userId;
			if (!userId) {
				throw new Error("Could not determine user ID");
			}
			await toggleNetwork(userId, checked, token);
			setNetworkEnabled(checked);
		} catch (err) {
			console.error("Error toggling network:", err);
			alert("Failed to update network settings. The feature may not be available yet.");
		} finally {
			setNetworkLoading(false);
		}
	};

	const handleLogout = () => {
		logOut();
		router.push("/login");
	};

	const handleDeleteAccount = async () => {
		if (
			confirm(
				"Are you sure you want to delete your account? This action is irreversible."
			)
		) {
			try {
				const userId = jwt.decode(token)?.userId;
				if (!userId || !token) {
					alert("Authentication failed. Please log in again.");
					router.push("/login");
					return;
				}
				await deleteUser(userId, token);
				alert("Your account has been successfully deleted.");
				logOut();
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
				headers: { "Content-Type": "multipart/form-data" },
			});
			alert("Profile picture updated successfully!");
			router.reload();
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
			{role === "admin" && (
				<div className='m-4'>
					<AdminNav />
				</div>
			)}
			<div className='container my-5'>
				<div className='row justify-content-center'>
					<div className='col-md-8'>
						<div className='card shadow-sm p-5'>
							<div className='card-body'>
								{/* Profile header: image and name on same line */}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 24,
										justifyContent: "center",
										marginBottom: 24,
									}}
								>
									{imageUri ? (
										<Image
											src={imageUri}
											alt='Profile Picture'
											className='rounded-circle'
											width={90}
											height={90}
											style={{ objectFit: "cover", borderRadius: "50%" }}
										/>
									) : (
										<div
											className='d-flex align-items-center justify-content-center rounded-circle bg-secondary'
											style={{ width: 90, height: 90 }}
										>
											<User size={40} className='text-muted' />
										</div>
									)}
									<h3 style={{ margin: 0 }}>{name}</h3>
								</div>
								<p className='card-text mb-4' style={{ textAlign: "center" }}>
									Email: {email}
								</p>

								{/* Action buttons */}
								<div className='d-flex justify-content-center gap-2 mb-4'>
									<Link href='/tricklist'>
										<button
											className='btn btn-primary btn-sm'
											style={{ minWidth: 120 }}
										>
											TrickList Tool
										</button>
									</Link>
									<button
										className='btn btn-danger btn-sm'
										onClick={handleLogout}
										style={{ minWidth: 120 }}
									>
										Logout
									</button>
								</div>

								{loading ? (
									<div className='text-center my-4'>
										Loading your tricklists...
									</div>
								) : error ? (
									<div className='text-danger my-4'>{error}</div>
								) : (
									<div className='mb-4'>
										<h5>Your TrickLists ({tricklists.length})</h5>
										<ul style={{ listStyle: "disc inside", paddingLeft: 0 }}>
											{tricklists.length === 0 && <li>No tricklists yet.</li>}
											{tricklists.map((list) => (
												<li key={list._id}>
													{list.name} ({list.tricks.length} tricks)
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Update profile picture */}
								<div className='mb-4'>
									<h5>Update Profile Picture</h5>
									<form
										onSubmit={handleProfileImageChange}
										style={{ maxWidth: 350, margin: "0 auto" }}
									>
										<input
											type='file'
											accept='image/*'
											onChange={(e) => setNewProfileImage(e.target.files[0])}
											className='form-control mb-3'
										/>
										<button
											type='submit'
											className='btn btn-success btn-sm'
											style={{ minWidth: 120 }}
										>
											Update Picture
										</button>
									</form>
								</div>

								{/* Theme Toggle */}
								<div className='mb-4'>
									<h5>Appearance</h5>
									<div className='d-flex align-items-center gap-3' style={{ maxWidth: 350, margin: '0 auto' }}>
										<span>Theme:</span>
										{mounted && (
											<div className='btn-group' role='group'>
												<button
													type='button'
													className={`btn btn-sm ${theme === 'light' ? 'btn-warning' : 'btn-outline-secondary'}`}
													onClick={() => setTheme('light')}
												>
													<Sun size={16} className='me-1' />
													Light
												</button>
												<button
													type='button'
													className={`btn btn-sm ${theme === 'dark' ? 'btn-warning' : 'btn-outline-secondary'}`}
													onClick={() => setTheme('dark')}
												>
													<Moon size={16} className='me-1' />
													Dark
												</button>
												<button
													type='button'
													className={`btn btn-sm ${theme === 'system' ? 'btn-warning' : 'btn-outline-secondary'}`}
													onClick={() => setTheme('system')}
												>
													System
												</button>
											</div>
										)}
									</div>
								</div>

								{/* Network Settings */}
								<div className='mb-4'>
									<h5>
										<Users size={18} className='me-2' style={{ display: 'inline' }} />
										Network Settings
									</h5>
									<div
										className='d-flex align-items-center justify-content-between p-3 rounded bg-secondary bg-opacity-10'
										style={{
											maxWidth: 400,
											margin: '0 auto',
											border: '1px solid var(--bs-border-color)'
										}}
									>
										<div>
											<div style={{ fontWeight: 500 }}>Discoverable</div>
											<small style={{ opacity: 0.7 }}>
												Allow other riders to find you and send homie requests
											</small>
										</div>
										<Switch
											checked={networkEnabled}
											onCheckedChange={handleNetworkToggle}
											disabled={networkLoading}
										/>
									</div>
									<div className='text-center mt-2'>
										<Link href='/homies' className='text-decoration-none'>
											<small>View Homies &rarr;</small>
										</Link>
									</div>
								</div>

								<button
									className='btn btn-outline-danger mt-3'
									onClick={handleDeleteAccount}
									style={{ minWidth: 120 }}
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
