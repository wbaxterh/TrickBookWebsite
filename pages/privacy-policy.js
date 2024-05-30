import Link from "next/link";
import styles from "../styles/privacy.module.css";
import Head from "next/head";
import PageHeader from "../components/PageHeader";
import { Typography, Button } from "@mui/material";
export default function PrivacyPolicy() {
	return (
		<>
			<Head>
				<title>The Trick Book - Privacy Policy</title>
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
			<div className={`container-fluid ${styles.privacyContainer}`}>
				<PageHeader title='Privacy Policy' col='col-sm-5' />
				<div class='container'>
					{/* <Typography variant='h2'>
						Privacy Policy for The Trick Book
					</Typography> */}
					<Typography variant='body1' className='my-5'>
						<p>
							<i>Effective date: 03.03.2023</i>
						</p>

						<p>
							The Trick Book ("us", "we", or "our") operates the The Trick Book
							mobile application (the "Service").
						</p>
						<p>
							This page informs you of our policies regarding the collection,
							use, and disclosure of personal data when you use our Service and
							the choices you have associated with that data.
						</p>
						<p>
							<u>Information We Collect</u>
							<br />
							We collect your name and email address when you register for an
							account on our Service.
						</p>
						<p>
							<u>How We Use Your Information</u> <br />
							We use your information solely to provide you with a unique
							profile on our Service.
						</p>
						<p>
							<u>How We Protect Your Information</u>
							<br /> We store your information on MongoDB Atlas, which is
							protected by an API key that is hidden from anyone.
						</p>
						<p>
							<u>Legal Obligations</u>
							<br /> We do not believe that we have any legal obligations under
							applicable privacy laws. However, we reserve the right to update
							this Privacy Policy if any legal obligations arise.
						</p>
						<p>
							<u>Contact Us</u> <br /> If you have any questions about this
							Privacy Policy or want to exercise any of your rights under
							applicable privacy laws, please contact us by email at
							wesleybaxterhuber@gmail.com or by visiting our website at{" "}
							<a href='https://weshuber.com'>https://weshuber.com/</a>.
						</p>
					</Typography>

					<Link href='/'>
						<Button variant='outlined' color={"secondary"}>
							<span className='material-icons align-middle'>arrow_back</span>
							Back to home
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
}
