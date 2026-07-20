import { Typography } from '@mui/material';
import Head from 'next/head';
import PageHeader from '../components/PageHeader';
import styles from '../styles/about.module.css';

export default function About() {
  return (
    <>
      <Head>
        <title>The Trick Book - About Us</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="The Trick Book - About Us" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta name="author" content="Wes Huber" />
        <meta
          name="keywords"
          content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
        />
      </Head>
      <div className={`container-fluid ${styles.aboutContainer}`}>
        <PageHeader title="About Us" col="col-sm-4" />
        <section className={`my-5 p-5 ${styles.missionStatement}`}>
          <Typography variant="h2">Our Mission</Typography>
          <Typography variant="h5">
            We want to help make the world more fun. To offer valuable information that can help
            bring the joy of riding to more people across the world.
          </Typography>
        </section>
        <section className={`m-5 ${styles.aboutUs}`}>
          <Typography variant="h2" className="my-2">
            Our Story
          </Typography>
          <Typography variant="body1" className="my-4">
            Hey, thanks for checking out the Trick Book! I’ve made this originally as a tool to keep
            track of my tricks for action sports and other hobbies in a place that was outside my
            notes app. Somewhere I could keep everything organized, keep myself accountable, and
            remember the trick ideas I had. That was a few years ago, since then I’ve had a bigger
            vision for this platform.
          </Typography>
          <Typography variant="body1" className="my-4">
            I believe that any big idea, if it’s going to last - it needs to be built on a strong
            foundation of values. These are the values that the Trick Book embodies:
          </Typography>
          <Typography variant="body1" className="my-4">
            <ul>
              <li>Giving back to community</li>
              <li>Never giving up</li>
              <li>Respect gets Respect</li>
              <li>Constant improvement</li>
              <li>Mastery</li>
              <li>Humbleness</li>
            </ul>
          </Typography>
          <Typography variant="body1" className="my-4">
            If you’re into action sports I’m sure that some of these values resonate with you. With
            all of that being said, let’s continue to unveil the bigger vision for The Trick Book.
          </Typography>
          <Typography variant="body1" className="my-4">
            More than just a tool for listing tricks, The Trick Book is setting out to be a
            directory of tricks and a historical reference. Sort of like a Wikipedia for action
            sports. We’re on a mission to collect data about each trick from each of the major
            disciplines like Skateboarding, Surfing, BMX, Snowboarding, Wakeboarding, Rollerblading,
            Scootering, Mountain Biking and more. We’ll start creating a “Trick Wiki” on our website
            which will provide details and history about the trick, links to the trick being done,
            and some popular tutorial videos for each trick. Once we have established a good data
            set of tricks on our website, we will release the Trick Wiki into our mobile app as
            well.
          </Typography>
          <Typography variant="body1" className="my-4">
            The Trick Book will also set out on its own journey, through myself and my network of
            peers in action sports, to produce original tutorials for tricks. We may release a
            number of these tutorials for free, but this will likely end up being a paid access
            feature. Time is money people! One thing I do want to establish, is that while we will
            offer a subscription type service or some paid features, we will also always maintain a
            lot of our information free for public use.
          </Typography>
          <Typography variant="body1" className="my-4">
            I also want to emphasize that this platform will only start to gain momentum from active
            users. I am only one person, I can’t document every detail about every trick myself.
            That’s why we’re going for a more “Wikipedia” like approach. The Trick Wiki will be a
            community maintained ecosystem. Active users are the ones who are going to fuel the
            momentum of the Trick Book in the long run.
          </Typography>
          <Typography variant="body1" className="my-4">
            Thank you for taking the time to check out The Trick Book, my name is Wes Huber. If you
            have any questions, suggestions, or if you want to get in touch please reach out to
            info@thetrickbook.com or fill out our Contact Form. We’ll get back to you!
          </Typography>
          <Typography variant="body1" className="my-4">
            Peace ✌️
          </Typography>
        </section>
      </div>
    </>
  );
}
