import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";

export default function Home() {
	return (
		<>
			<Head>
				<title>The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="The Trick Book - App Landing Page" />
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
			<div className={styles.container}>
				<main>
					<section className={styles.splashSection}>
						{/* <h1 className={styles.title}>
          The <a href="#">Trick Book</a>
        </h1> */}

						<Image
							className={styles.icon}
							src="/adaptive-icon.png" // Route of the image file
							height={250} // Desired size with correct aspect ratio
							width={250} // Desired size with correct aspect ratio
							alt="Trick Book"
						/>
						<Link href="https://apps.apple.com/us/app/the-trick-book/id6446022788">
							<Image
								src="Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
								width={224}
								height={76}
								className={styles.badge}
							/>
						</Link>
						<p className={styles.description}>
							<br />
							View Our <Link href="/privacy-policy">Privacy Policy</Link> <br />
							<Link href="/questions-support">Questions & Support</Link>
						</p>
					</section>
					<section className={[styles.missionSection]}>
						<div className={"container"}>
							<div className="row">
								<div className="col">
									<h2>About Trick Book</h2>
									<p>
										<strong>Developed by Riders, for Riders</strong>
									</p>
									<p>
										In the world of action sports, progression is the heart of
										passion. We understand that, because we are riders
										ourselves. Trick Book is not just an app; it's a companion
										in your journey to mastering new tricks, pushing your
										limits, and connecting with a community that shares your
										enthusiasm.
									</p>

									<h3>Our Mission</h3>
									<p>To be a continually evolving platform where riders can:</p>
									<ul>
										<li>
											<strong>Organize & Track</strong> their repertoire of
											tricks with ease.
										</li>
										<li>
											<strong>Discover & Learn</strong> new tricks that fuel
											their passion and skillset.
										</li>
										<li>
											<strong>Save & Share</strong> their favorite locations to
											perform tricks.
										</li>
										<li>
											<strong>Connect & Grow</strong> with a community of fellow
											riders eager to share their experiences and knowledge.
										</li>
									</ul>

									<p>
										Together, we ride. Together, we progress. Join us in
										crafting a space that embodies the spirit of action sports.
									</p>
								</div>
								<div className="col d-flex align-items-center justify-content-center">
									<Image
										src="/skaterKids.png"
										width={0}
										height={0}
										sizes="100vw"
										style={{ width: "100%", height: "auto" }} // optional
										alt="Kids skateboarding together"
										className="align-self-center"
									/>
								</div>
							</div>
						</div>
					</section>
				</main>

				<footer>
					<a href="https://weshuber.com" className={styles.linkTheme}>
						Made with love ♥
					</a>
					{/* <img src="/vercel.svg" alt="Vercel" className={styles.logo} /> */}
				</footer>

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
						font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
							DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
					}
				`}</style>

				<style jsx global>{`
					html,
					body {
						padding: 0;
						margin: 0;
						font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
							Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
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
