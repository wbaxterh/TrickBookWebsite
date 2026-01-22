import { useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useFormik } from "formik";
import { AuthContext } from "../auth/AuthContext";
import { signIn } from "next-auth/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Header from "../components/Header";

const validate = (values) => {
	const errors = {};
	if (!values.email) {
		errors.email = "Email is required";
	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
		errors.email = "Invalid email address";
	}

	if (!values.password) {
		errors.password = "Password is required";
	} else if (values.password.length < 5) {
		errors.password = "Must be at least 5 characters";
	}

	return errors;
};

export default function Login() {
	const { logIn } = useContext(AuthContext);
	const [loginError, setLoginError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [emailFocused, setEmailFocused] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);
	const router = useRouter();

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validate,
		onSubmit: async (values) => {
			setIsLoading(true);
			setLoginError(null);

			try {
				const result = await signIn("credentials", {
					redirect: false,
					email: values.email,
					password: values.password,
				});

				if (result?.error) {
					setLoginError(result.error);
				} else if (result?.ok) {
					logIn(null, values.email);
					router.push("/profile");
				} else {
					setLoginError("An unknown error occurred");
				}
			} catch (error) {
				const errorMessage = error.response?.data?.error || "An unknown error occurred";
				setLoginError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
	});

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		signIn("google", { callbackUrl: "/profile" });
	};

	return (
		<>
			<Head>
				<title>Sign In | TrickBook</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Sign in to your TrickBook account" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Header />

			<div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md space-y-6">
					{/* Header */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
						<p className="text-muted-foreground">
							Sign in to your TrickBook account
						</p>
					</div>

					{/* Login Card */}
					<Card className="border-border">
						<CardContent className="pt-6 space-y-4">
							{/* Error Message */}
							{loginError && (
								<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
									{loginError}
								</div>
							)}

							{/* Login Form */}
							<form onSubmit={formik.handleSubmit} className="space-y-4">
								{/* Email Field */}
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-medium text-foreground">
										Email Address
									</label>
									<div className="relative">
										<Mail
											className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-200 ${
												emailFocused || formik.values.email ? "opacity-0 -translate-x-2" : "opacity-100"
											}`}
										/>
										<Input
											id="email"
											name="email"
											type="email"
											placeholder={emailFocused || formik.values.email ? "" : "you@example.com"}
											className={`transition-all duration-200 ${
												emailFocused || formik.values.email ? "pl-3" : "pl-10"
											}`}
											onChange={formik.handleChange}
											onFocus={() => setEmailFocused(true)}
											onBlur={(e) => {
												setEmailFocused(false);
												formik.handleBlur(e);
											}}
											value={formik.values.email}
											disabled={isLoading}
										/>
									</div>
									{formik.touched.email && formik.errors.email && (
										<p className="text-xs text-red-500">{formik.errors.email}</p>
									)}
								</div>

								{/* Password Field */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label htmlFor="password" className="text-sm font-medium text-foreground">
											Password
										</label>
										<Link
											href="/forgot-password"
											className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
										>
											Forgot password?
										</Link>
									</div>
									<div className="relative">
										<Lock
											className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-200 ${
												passwordFocused || formik.values.password ? "opacity-0 -translate-x-2" : "opacity-100"
											}`}
										/>
										<Input
											id="password"
											name="password"
											type="password"
											placeholder={passwordFocused || formik.values.password ? "" : "Enter your password"}
											className={`transition-all duration-200 ${
												passwordFocused || formik.values.password ? "pl-3" : "pl-10"
											}`}
											onChange={formik.handleChange}
											onFocus={() => setPasswordFocused(true)}
											onBlur={(e) => {
												setPasswordFocused(false);
												formik.handleBlur(e);
											}}
											value={formik.values.password}
											disabled={isLoading}
										/>
									</div>
									{formik.touched.password && formik.errors.password && (
										<p className="text-xs text-red-500">{formik.errors.password}</p>
									)}
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={isLoading}
									className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Signing in...
										</>
									) : (
										"Sign In"
									)}
								</Button>
							</form>

							{/* Divider */}
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t border-border" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card px-2 text-muted-foreground">or continue with</span>
								</div>
							</div>

							{/* Google Sign In */}
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={handleGoogleSignIn}
								disabled={isGoogleLoading}
							>
								{isGoogleLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
								)}
								Sign in with Google
							</Button>
						</CardContent>
					</Card>

					{/* Sign Up Link */}
					<p className="text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link href="/signup" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}
