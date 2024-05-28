import Link from "next/link";
import Head from "next/head";
import styles from "../styles/blog.module.css";
import Image from "next/image";
import { getSortedPostsData } from "../lib/api";
import { Typography, Button } from "@mui/material";
import BlogCard from "../components/BlogCard";
import PageHeader from "../components/PageHeader";
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
			<div class={`container-fluid ${styles.postContainer}`}>
				<PageHeader title='Blog' col='col-sm-2' />
				<div className={`row mt-4`}>
					{allPostsData.map(({ id, date, title, author, firstImage }) => (
						<div className='col-md-4 col-sm-12 mb-4' key={id}>
							<BlogCard
								id={id}
								firstImage={firstImage}
								title={title}
								date={date}
								author={author}
							/>
						</div>
					))}
				</div>
				<Link href='/'>
					<Button variant='outlined' color={"secondary"}>
						<span className='material-icons align-middle'>arrow_back</span>
						Back to home
					</Button>
				</Link>
			</div>
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
