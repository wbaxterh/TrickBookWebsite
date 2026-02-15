import { Button } from '@mui/material';
import { Copy, Facebook, Twitter } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { getAdjacentPosts, getAllPostIds, getPostData } from '../../lib/api';
import styles from '../../styles/blog.module.css';

function getReadingTime(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return minutes;
}

export default function BlogPost({ postData, adjacentPosts }) {
  const { title, author, date, content, images } = postData;
  const readingTime = getReadingTime(content);

  const replaceShortcodes = (content, images) => {
    return content.replace(/\[image(\d+)\]/g, (match, p1) => {
      const index = parseInt(p1, 10) - 1;
      if (images?.[index]) {
        return `<img src="${images[index]}" alt="Image ${index + 1}" class="blog-image" />`;
      }
      return match;
    });
  };

  const contentWithImages = replaceShortcodes(content, images);

  const heroImage = images?.find((image) => image.includes('?hero=true'));

  const pageUrl = `https://thetrickbook.com/blog/${postData.slug}`;
  const ogImage = heroImage || '/defaultBlogBG.png';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
  };

  return (
    <>
      <Head>
        <title>{title} - The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={`${title} - by ${author}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content={author} />
        <meta
          name="keywords"
          content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
        />

        {/* OpenGraph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`${title} - by ${author}`} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="The Trick Book" />
        <meta property="article:author" content={author} />
        <meta property="article:published_time" content={date} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={`${title} - by ${author}`} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <div className={`container-fluid ${styles.postContainer}`}>
        <PageHeader
          title={title}
          col="col-sm"
          heroImage={heroImage}
          author={author}
          date={date}
          readingTime={readingTime}
        />
      </div>
      <div className={styles.blogContent}>
        <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />

        {/* Share section */}
        <div className={styles.shareSection}>
          <span className={styles.shareLabel}>Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareBtn}
            aria-label="Share on X"
          >
            <Twitter size={16} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareBtn}
            aria-label="Share on Facebook"
          >
            <Facebook size={16} />
          </a>
          <button onClick={handleCopyLink} className={styles.shareBtn} aria-label="Copy link">
            <Copy size={16} />
          </button>
        </div>

        {/* Previous / Next navigation */}
        {adjacentPosts && (adjacentPosts.prev || adjacentPosts.next) && (
          <nav className={styles.postNav}>
            {adjacentPosts.prev ? (
              <Link href={`/blog/${adjacentPosts.prev.url}`} className={styles.postNavLink}>
                <div className={styles.postNavLabel}>Previous</div>
                <div className={styles.postNavTitle}>{adjacentPosts.prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {adjacentPosts.next ? (
              <Link
                href={`/blog/${adjacentPosts.next.url}`}
                className={`${styles.postNavLink} ${styles.postNavNext}`}
              >
                <div className={styles.postNavLabel}>Next</div>
                <div className={styles.postNavTitle}>{adjacentPosts.next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/blog">
            <Button variant="outlined" color={'secondary'}>
              <span className="material-icons align-middle">arrow_back</span>
              Back to blog
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = await getAllPostIds();
  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  if (!postData) {
    return { notFound: true };
  }
  const adjacentPosts = await getAdjacentPosts(params.slug);
  return {
    props: {
      postData,
      adjacentPosts,
    },
    revalidate: 60,
  };
}
