import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Header from "../components/Header";

export default function ResetPassword() {
	const router = useRouter();
	const { token } = router.query;

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [status, setStatus] = useState("idle"); // idle, loading, success, error
	const [message, setMessage] = useState("");
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [confirmFocused, setConfirmFocused] = useState(false);

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
				`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api"}/users/reset-password`,
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
				<title>Reset Password | TrickBook</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Reset your TrickBook password" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<Header />

			<div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md space-y-6">
					{/* Header */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
						<p className="text-muted-foreground">
							Enter your new password below
						</p>
					</div>

					{/* Card */}
					<Card className="border-border">
						<CardContent className="pt-6 space-y-4">
							{status === "success" ? (
								<div className="text-center space-y-4 py-4">
									<div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
										<CheckCircle className="h-8 w-8 text-green-500" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-foreground mb-2">
											Password Reset!
										</h3>
										<p className="text-sm text-muted-foreground">
											{message}
										</p>
									</div>
									<Link href="/login">
										<Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
											Sign In
										</Button>
									</Link>
								</div>
							) : (
								<>
									{/* Error Message */}
									{status === "error" && (
										<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
											{message}
										</div>
									)}

									<form onSubmit={handleSubmit} className="space-y-4">
										{/* New Password Field */}
										<div className="space-y-2">
											<label htmlFor="password" className="text-sm font-medium text-foreground">
												New Password
											</label>
											<div className="relative">
												<div
													className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-all duration-200 ease-out ${
														passwordFocused || password
															? "opacity-0 -translate-x-2"
															: "opacity-100 translate-x-0"
													}`}
												>
													<Lock className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground text-sm">Enter new password</span>
												</div>
												<Input
													id="password"
													name="password"
													type="password"
													className="h-11 px-3"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													onFocus={() => setPasswordFocused(true)}
													onBlur={() => setPasswordFocused(false)}
													disabled={status === "loading"}
													minLength={5}
												/>
											</div>
										</div>

										{/* Confirm Password Field */}
										<div className="space-y-2">
											<label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
												Confirm Password
											</label>
											<div className="relative">
												<div
													className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-all duration-200 ease-out ${
														confirmFocused || confirmPassword
															? "opacity-0 -translate-x-2"
															: "opacity-100 translate-x-0"
													}`}
												>
													<Lock className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground text-sm">Confirm new password</span>
												</div>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													className="h-11 px-3"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													onFocus={() => setConfirmFocused(true)}
													onBlur={() => setConfirmFocused(false)}
													disabled={status === "loading"}
													minLength={5}
												/>
											</div>
										</div>

										{/* Submit Button */}
										<Button
											type="submit"
											disabled={status === "loading"}
											className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
										>
											{status === "loading" ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Resetting...
												</>
											) : (
												"Reset Password"
											)}
										</Button>
									</form>
								</>
							)}
						</CardContent>
					</Card>

					{/* Back to Login Link */}
					<Link
						href="/login"
						className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Sign In
					</Link>
				</div>
			</div>
		</>
	);
}
