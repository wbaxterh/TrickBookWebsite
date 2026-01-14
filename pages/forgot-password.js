import { useState } from "react";
import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import { Typography, Button, CircularProgress } from "@mui/material";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("idle"); // idle, loading, success, error
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email) {
			setStatus("error");
			setMessage("Please enter your email address");
			return;
		}

		setStatus("loading");

		try {
			const response = await fetch(
				"https://api.thetrickbook.com/api/users/forgot-password",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				setStatus("success");
				setMessage(data.message || "Check your email for a reset link.");
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
				<title>The Trick Book - Forgot Password</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Reset your TrickBook password" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<div className={`container-fluid ${styles.loginContainer}`}>
				<div className="container">
					<div className="row mb-5">
						<Typography variant="h1" className="text-center">
							Forgot Password
						</Typography>
						<Typography variant="h6" className="text-center">
							Enter your email and we'll send you a reset link
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
											<Button variant="contained" color="primary">
												Back to Login
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
												<label htmlFor="email">Email Address</label>
												<input
													id="email"
													name="email"
													type="email"
													className="w-100"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													disabled={status === "loading"}
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
														"Send Reset Link"
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
