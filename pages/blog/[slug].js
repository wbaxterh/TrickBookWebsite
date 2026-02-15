import { Button } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { getAllPostIds, getPostData } from '../../lib/api';
import styles from '../../styles/blog.module.css';

export default function BlogPost({ postData }) {
  const { title, author, date, content, images } = postData;

  // Function to replace shortcodes with actual image tags
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

  // Find and set the hero image
  const heroImage = images?.find((image) => image.includes('?hero=true'));
  const _otherImages = images?.filter((image) => !image.includes('?hero=true'));

  return (
    <>
      <Head>
        <title>{title} - The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://thetrickbook.com/blog/${postData.slug}`} />
        <meta name="author" content={author} />
        <meta
          name="keywords"
          content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
        />
      </Head>
      <div className={`container-fluid ${styles.postContainer}`}>
        <PageHeader title={title} col="col-sm" heroImage={heroImage} author={author} date={date} />
      </div>
      <div className="container mx-2 mb-4">
        <div className="row">
          <div className="col-12">
            <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
          </div>
        </div>
        <Link href="/blog">
          <Button variant="outlined" color={'secondary'}>
            <span className="material-icons align-middle">arrow_back</span>
            Back to blog
          </Button>
        </Link>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = await getAllPostIds();
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
