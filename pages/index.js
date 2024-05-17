import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
	return (
		<>
			<Head>
				<title>The Trick Book</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - App Landing Page' />
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
			<div className={styles.container}>
				<main>
					<section className={styles.splashSection}>
						{/* <h1 className={styles.title}>
          The <a href="#">Trick Book</a>
        </h1> */}
						<div className='d-flex justify-content-center'>
							<Image
								className={styles.icon}
								src='/adaptive-icon.png' // Route of the image file
								height={250} // Desired size with correct aspect ratio
								width={250} // Desired size with correct aspect ratio
								alt='Trick Book'
							/>
						</div>
						<div className='d-flex justify-content-center'>
							<Link href='https://apps.apple.com/us/app/the-trick-book/id6446022788'>
								<Image
									src='Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg'
									width={224}
									height={76}
									className={styles.badge}
								/>
							</Link>
						</div>
						<p className={styles.description}>
							<br />
							View Our <Link href='/privacy-policy'>Privacy Policy</Link> <br />
							<Link href='/questions-support'>Questions & Support</Link>
						</p>
					</section>
					<section className={[styles.missionSection]}>
						<div className={"container"}>
							<div className='row'>
								<div className='col'>
									<h2>About Trick Book</h2>
									<p>
										<strong>
											A pocketbook for your tricks. Connecting teachers and
											students of Action Sports.
										</strong>
									</p>
								</div>
							</div>
						</div>
					</section>
					{/* News Feed Section */}
					<section className={styles.newsFeedSection}>
						<div className={"container"}>
							<div className='row'>
								<div className='col'>
									<h2>Latest News</h2>
									<p>
										We're stoked to announce that the first version of the Trick
										Book app is now available for download! We'd love for you to
										create your trick lists, test the app, and share your
										feedback with us.
									</p>
									{/* Optional: Add a link or button for users to submit feedback */}
								</div>
							</div>
						</div>
					</section>
				</main>

				<Footer />

				<style jsx>{`
					main {
						padding: 5rem 0;
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
					}
					footer {
						width: 100%;
						height: 100px;
						border-top: 1px solid #eaeaea;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					footer img {
						margin-left: 0.5rem;
					}
					footer a {
						display: flex;
						justify-content: center;
						align-items: center;
						text-decoration: none;
						color: inherit;
					}
					code {
						background: #fafafa;
						border-radius: 5px;
						padding: 0.75rem;
						font-size: 1.1rem;
						font-family:
							Menlo,
							Monaco,
							Lucida Console,
							Liberation Mono,
							DejaVu Sans Mono,
							Bitstream Vera Sans Mono,
							Courier New,
							monospace;
					}
				`}</style>

				<style jsx global>{`
					html,
					body {
						padding: 0;
						margin: 0;
						font-family:
							-apple-system,
							BlinkMacSystemFont,
							Segoe UI,
							Roboto,
							Oxygen,
							Ubuntu,
							Cantarell,
							Fira Sans,
							Droid Sans,
							Helvetica Neue,
							sans-serif;
					}
					* {
						box-sizing: border-box;
					}
				`}</style>
			</div>
		</>
	);
}
