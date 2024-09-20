import Link from "next/link";
import styles from "../styles/questions.module.css";
import Head from "next/head";
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import {
	Button,
	TextField,
	CircularProgress,
	Snackbar,
	Alert,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";

const ContactSchema = Yup.object().shape({
	name: Yup.string().required("Name is required"),
	email: Yup.string().email("Invalid email").required("Email is required"),
	message: Yup.string().required("Message is required"),
});

export default function QuestionsSupport() {
	const [successMessage, setSuccessMessage] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);

	return (
		<>
			<Head>
				<title>The Trick Book - Questions & Support</title>
				<link rel='icon' href='/favicon.png' />
				<meta
					name='description'
					content='The Trick Book - App Privacy Policy'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container-fluid ${styles.questionsContainer}`}>
				<PageHeader title='Questions & Support' col='col-sm-6' />
				<div className='container mt-4'>
					<h3>Contact Us</h3>

					{/* Success / Error Notification */}
					{successMessage && (
						<Snackbar
							open
							autoHideDuration={6000}
							onClose={() => setSuccessMessage(null)}
						>
							<Alert
								onClose={() => setSuccessMessage(null)}
								severity='success'
								sx={{ width: "100%" }}
							>
								{successMessage}
							</Alert>
						</Snackbar>
					)}
					{errorMessage && (
						<Snackbar
							open
							autoHideDuration={6000}
							onClose={() => setErrorMessage(null)}
						>
							<Alert
								onClose={() => setErrorMessage(null)}
								severity='error'
								sx={{ width: "100%" }}
							>
								{errorMessage}
							</Alert>
						</Snackbar>
					)}

					<Formik
						initialValues={{ name: "", email: "", message: "" }}
						validationSchema={ContactSchema}
						onSubmit={async (values, { setSubmitting, resetForm }) => {
							try {
								setSubmitting(true);
								// Send form data to your email endpoint
								await axios.post(
									"https://api.thetrickbook.com/api/contact/send-email",
									{
										name: values.name,
										email: values.email,
										message: values.message,
									}
								);
								setSuccessMessage("Message sent successfully!");
								resetForm();
							} catch (error) {
								console.error(error);
								setErrorMessage("Failed to send message. Please try again.");
							} finally {
								setSubmitting(false);
							}
						}}
					>
						{({ isSubmitting, errors, touched }) => (
							<Form className='mt-4'>
								<div className='mb-3'>
									<Field
										as={TextField}
										label='Name'
										name='name'
										fullWidth
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant='outlined'
										className='mb-3'
									/>
								</div>
								<div className='mb-3'>
									<Field
										as={TextField}
										label='Email'
										name='email'
										fullWidth
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant='outlined'
										className='mb-3'
									/>
								</div>
								<div className='mb-3'>
									<Field
										as={TextField}
										label='Message'
										name='message'
										fullWidth
										multiline
										rows={4}
										error={touched.message && Boolean(errors.message)}
										helperText={touched.message && errors.message}
										variant='outlined'
										className='mb-3'
									/>
								</div>
								<div className='d-flex justify-content-between'>
									<Button
										variant='contained'
										color='primary'
										type='submit'
										disabled={isSubmitting}
									>
										{isSubmitting ? <CircularProgress size={24} /> : "Submit"}
									</Button>
									<Link href='/'>
										<Button variant='outlined' color={"secondary"}>
											<span className='material-icons align-middle'>
												arrow_back
											</span>
											Back to home
										</Button>
									</Link>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</>
	);
}
