import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import { Typography, Button, CircularProgress } from "@mui/material";

export default function ResetPassword() {
	const router = useRouter();
	const { token } = router.query;

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [status, setStatus] = useState("idle"); // idle, loading, success, error
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			setStatus("error");
			setMessage("Please fill in all fields");
			return;
		}

		if (password.length < 5) {
			setStatus("error");
			setMessage("Password must be at least 5 characters");
			return;
		}

		if (password !== confirmPassword) {
			setStatus("error");
			setMessage("Passwords do not match");
			return;
		}

		if (!token) {
			setStatus("error");
			setMessage("Invalid reset link. Please request a new one.");
			return;
		}

		setStatus("loading");

		try {
			const response = await fetch(
				"https://api.thetrickbook.com/api/users/reset-password",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token, newPassword: password }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				setStatus("success");
				setMessage(data.message || "Password reset successful!");
			} else {
				setStatus("error");
				setMessage(data.error || "Something went wrong. Please try again.");
			}
		} catch (error) {
			setStatus("error");
			setMessage("Network error. Please try again.");
		}
	};

	return (
		<>
			<Head>
				<title>The Trick Book - Reset Password</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Reset your TrickBook password" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<div className={`container-fluid ${styles.loginContainer}`}>
				<div className="container">
					<div className="row mb-5">
						<Typography variant="h1" className="text-center">
							Reset Password
						</Typography>
						<Typography variant="h6" className="text-center">
							Enter your new password below
						</Typography>
					</div>
					<div className="row mb-5">
						<div className="col">
							<div className={`container ${styles.formContainer}`}>
								{status === "success" ? (
									<div className="text-center">
										<Typography variant="h6" className="text-success mb-3">
											{message}
										</Typography>
										<Link href="/login">
											<Button
												variant="contained"
												color="primary"
												sx={{
													backgroundColor: "#fcf150",
													color: "#333",
												}}
											>
												Go to Login
											</Button>
										</Link>
									</div>
								) : (
									<form onSubmit={handleSubmit}>
										{status === "error" && (
											<div className="row m-1">
												<div className="col text-center text-danger">
													{message}
												</div>
											</div>
										)}

										<div className="row m-1">
											<div className="col">
												<label htmlFor="password">New Password</label>
												<input
													id="password"
													name="password"
													type="password"
													className="w-100"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													disabled={status === "loading"}
													minLength={5}
												/>
											</div>
										</div>

										<div className="row m-1">
											<div className="col">
												<label htmlFor="confirmPassword">Confirm Password</label>
												<input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													className="w-100"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													disabled={status === "loading"}
													minLength={5}
												/>
											</div>
										</div>

										<div className="row m-1 mt-3">
											<div className="col text-center">
												<Button
													variant="contained"
													color="primary"
													type="submit"
													disabled={status === "loading"}
													sx={{
														backgroundColor: "#fcf150",
														color: "#333",
														width: 200,
													}}
												>
													{status === "loading" ? (
														<CircularProgress size={24} color="inherit" />
													) : (
														"Reset Password"
													)}
												</Button>
											</div>
										</div>

										<div className="row m-1 mt-3">
											<div className="col text-center">
												<Link href="/login">
													<Button variant="text" color="secondary">
														Back to Login
													</Button>
												</Link>
											</div>
										</div>
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
