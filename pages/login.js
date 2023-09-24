import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import Image from "next/image";
import Header from "../components/Header";
import { useFormik } from "formik";

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
export default function Blog() {
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
				<title>The Trick Book - Login</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="The Trick Book - Login" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://thetrickbook.com/" />
				<meta name="author" content="Wes Huber" />
				<meta
					name="keywords"
					content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
				/>
			</Head>
			<Header />
			<Layout>
				<div className="container">
					<div className="row mb-5">
						<h1 className="text-center">Log In to your Account</h1>
						<h6 className="text-center">
							Don't have an account?{" "}
							<Link className={"underline"} href="/sign-up">
								Sign up here
							</Link>
						</h6>
					</div>
					<form onSubmit={formik.handleSubmit}>
						<div className="row m-1">
							<div className={`col-sm-5 text-right ${styles.textRight}`}>
								<label htmlFor="email">Email Address</label>
							</div>
							<div className="col">
								<input
									id="email"
									name="email"
									type="email"
									className="w-100"
									onChange={formik.handleChange}
									value={formik.values.email}
								/>
							</div>
							{formik.errors.email ? <div>{formik.errors.email}</div> : null}
						</div>
						<div className="row m-1">
							<div className={`col-sm-5 text-right ${styles.textRight}`}>
								<label className="justify-self-end" htmlFor="password">
									Password
								</label>
							</div>
							<div className="col">
								<input
									id="password"
									name="password"
									type="password"
									className="w-100"
									onChange={formik.handleChange}
									value={formik.values.password}
								/>
							</div>
							{formik.errors.password ? (
								<div>{formik.errors.password}</div>
							) : null}
						</div>
						<div className="row m-1 mt-2 ms-auto">
							<div
								className={`col-sm-6 ms-auto justify-content-end ${styles.textRight}`}
							>
								<Link className={"btn btn-secondary p-1 px-2 me-1"} href="/">
									{" "}
									<span className="material-icons align-middle pb-1">
										arrow_back
									</span>{" "}
									Back to home
								</Link>
								<button className="btn btn-primary p-1 px-2" type="submit">
									Submit
								</button>
							</div>
						</div>
					</form>
				</div>
			</Layout>
		</>
	);
}
