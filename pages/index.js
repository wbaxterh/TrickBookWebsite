import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Image from 'next/image';


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="The Trick Book - App Landing Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta name="author" content="Wes Huber" />
        <meta name="keywords" content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App" />
      </Head>

      <main>
        {/* <h1 className={styles.title}>
          The <a href="#">Trick Book</a>
        </h1> */}
        <Image
    className={styles.icon} src="/adaptive-icon.png" // Route of the image file
    height={250} // Desired size with correct aspect ratio
    width={250} // Desired size with correct aspect ratio
    alt="Trick Book"
  />
  <Image 
  src="Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
  width={224}
  height={76}
  className={styles.badge}
  />
        <p className={styles.description}>
        
          View Our <Link href="/privacy-policy">Privacy Policy</Link> <br/>
          <Link href="/questions-support">Questions & Support</Link>
        </p>
        

      </main>

      <footer>
        
      <a href="https://weshuber.com" className={styles.linkTheme}>Built by Wesley Huber</a>
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
  )
}
