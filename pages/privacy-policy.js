import Link from "next/link";
import styles from "../styles/privacy.module.css";
import Head from "next/head";
import Image from "next/image";

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
			<div className={`container ${styles.privacyContainer}`}>
				<Image
					className={styles.icon}
					src='/adaptive-icon.png' // Route of the image file
					style={{ margin: "0 auto", textAlign: "center" }}
					height={250} // Desired size with correct aspect ratio
					width={250} // Desired size with correct aspect ratio
					alt='Trick Book'
				/>
				<h1 className='pt-3' style={{ textAlign: "center" }}>
					Privacy Policy
				</h1>
				<p>Privacy Policy for The Trick Book</p>
				<p>Effective date: 03.03.2023</p>

				<p>
					The Trick Book ("us", "we", or "our") operates the The Trick Book
					mobile application (the "Service").
				</p>
				<p>
					This page informs you of our policies regarding the collection, use,
					and disclosure of personal data when you use our Service and the
					choices you have associated with that data.
				</p>
				<p>
					Information We Collect
					<br />
					We collect your name and email address when you register for an
					account on our Service.
				</p>
				<p>
					How We Use Your Information <br />
					We use your information solely to provide you with a unique profile on
					our Service.
				</p>
				<p>
					How We Protect Your Information We store your information on MongoDB
					Atlas, which is protected by an API key that is hidden from anyone.
				</p>
				<p>
					Legal Obligations We do not believe that we have any legal obligations
					under applicable privacy laws. However, we reserve the right to update
					this Privacy Policy if any legal obligations arise.
				</p>
				<p>
					Contact Us If you have any questions about this Privacy Policy or want
					to exercise any of your rights under applicable privacy laws, please
					contact us by email at wesleybaxterhuber@gmail.com or by visiting our
					website at <a href='https://weshuber.com'>https://weshuber.com/</a>.
				</p>
				<h2>
					<Link href='/'>
						{" "}
						<span class='material-icons'>arrow_back</span> Back to home
					</Link>
				</h2>
			</div>
		</>
	);
}
