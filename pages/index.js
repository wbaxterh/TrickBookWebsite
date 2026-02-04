import { useContext } from "react";
import Head from "next/head";
import Slider from "react-slick";
import { Container, Typography, Box, Button, Grid } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { NextArrow, PrevArrow } from "../components/CustomArrow";
import { AuthContext } from "../auth/AuthContext";

const settings = {
	dots: true,
	infinite: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
	speed: 500,
	autoplaySpeed: 7000,
	cssEase: "linear",
	pauseOnHover: true,
	// nextArrow: <NextArrow />,
	// prevArrow: <PrevArrow />,
};

export default function Home() {
	const { loggedIn } = useContext(AuthContext);

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
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App, The Trick Book, Action Sports App, Skateboarding App, Snowboarding App, Wakeboarding App, Trick Library, Trick Enyclopedia'
				/>
			</Head>
			<section className={styles.splashSection}>
				<div
					className={`d-block justify-content-center ${styles.splashHeader}`}
				>
					{/* <Image
								className={styles.icon}
								src='/adaptive-icon.png' // Route of the image file
								height={250} // Desired size with correct aspect ratio
								width={250} // Desired size with correct aspect ratio
								alt='Trick Book'
							/> */}
					<h1>The platform dedicated to Action Sports</h1>
					<div className='d-flex justify-content-center'>
						<a
							className={styles.centerImage}
							target='_blank'
							href='https://apps.apple.com/us/app/the-trick-book/id6446022788'
						>
							<Image
								src='Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg'
								width={224}
								height={76}
								className={styles.badge}
							/>
						</a>
					</div>
				</div>

				{/* <p className={styles.description}>
							<br />
							View Our <Link href='/privacy-policy'>Privacy Policy</Link> <br />
							<Link href='/questions-support'>Questions & Support</Link> 
						</p> */}
			</section>
			{/* <section className={styles.missionSection}>
						<div className='container'>
							<div className='row'>
								<div className='col'>
									<h2>About Trick Book</h2>
									<p>
										<strong>Welcome to the World of Action Sports</strong>
									</p>
								</div>
							</div>
						</div>
					</section> */}
			<section className={styles.newsFeedSection}>
				<Container>
					<Slider {...settings}>
						{/* Trickbook Slide */}
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								📘 Trickipedia
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								The ultimate trick encyclopedia for action sports. Browse thousands
								of tricks across skateboarding, snowboarding, surfing, and more.
								Track your personal progress, discover new tricks to learn, and
								get step-by-step tutorials to level up your skills.
							</Typography>
							<Button
								variant={"outlined"}
								color={"primary"}
								className={`btn ${styles.customPrimary} me-3`}
							>
								<Link href='/trickbook' className='text-dark'>
									Explore Tricks
								</Link>
							</Button>
							{!loggedIn && (
								<Button
									variant={"outlined"}
									color={"secondary"}
									disableRipple={true}
									sx={{
										borderColor: "#1E1E1E",
										color: "#1E1E1E",
										"&:hover": {
											backgroundColor: "transparent",
											borderColor: "#1E1E1E",
										},
									}}
								>
									<Link href='/signup' className='text-dark'>
										Become a Rider
									</Link>
								</Button>
							)}
						</Box>

						{/* Spots Slide */}
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								📍 Spots
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								Discover the best skate spots, snow parks, and surf breaks near you.
								Our community-driven spot database helps you find new places to ride,
								complete with photos, ratings, and directions. Share your favorite
								spots and help fellow riders explore.
							</Typography>
							<Button
								variant={"outlined"}
								color={"primary"}
								className={`btn ${styles.customPrimary} me-3`}
							>
								<Link href='/spots' className='text-dark'>
									Find Spots
								</Link>
							</Button>
							{!loggedIn && (
								<Button
									variant={"outlined"}
									color={"secondary"}
									disableRipple={true}
									sx={{
										borderColor: "#1E1E1E",
										color: "#1E1E1E",
										"&:hover": {
											backgroundColor: "transparent",
											borderColor: "#1E1E1E",
										},
									}}
								>
									<Link href='/signup' className='text-dark'>
										Become a Rider
									</Link>
								</Button>
							)}
						</Box>

						{/* Homies Slide */}
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								🤝 Homies
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								Connect with riders who share your passion. Build your crew,
								follow their progress, and stay motivated together. Send direct
								messages, share clips, and plan sessions with your homies.
								Action sports are better with friends.
							</Typography>
							{loggedIn ? (
								<Button
									variant={"outlined"}
									color={"primary"}
									className={`btn ${styles.customPrimary} me-3`}
								>
									<Link href='/homies' className='text-dark'>
										Find Homies
									</Link>
								</Button>
							) : (
								<Button
									variant={"outlined"}
									color={"primary"}
									className={`btn ${styles.customPrimary} me-3`}
								>
									<Link href='/signup' className='text-dark'>
										Become a Rider
									</Link>
								</Button>
							)}
						</Box>

						{/* Media Slide */}
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								🎬 Media
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								Watch and share action sports content. Browse The Couch for
								full-length films and edits, or scroll the Feed to see clips
								from the community. Post your own footage, react to your
								favorites, and get inspired by riders worldwide.
							</Typography>
							<Button
								variant={"outlined"}
								color={"primary"}
								className={`btn ${styles.customPrimary} me-3`}
							>
								<Link href='/media' className='text-dark'>
									Watch Now
								</Link>
							</Button>
							{!loggedIn && (
								<Button
									variant={"outlined"}
									color={"secondary"}
									disableRipple={true}
									sx={{
										borderColor: "#1E1E1E",
										color: "#1E1E1E",
										"&:hover": {
											backgroundColor: "transparent",
											borderColor: "#1E1E1E",
										},
									}}
								>
									<Link href='/signup' className='text-dark'>
										Become a Rider
									</Link>
								</Button>
							)}
						</Box>
					</Slider>
				</Container>
			</section>

			{/* OLD SLIDER CONTENT - COMMENTED OUT
			<section className={styles.newsFeedSection}>
				<Container>
					<Slider {...settings}>
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								We've created a new vision
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								And with that, big things are coming. We are going to create
								something even more useful than our "Trick List" tool. You might
								have noticed the website getting a makeover, new features are
								coming to both the app and the website in the near future. Stay
								tuned for updates by signing up for an account and checking the
								box to join our mailing list. If you already have an account you
								can opt-in to the mailing list in your profile
							</Typography>
							<Button
								variant={"outlined"}
								color={"primary"}
								className={`btn ${styles.customPrimary} me-3`}
								sx={{}}
							>
								<Link href='/signup' className='text-dark'>
									Register an Account
								</Link>
							</Button>
							<Button
								variant={"outlined"}
								color={"secondary"}
								disableRipple={true}
								sx={{
									borderColor: "#1E1E1E",
									color: "#1E1E1E",
									"&:hover": {
										backgroundColor: "transparent",
										borderColor: "#1E1E1E",
									},
								}}
							>
								<Link href='about' className='text-dark'>
									Read More
								</Link>
							</Button>
						</Box>
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								Trick Book on Google Play
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								We've heard the requests for the app to get on google play and
								we are putting in work to make it happen this week. Stay tuned
								for a big update on all things "The Trick Book" by go skate day.
							</Typography>
						</Box>
						<Box className={`py-4 ${styles.slide}`}>
							<Typography variant='h2' sx={{ fontWeight: 500 }}>
								We've launched on the App Store
							</Typography>
							<Typography className='mb-3 mt-2 px-1'>
								The Trick Book app is available on the app store. It was a few
								years in the making, a few different versions and codebases to
								create the tricklist. We are happy with how we've architected
								this app and it's only going to get better from here. Thanks
								everyone whose tried the app, don't forget to give us some
								feedback or kindly leave a review on the app store. We look
								forward to shipping more useful features and helping you make
								the most out of your time riding!
							</Typography>
							<Button
								variant={"outlined"}
								color={"primary"}
								className={`btn ${styles.customPrimary} me-3`}
								sx={{}}
							>
								<a
									href='https://apps.apple.com/us/app/the-trick-book/id6446022788'
									className='text-dark'
									target='_blank'
								>
									Trick Book on the App Store
								</a>
							</Button>
						</Box>
					</Slider>
				</Container>
			</section>
			*/}
			<section className={`${styles.featuresSection} py-5 px-md-5`}>
				<div className='row'>
					<Box className={`p-4 px-md-5 col-md-10`}>
						<Typography variant='h2' sx={{ fontWeight: 700 }}>
							By Riders. For Riders.
						</Typography>
						<Typography
							variant='h5'
							className='pt-3 px-1'
							sx={{ fontWeight: 400 }}
						>
							The community is the product, not your data and attention. We're building something
							we control, together.
						</Typography>
					</Box>
				</div>
				<div className='row p-0 m-0'>
					<Grid container className='p-0 m-0'>
						<Grid item xs={12} md={6} className='p-0 px-md-5' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<Image
								src='/trickBookScreenShotNoBg.png'
								width={300}
								height={600}
								className={styles.homegraphic}
								alt='TrickBook App Screenshot'
								style={{
									minWidth: 200,
									width: "100%",
									maxWidth: 300,
									height: "auto",
								}}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
							justifyContent='center'
							alignItems='center'
							container
							sx={{ alignItems: "center", justifyContent: "center", mt: { xs: 5, md: 0 } }}
						>
							<Box sx={{ mb: { xs: 5, md: 3 }, px: { xs: 3, md: 0 } }}>
								<Typography
									variant='h4'
									sx={{ fontWeight: 500, alignSelf: "center" }}
								>
									Take back your community
								</Typography>
								<Typography variant='body1' className='ms-1 mt-2'>
									Big tech platforms don't have our best interests at heart, they have shareholders.
									Algorithms bury your content unless you pay, and your attention is sold to advertisers.
									We built TrickBook because action sports communities deserve better. Your data is encrypted,
									your privacy is protected, and you own your content.
								</Typography>
								<Button
									variant='outlined'
									color='secondary'
									className={"ms-1 mt-3"}
								>
									<Link href='/privacy-policy' className='text-dark'>
										Our Privacy Promise
									</Link>
								</Button>
							</Box>
							<Box sx={{ mt: { xs: 4, md: 2 }, px: { xs: 3, md: 0 } }}>
								<Typography
									variant='h4'
									sx={{ fontWeight: 500, alignSelf: "center" }}
								>
									Built to empower, not exploit
								</Typography>
								<Typography variant='body1' className={"mt-2 ms-1"}>
									It's never been easier for communities to build their own tools.
									Why continue to feed corporations when we have the power to create something great together?
									TrickBook is a platform where riders connect, progress, and share, without being
									the product. Join the movement and help shape the future of action sports.
								</Typography>
								<Button
									variant='outlined'
									color='secondary'
									className={"mt-3 ms-1"}
								>
									<Link href='/blog/trickbook-just-went-social---heres-why' className='text-dark'>
										Read the Manifesto
									</Link>
								</Button>
							</Box>
						</Grid>
					</Grid>
				</div>
			</section>
			<section className={`${styles.appFeatureSection} py-5 px-md-2`}>
				<div className={styles.rodneyQuoteSection}>
					<blockquote className={styles.rodneyQuote}>
						“There's an intrinsic value in creating something for the sake of
						creating it.”
					</blockquote>
					<div className={styles.rodneyAttribution}>– Rodney Mullen</div>
				</div>
			</section>
		</>
	);
}
