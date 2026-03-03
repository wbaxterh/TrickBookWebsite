import { Button } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import BlogCard from '../components/BlogCard';
import { getSortedPostsData } from '../lib/api';
import styles from '../styles/blog.module.css';

export default function Blog({ allPostsData }) {
  const featuredPost = allPostsData[0];
  const remainingPosts = allPostsData.slice(1);
  const featuredHero =
    featuredPost?.images?.find((img) => img.includes('?hero=true')) || '/defaultBlogBG.png';

  return (
    <>
      <Head>
        <title>The Trick Book - Blog</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="The Trick Book Blog - Skateboarding tips, tricks, and community updates"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/blog" />
        <meta name="author" content="Wes Huber" />
        <meta
          name="keywords"
          content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App, Blog"
        />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The Trick Book - Blog" />
        <meta
          property="og:description"
          content="Skateboarding tips, tricks, and community updates"
        />
        <meta property="og:url" content="https://thetrickbook.com/blog" />
        <meta property="og:site_name" content="The Trick Book" />
      </Head>
      <div className={`container-fluid ${styles.postContainer}`}>
        {/* Blog header */}
        <div className={styles.blogHeader}>
          <h1 className={styles.blogHeaderTitle}>Blog</h1>
          <p className={styles.blogHeaderSub}>
            Tips, tricks, and updates from the TrickBook community
          </p>
        </div>

        {/* Featured post */}
        {featuredPost && (
          <div className="row mb-4">
            <div className="col-12">
              <Link href={`/blog/${featuredPost.url}`} style={{ textDecoration: 'none' }}>
                <div className={styles.featuredPost}>
                  <img
                    src={featuredHero}
                    alt={featuredPost.title}
                    className={styles.featuredImage}
                  />
                  <div className={styles.featuredOverlay}>
                    <span className={styles.featuredBadge}>Latest</span>
                    <div className={styles.featuredTitle}>{featuredPost.title}</div>
                    <div className={styles.featuredMeta}>
                      By {featuredPost.author} &middot;{' '}
                      {new Date(featuredPost.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Remaining posts grid */}
        {remainingPosts.length > 0 && (
          <div className={`row mt-2`}>
            {remainingPosts.map(({ id, date, title, author, url, images }) => (
              <div className="col-md-4 col-sm-12 mb-4" key={id}>
                <BlogCard
                  id={url}
                  firstImage={images?.find((image) => image.includes('?hero=true'))}
                  title={title}
                  date={date}
                  author={author}
                />
              </div>
            ))}
          </div>
        )}

        <Link href="/">
          <Button variant="outlined" color={'secondary'}>
            <span className="material-icons align-middle">arrow_back</span>
            Back to home
          </Button>
        </Link>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
    revalidate: 60,
  };
}
