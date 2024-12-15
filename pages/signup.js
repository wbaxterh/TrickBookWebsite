import { React, useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import { useFormik } from "formik";
import { Typography, Button } from "@mui/material";
import { signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import axios from "axios";
import { useRouter } from "next/router";

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

	if (!values.confirmPassword) {
		errors.confirmPassword = "Required";
	} else if (values.confirmPassword !== values.password) {
		errors.confirmPassword = "Passwords must match";
	}

	return errors;
};

export default function Signup() {
	const { logIn } = useContext(AuthContext); // Use AuthContext's login function
	const router = useRouter();
	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validate,
		onSubmit: async (values) => {
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
					{
						name: values.name,
						email: values.email,
						password: values.password,
					}
				);
				console.log("Registration successful!");

				// Simulate login after successful registration
				const loginResult = await signIn("credentials", {
					redirect: false,
					email: values.email,
					password: values.password,
				});

				if (loginResult.error) {
					setRegisterError("Login after registration failed.");
					return;
				}

				// Decode token, update AuthContext, and redirect
				const token = loginResult.token;
				//const user = jwtDecode(token);

				logIn(token, values.email); // Save login state
				router.push("/profile"); // Redirect to profile
			} catch (error) {
				console.error(
					"Registration error:",
					error.response ? error.response.data : error.message
				);
				// Handle the error appropriately
			}
		},
	});

	const handleGoogleSignIn = async () => {
		signIn("google", { callbackUrl: "/profile" });
	};

	return (
		<>
			<Head>
				<title>The Trick Book - Sign Up</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Sign Up' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App, The Trick Book'
				/>
			</Head>
			<div className={`container-fluid ${styles.loginContainer}`}>
				<div className='container'>
					<div className='row mb-5'>
						<Typography variant='h1' className='text-center'>
							Register an Account
						</Typography>
						<Typography variant='h6' className='text-center'>
							Already have an account?{" "}
							<Link href='/login'>
								<Button variant='outlined' color='secondary'>
									Log in here
								</Button>
							</Link>
						</Typography>
					</div>
					<div className='row mb-5'>
						<div className='col'>
							<div className={`container ${styles.formContainer}`}>
								<form onSubmit={formik.handleSubmit}>
									<div className='row m-1'>
										<div className='col'>
											<div className='col'>
												<label htmlFor='name'>Name</label>
												<input
													id='name'
													name='name'
													type='text'
													className='w-100'
													onChange={formik.handleChange}
													value={formik.values.name}
												/>
											</div>
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
									<div className='row m-1'>
										<div className='col'>
											<label htmlFor='confirmPassword'>Confirm Password</label>
											<input
												id='confirmPassword'
												name='confirmPassword'
												type='password'
												className='w-100'
												onChange={formik.handleChange}
												value={formik.values.confirmPassword}
											/>
											{formik.errors.confirmPassword ? (
												<div>{formik.errors.confirmPassword}</div>
											) : null}
										</div>
									</div>
									<div className='row m-1 mt-2 ms-auto'>
										<div
											className={`col-sm ms-auto justify-content-end ${styles.textRight}`}
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
												}} // Customize styles here
											>
												Create my Account
											</Button>
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
											// sx={{ backgroundColor: "#4285F4", color: "#fff" }}
											startIcon={<GoogleIcon />} // Add the Google icon here
										>
											Sign up with Google
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
