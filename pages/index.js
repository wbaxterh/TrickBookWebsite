import Head from "next/head";
import Slider from "react-slick";
import { Container, Typography, Box, Button, Grid } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { NextArrow, PrevArrow } from "../components/CustomArrow";

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
					<h1>The Encyclopedia of Action Sports</h1>
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
										<strong>The Encyclopedia of Action Sports</strong>
									</p>
								</div>
							</div>
						</div>
					</section> */}
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
			<section className={`${styles.featuresSection} py-5 px-md-5`}>
				<div className='row'>
					<Box className={`p-4 px-md-5 col-md-10`}>
						<Typography variant='h2' sx={{ fontWeight: 700 }}>
							Organizing action sports data.
						</Typography>
						<Typography
							variant='h5'
							className='pt-3 px-1'
							sx={{ fontWeight: 400 }}
						>
							By curating and parsing data using modern technology, we provide
							valuable insights to unlock your riding potential.
						</Typography>
					</Box>
				</div>
				<div className='row p-0 m-0'>
					<Grid container className='p-0 m-0'>
						<Grid item xs={12} md={6} className='p-0 px-md-5'>
							<Image
								src='/homegraphic3.png'
								width={500}
								height={634}
								className={styles.homegraphic}
								alt='Home Graphic'
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
							justifyContent='center'
							alignItems='center'
							container
							sx={{ alignItems: "center", justifyContent: "center" }}
						>
							<Box>
								<Typography
									variant='h4'
									sx={{ fontWeight: 500, alignSelf: "center" }}
								>
									Community driven knowledge base
								</Typography>
								<Typography variant='body1' className='ms-1 mt-2'>
									Users of the platform help to create and edit content, making
									the trick book a truly community driven project. Besides the
									personal trick list tool which you can choose to share
									publicly or keep your list private, we allow our user to edit
									certain aspects of the applciation such as our "Trickipedia".
									Our core values are community oriented and this tool is meant
									to help drive innovation and progression in action sports.
								</Typography>
								<Button
									variant='outlined'
									color='secondary'
									className={"ms-1 mt-2"}
								>
									Join the community
								</Button>
							</Box>
							<Box>
								<Typography
									variant='h4'
									sx={{ fontWeight: 500, alignSelf: "center" }}
								>
									Tools that unlock riding potential
								</Typography>
								<Typography variant='body1' className={"mt-2 ms-1"}>
									Tools like our original "Trick List" are designed to help you
									keep track of your own data. The "Trickipedia" feature serves
									as a source of truth for external data, and we will even offer
									video tutorials for tricks. With this extensive knowledgebase
									we are in a position to leverage the existing trick data along
									with your own data to give you personalized recommendations
									for tricks and learning paths.
								</Typography>
								<Button
									variant='outlined'
									color='secondary'
									className={"mt-2 ms-1"}
								>
									Explore our toolkit
								</Button>
							</Box>
						</Grid>
					</Grid>
				</div>
			</section>
			<section className={`${styles.appFeatureSection} py-5 px-md-5`}></section>
		</>
	);
}
