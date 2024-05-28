import { getAllPostIds, getPostData } from "../../lib/api";
import Head from "next/head";
import Link from "next/link";
import { Typography } from "@mui/material";
import styles from "../../styles/blog.module.css";

export default function Post({ postData }) {
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
			<div className={`container ${styles.postContainer}`}>
				<Typography variant='h1'>{postData.title}</Typography>
				<Typography variant='h5'>{postData.author}</Typography>
				<Typography variant='h5' className='mb-3'>
					{postData.date}
				</Typography>
				<div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
			</div>
		</>
	);
}

export async function getStaticPaths() {
	const paths = getAllPostIds();
	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params }) {
	const postData = await getPostData(params.slug);
	return {
		props: {
			postData,
		},
	};
}
