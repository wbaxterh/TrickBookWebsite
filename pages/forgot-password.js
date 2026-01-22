import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Header from "../components/Header";

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
				`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api"}/users/forgot-password`,
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
				<title>Forgot Password | TrickBook</title>
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
						<h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
						<p className="text-muted-foreground">
							No worries, we'll send you reset instructions
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
											Check your email
										</h3>
										<p className="text-sm text-muted-foreground">
											{message}
										</p>
									</div>
									<Link href="/login">
										<Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
											Back to Sign In
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
										{/* Email Field */}
										<div className="space-y-2">
											<label htmlFor="email" className="text-sm font-medium text-foreground">
												Email Address
											</label>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input
													id="email"
													name="email"
													type="email"
													placeholder="you@example.com"
													className="pl-10"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													disabled={status === "loading"}
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
													Sending...
												</>
											) : (
												"Send Reset Link"
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
