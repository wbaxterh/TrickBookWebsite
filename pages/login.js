import { React, useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import axios from "axios";
import { useFormik } from "formik";
import { Typography, Button } from "@mui/material";
import { AuthContext } from "../auth/AuthContext"; // Adjust the path to where your AuthContext is located

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000"; // Default to localhost if BASE_URL is not set

const validate = (values) => {
	const errors = {};
	if (!values.email) {
		errors.email = "Required";
	} else if (values.email.length < 4) {
		//errors.email = "Must be 4 characters or more";
	}

	if (!values.password) {
		errors.password = "Required";
	} else if (values.password.length < 8) {
		//errors.password = "Must be 8 characters or more";
	}

	return errors;
};
export default function Login() {
	const authContext = useContext(AuthContext);
	const { logIn, setToken } = useContext(AuthContext);

	// Check if the context is available
	if (!authContext) {
		console.error("AuthContext is not available!");
		return <div>Error: Could not get authentication context.</div>;
	}

	//API fetch
	// const loginUser = async (email, password) => {
	// 	const response = await fetch(`${baseUrl}/api/auth`, {
	// 		method: "POST",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify({ email, password }),
	// 	});

	// 	return response;
	// };
	const loginUser = async (email, password) => {
		try {
			// Call the Next.js API route which will handle the authentication
			const response = await axios.post("/api/auth", { email, password });
			return response;
		} catch (error) {
			// Handle any errors here
			console.error(
				"Login error:",
				error.response ? error.response.data : error.message
			);
			throw error; // Re-throw the error to be handled in onSubmit
		}
	};
	//onSubmit handle errors or redirect the user
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
				const response = await loginUser(values.email, values.password);
				const data = response.data; // Axios automatically parses JSON responses

				console.log("Data from api == ", data, values.email);
				logIn(data.token, values.email); // Update AuthContext loggedIn state

				// Navigate to profile page
				router.push("/profile");
			} catch (error) {
				// Handle login errors
				const errorMessage =
					error.response && error.response.data
						? error.response.data.error
						: "An unknown error occurred";
				setLoginError(errorMessage);
			}
		},
	});

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
												}} // Customize styles here
											>
												Submit
											</Button>
											<Link className={"p-1 px-2 me-1"} href='/'>
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
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
