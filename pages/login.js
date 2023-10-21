import { React, useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import Image from "next/image";
import Header from "../components/Header";
import { useFormik } from "formik";
import { AuthContext } from "../auth/AuthContext"; // Adjust the path to where your AuthContext is located
import Footer from "../components/Footer";

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
	const loginUser = async (email, password) => {
		const response = await fetch("/api/auth", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		return response;
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
			const response = await loginUser(values.email, values.password);
			if (response.ok) {
				const data = await response.json(); // Assuming the token is returned in JSON payload
				console.log(data, values.email);
				logIn(data.token, values.email); // Update AuthContext loggedIn state
				//setToken(data.token); // Update AuthContext token state, again assuming token is returned in 'data'

				// Navigate to profile page
				router.push("/profile");
			} else {
				const data = await response.json();
				setLoginError(data.error || "An unknown error occurred");
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
			<Header />
			<Layout>
				<div className='container'>
					<div className='row mb-5'>
						<h1 className='text-center'>Log In to your Account</h1>
						<h6 className='text-center'>
							Don't have an account?{" "}
							<Link className={"underline"} href='/signup'>
								Sign up here
							</Link>
						</h6>
					</div>
					<form onSubmit={formik.handleSubmit}>
						{loginError && (
							<div className='row m-1'>
								<div className='col text-center text-danger'>{loginError}</div>
							</div>
						)}

						<div className='row m-1'>
							<div className={`col-sm-3 text-right ${styles.textRight}`}>
								<label htmlFor='email'>Email Address</label>
							</div>
							<div className='col'>
								<input
									id='email'
									name='email'
									type='email'
									className='w-100'
									onChange={formik.handleChange}
									value={formik.values.email}
								/>
							</div>
							{formik.errors.email ? <div>{formik.errors.email}</div> : null}
						</div>
						<div className='row m-1'>
							<div className={`col-sm-3 text-right ${styles.textRight}`}>
								<label className='justify-self-end' htmlFor='password'>
									Password
								</label>
							</div>
							<div className='col'>
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
								className={`col-sm-6 ms-auto justify-content-end ${styles.textRight}`}
							>
								<Link className={"btn btn-secondary p-1 px-2 me-1"} href='/'>
									{" "}
									<span className='material-icons align-middle pb-1'>
										arrow_back
									</span>{" "}
									Back to home
								</Link>
								<button
									className='btn btn-primary custom-primary p-1 px-2'
									type='submit'
								>
									Submit
								</button>
							</div>
						</div>
					</form>
				</div>
			</Layout>
			<Footer />
		</>
	);
}
