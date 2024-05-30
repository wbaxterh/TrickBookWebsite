import Link from "next/link";
import styles from "../styles/login.module.css";
import Head from "next/head";
import { useFormik } from "formik";
import { Typography, Button } from "@mui/material";

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
export default function Signup() {
	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validate,
		onSubmit: (values) => {
			// Here you would typically make an API request for login
			console.log(values);
		},
	});
	return (
		<>
			<Head>
				<title>The Trick Book - Sign Up</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Login' />
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
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
