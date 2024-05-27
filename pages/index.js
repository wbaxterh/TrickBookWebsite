import Head from "next/head";
import Slider from "react-slick";
import { Container, Typography, Box } from "@mui/material";
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
	autoplaySpeed: 3000,
	cssEase: "linear",
	pauseOnHover: true,
	nextArrow: <NextArrow />,
	prevArrow: <PrevArrow />,
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
						<Link
							className={styles.centerImage}
							href='https://apps.apple.com/us/app/the-trick-book/id6446022788'
						>
							<Image
								src='Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg'
								width={224}
								height={76}
								className={styles.badge}
							/>
						</Link>
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
						<Box className={styles.slide}>
							<Typography variant='h2'>Latest News 1</Typography>
							<Typography>Content for the first slide.</Typography>
						</Box>
						<Box className={styles.slide}>
							<Typography variant='h2'>Latest News 2</Typography>
							<Typography>Content for the second slide.</Typography>
						</Box>
						<Box className={styles.slide}>
							<Typography variant='h2'>Latest News 3</Typography>
							<Typography>Content for the third slide.</Typography>
						</Box>
						<Box className={styles.slide}>
							<Typography variant='h2'>Latest News 4</Typography>
							<Typography>Content for the fourth slide.</Typography>
						</Box>
						<Box className={styles.slide}>
							<Typography variant='h2'>Latest News 5</Typography>
							<Typography>Content for the fifth slide.</Typography>
						</Box>
					</Slider>
				</Container>
			</section>
		</>
	);
}
