import Link from "next/link";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import Layout from "../components/layout";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getSortedPostsData } from "../lib/api";
export default function Blog({ allPostsData }) {
	return (
		<>
			<Head>
				<title>The Trick Book - Blog</title>
				<link rel='icon' href='/favicon.png' />
				<meta name='description' content='The Trick Book - Blog' />
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
			<Layout>
				<h1 className='pt-3' style={{ textAlign: "left" }}>
					Blog
				</h1>
				<div className='row'>
					{allPostsData.map(({ id, date, title, author, firstImage }) => (
						<div className='col-md-4 col-sm-12 mb-4' key={id}>
							<div className='card'>
								<div style={{ position: "relative", height: "150px" }}>
									<Image
										src={"/" + firstImage}
										alt={`${title}`}
										layout='fill'
										objectFit='cover'
									/>
								</div>
								{/* <img
									src={firstImage} // Use the firstImage variable here
									alt={`${title}`}
									className='card-img-top'
								/> */}
								<div className='card-body'>
									<h5 className='card-title'>
										<Link href={`/blog/${id}`}>{title}</Link>
									</h5>
									<p className='card-text'>{date}</p>
									<p className='card-text'>By {author}</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<Link href='/'>
					<span className='material-icons align-middle pb-1'>arrow_back</span>
					Back to home
				</Link>
			</Layout>
			<Footer />
		</>
	);
}

export async function getStaticProps() {
	const allPostsData = getSortedPostsData();
	return {
		props: {
			allPostsData,
		},
	};
}
