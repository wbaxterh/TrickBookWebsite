import { React, useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import { useFormik } from "formik";
import { Typography, Button } from "@mui/material";
import { AuthContext } from "../auth/AuthContext";
import { signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import jwt from "jsonwebtoken";

const validate = (values) => {
	const errors = {};
	if (!values.email) {
		errors.email = "Required";
	} else if (values.email.length < 4) {
		errors.email = "Must be 4 characters or more";
	}

	if (!values.password) {
		errors.password = "Required";
	} else if (values.password.length < 8) {
		errors.password = "Must be 8 characters or more";
	}

	return errors;
};

export default function Login() {
	const authContext = useContext(AuthContext);
	const { logIn } = useContext(AuthContext);

	// Check if the context is available
	if (!authContext) {
		console.error("AuthContext is not available!");
		return <div>Error: Could not get authentication context.</div>;
	}

	const [loginError, setLoginError] = useState(null);
	const router = useRouter();

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validate,
		onSubmit: async (values) => {
			try {
				const result = await signIn("credentials", {
					redirect: false,
					email: values.email,
					password: values.password,
				});

				console.log("signIn result:", result);

				if (result?.error) {
					setLoginError(result.error);
				} else if (result?.ok) {
					logIn(null, values.email);
					router.push("/profile");
				} else {
					console.log("No error and no ok - unexpected result");
					setLoginError("An unknown error occurred");
				}
			} catch (error) {
				console.log("Caught error:", error);
				const errorMessage =
					error.response?.data?.error || "An unknown error occurred";
				setLoginError(errorMessage);
			}
		},
	});

	const handleGoogleSignIn = async () => {
		signIn("google", { callbackUrl: "/profile" });
	};

	return (
		<>
			<Head>
				<title>The Trick Book - Login</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Login' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container-fluid ${styles.loginContainer}`}>
				<div className='container'>
					<div className='row mb-5'>
						<Typography variant='h1' className='text-center'>
							Sign In to your Account
						</Typography>
						<Typography variant='h6' className='text-center'>
							Don't have an account?{" "}
							<Link href='/signup'>
								<Button variant='outlined' color='secondary'>
									Sign up here
								</Button>
							</Link>
						</Typography>
					</div>
					<div className='row mb-5'>
						<div className='col'>
							<div className={`container ${styles.formContainer}`}>
								<form onSubmit={formik.handleSubmit}>
									{loginError && (
										<div className='row m-1'>
											<div className='col text-center text-danger'>
												{loginError}
											</div>
										</div>
									)}

									<div className='row m-1'>
										<div className='col'>
											<label htmlFor='email'>Email Address</label>
											<input
												id='email'
												name='email'
												type='email'
												className='w-100'
												onChange={formik.handleChange}
												value={formik.values.email}
											/>
										</div>
										{formik.errors.email ? (
											<div>{formik.errors.email}</div>
										) : null}
									</div>
									<div className='row m-1'>
										<div className='col'>
											<label className='justify-self-end' htmlFor='password'>
												Password
											</label>
											<input
												id='password'
												name='password'
												type='password'
												className='w-100'
												onChange={formik.handleChange}
												value={formik.values.password}
											/>
										</div>
										{formik.errors.password ? (
											<div>{formik.errors.password}</div>
										) : null}
									</div>
									<div className='row m-1 mt-2 ms-auto'>
										<div
											className={`col-sm justify-content-start ${styles.textRight}`}
										>
											<Button
												variant='contained'
												color='primary'
												type='submit'
												className='custom-primary p-1 px-2'
												sx={{
													backgroundColor: "#fcf150",
													color: "#333",
													width: 200,
												}}
											>
												Submit
											</Button>
											<Link className={"p-1 px-2 me-1"} href='/forgot-password'>
												<Button
													variant='text'
													color='secondary'
													className='mt-1'
												>
													Forgot Password?
												</Button>
											</Link>
										</div>
									</div>
								</form>
								<div className='row mt-4'>
									<div className='col text-center'>
										<Typography variant='body1' className='mb-2'>
											------ or ------
										</Typography>
										<Button
											variant='contained'
											color='secondary'
											onClick={handleGoogleSignIn}
											startIcon={<GoogleIcon />} // Add the Google icon here
										>
											Sign in with Google
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
