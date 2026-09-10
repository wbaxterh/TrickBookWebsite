import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { trackAppStoreClick, trackCtaClick, trackHomepageDemo } from '../../lib/analytics';
import styles from './ProgressionHomepage.module.css';

const SPORTS = {
  Skateboarding: ['Ollie', 'Pop shove-it', 'Kickflip'],
  Snowboarding: ['Straight air', 'Indy grab', 'Frontside 180'],
  BMX: ['Bunny hop', 'Manual', '180'],
};

export default function ProgressionHomepage() {
  const { loggedIn } = useContext(AuthContext);
  const [sport, setSport] = useState('Skateboarding');
  const [landed, setLanded] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  // Temporary design reference; publication permission is pending.
  const referencePhoto = process.env.NEXT_PUBLIC_HOMEPAGE_PREVIEW === 'true';
  const signupHref = loggedIn ? '/trickbook' : '/signup';
  const signupLabel = loggedIn ? 'Open my TrickBook' : 'Start my TrickBook';

  function changeSport(nextSport) {
    setSport(nextSport);
    setLanded(false);
    trackHomepageDemo('sport_selected', nextSport);
  }

  function toggleTrick() {
    setLanded(!landed);
    setHasTried(true);
    trackHomepageDemo(landed ? 'demo_reset' : 'demo_landed', sport);
  }

  return (
    <div className={styles.page} data-homepage-variant="progression">
      <Head>
        <title>TrickBook — Make your next session count.</title>
        <meta
          name="description"
          content="Your action sports progression book. Save tricks to learn, track your makes, and find your next spot. Explore TrickBook on web, iOS and Android."
        />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta property="og:title" content="TrickBook — Make your next session count." />
        <meta
          property="og:description"
          content="The next trick. The next spot. Your kind of people. Start your progression with TrickBook."
        />
        <meta property="og:image" content="https://thetrickbook.com/skaterKids.png" />
      </Head>

      <section className={styles.hero} aria-labelledby="progression-heading">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} /> FOR THE LOVE OF THE SESSION
          </p>
          <h1 id="progression-heading">
            MAKE YOUR
            <br />
            NEXT SESSION
            <br />
            <span>COUNT.</span>
            <span className={styles.asterisk} aria-hidden="true">
              ✳
            </span>
          </h1>
          <p className={styles.intro}>Your tricks. Your progress. All in one place.</p>
          <p className={styles.description}>
            Save the tricks you want to learn, keep track of your makes, and find your next spot.
            This is your TrickBook.
          </p>
          <div className={styles.actions}>
            <Link
              href={signupHref}
              className={styles.primary}
              onClick={() => trackCtaClick('start_my_trickbook', 'progression_hero')}
            >
              {signupLabel}
              <ArrowUpRight size={20} />
            </Link>
            <a
              href="#try-it"
              className={styles.secondary}
              onClick={() => trackCtaClick('try_demo', 'progression_hero')}
            >
              Try it below <ArrowDown size={17} />
            </a>
          </div>
          <p className={styles.micro}>Free to get started. On web, iOS & Android.</p>
        </div>
        <div className={styles.heroVisual}>
          <Image
            src={
              referencePhoto
                ? 'https://images.squarespace-cdn.com/content/v1/6635038c12480337a0908f81/7f3b229e-2337-4af1-b0df-6ab72fcaa326/VeniceSkatePark-12.jpg?format=1500w'
                : '/skaterKids.png'
            }
            unoptimized={referencePhoto}
            alt={
              referencePhoto
                ? 'Riders sharing a session at Venice Skatepark, photographed by Kris Pounds'
                : 'Friends hanging out at a skatepark'
            }
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
            className={styles.heroImage}
          />
          {referencePhoto && (
            <a
              className={styles.photoCredit}
              href="https://www.krispounds.com/stories/venice-skate-park"
              target="_blank"
              rel="noreferrer"
            >
              Venice Skatepark | Photo: Kris Pounds
            </a>
          )}
        </div>
      </section>

      <section className={styles.sportStrip} aria-label="Supported sports">
        {['SKATE', 'SNOW', 'BMX', 'SURF', 'SKI', 'MTB', 'SCOOTER', 'INLINE', 'WAKE'].map((name) => (
          <span key={name}>
            {name}
            <span aria-hidden="true">✳</span>
          </span>
        ))}
      </section>

      <section id="try-it" className={styles.demoSection} aria-labelledby="demo-heading">
        <div className={styles.demoCopy}>
          <p className={styles.eyebrow}>01 / YOUR PROGRESSION, ON PAPER. SORT OF.</p>
          <h2 id="demo-heading">
            FROM “ONE DAY”
            <br />
            TO <span>“LANDED IT.”</span>
          </h2>
          <p>
            That trick you've been thinking about all week? Give it a home. Build a list, put in the
            sessions, and watch your progress add up.
          </p>
          <a href="#demo-list" className={styles.textLink}>
            Go on. Check one off. <ArrowRight size={20} />
          </a>
          <div className={styles.demoNotes}>
            <BookOpen size={23} />
            <p>
              <strong>A little direction goes a long way.</strong>
              <br />
              Explore tutorials, the tricks to learn first, and what to try next in the Trickipedia.
            </p>
          </div>
          <Link
            href="/trickbook"
            className={styles.textLink}
            onClick={() => trackCtaClick('explore_tricks', 'progression_demo')}
          >
            Explore the Trickipedia <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className={styles.notebook} id="demo-list">
          <div className={styles.bookTop}>
            <span>MY NEXT SESSION</span>
            <span className={styles.example}>INTERACTIVE EXAMPLE</span>
          </div>
          <fieldset className={styles.tabs} aria-label="Example sport">
            {Object.keys(SPORTS).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={sport === name}
                onClick={() => changeSport(name)}
              >
                {name}
              </button>
            ))}
          </fieldset>
          <div className={styles.listHeading}>
            <h3>
              {sport === 'Skateboarding'
                ? 'A little better every session.'
                : sport === 'Snowboarding'
                  ? 'Make the next lap yours.'
                  : 'One more try. One more make.'}
            </h3>
            <span>{landed ? '2' : '1'} / 3 landed</span>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: landed ? '66.67%' : '33.33%' }} />
          </div>
          <div className={styles.trickRow}>
            <span className={styles.checked}>
              <Check size={17} />
            </span>
            <strong>{SPORTS[sport][0]}</strong>
            <span className={styles.status}>LANDED</span>
          </div>
          <button
            type="button"
            className={`${styles.trickRow} ${styles.interactiveRow}`}
            onClick={toggleTrick}
            aria-pressed={landed}
            aria-label={`${landed ? 'Reset' : 'Mark'} ${SPORTS[sport][1]}${landed ? '' : ' as landed'}`}
          >
            <span className={landed ? styles.checked : styles.unchecked}>
              {landed && <Check size={17} />}
            </span>
            <strong>{SPORTS[sport][1]}</strong>
            <span className={styles.status}>{landed ? 'LANDED!' : 'WORKING ON IT'}</span>
          </button>
          <div className={styles.trickRow}>
            <span className={styles.unchecked} />
            <strong>{SPORTS[sport][2]}</strong>
            <span className={styles.nextStatus}>UP NEXT</span>
          </div>
          <output className={styles.demoFeedback} aria-live="polite">
            {landed
              ? 'Yes! That’s one more in the book. ✳'
              : hasTried
                ? 'Every make starts with another try.'
                : 'Tap the middle trick to feel the progress.'}
          </output>
          <Link
            href={signupHref}
            className={styles.bookCta}
            onClick={() => trackCtaClick('create_my_own_list', 'progression_demo')}
          >
            <Plus size={18} />
            {loggedIn ? 'Open my real lists' : 'Create my own trick list'}
            <ArrowUpRight size={18} />
          </Link>
          <p className={styles.exampleNote}>Just a sample. Your example changes aren't saved.</p>
        </div>
      </section>

      <section className={styles.exploreSection} aria-labelledby="explore-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>02 / TAKE IT OUTSIDE</p>
            <h2 id="explore-heading">
              A GOOD SESSION
              <br />
              STARTS <span>SOMEWHERE.</span>
            </h2>
          </div>
          <p>
            Find a place to ride.
            <br />
            Find something to work on.
            <br />
            Find your kind of people.
          </p>
        </div>
        <div className={styles.exploreGrid}>
          <Link
            href="/spots"
            className={`${styles.exploreCard} ${styles.spotsCard}`}
            onClick={() => trackCtaClick('find_spots', 'progression_explore')}
          >
            <div className={styles.mapArt} aria-hidden="true">
              <span className={styles.mapRoadOne} />
              <span className={styles.mapRoadTwo} />
              <span className={styles.mapWater} />
              <MapPin className={styles.pinOne} size={44} fill="currentColor" />
              <MapPin className={styles.pinTwo} size={31} fill="currentColor" />
              <span className={styles.mapLabel}>YOUR NEXT SESSION ↗</span>
            </div>
            <div className={styles.cardCopy}>
              <span className={styles.cardNumber}>FIND YOUR SPOT</span>
              <h3>A new favorite is out there.</h3>
              <p>Explore parks, street spots, resorts and more.</p>
              <span className={styles.cardAction}>
                Explore spots <ArrowUpRight size={22} />
              </span>
            </div>
          </Link>
          <Link
            href="/media"
            className={`${styles.exploreCard} ${styles.crewCard}`}
            onClick={() => trackCtaClick('explore_media', 'progression_explore')}
          >
            <Image
              src="/skaterKids.png"
              alt="A group of friends spending a session together at the park"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className={styles.crewShade} />
            <div className={styles.cardCopy}>
              <span className={styles.cardNumber}>KEEP THE STOKE GOING</span>
              <h3>Good riding is contagious.</h3>
              <p>Get inspired by films and clips from the community.</p>
              <span className={styles.cardAction}>
                Find your inspiration <ArrowUpRight size={22} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.builtSection} aria-labelledby="built-heading">
        <p className={styles.eyebrow}>03 / A TOOL WITH A LITTLE SOUL</p>
        <h2 id="built-heading">
          BUILT BY A RIDER.
          <br />
          <span>FOR THE REST OF US.</span>
        </h2>
        <p>
          TrickBook started with a simple idea: there had to be a better place for trick ideas than
          a notes app. A place to stay motivated, remember the makes, and keep coming back for one
          more try.
        </p>
        <Link href="/about" className={styles.textLink}>
          Meet the story behind TrickBook <ArrowUpRight size={19} />
        </Link>
        <div className={styles.smallFeatures}>
          <span>
            <BookOpen size={18} />
            Your own progression
          </span>
          <span>
            <Users size={18} />A place for your crew
          </span>
          <Link href="/signup" onClick={() => trackCtaClick('meet_kaori', 'progression_support')}>
            <Sparkles size={18} />
            Snowboard with Kaori <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="final-heading">
        <p className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS WITH A SESSION.</p>
        <h2 id="final-heading">
          GO GET
          <br />
          <span>THAT TRICK.</span>
        </h2>
        <Link
          href={signupHref}
          className={styles.darkCta}
          onClick={() => trackCtaClick('start_my_trickbook', 'progression_final')}
        >
          {signupLabel}
          <ArrowUpRight size={22} />
        </Link>
        <p>Start on the web, or take TrickBook with you.</p>
        <div className={styles.storeLinks}>
          <a
            href="https://apps.apple.com/us/app/the-trick-book/id6446022788"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAppStoreClick('ios', 'progression_final')}
          >
            <Image
              src="/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
              width={140}
              height={47}
              alt="Download on the App Store"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.thetrickbook.trickbook"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAppStoreClick('android', 'progression_final')}
          >
            <Image
              src="/google-play-badge.svg"
              width={157}
              height={47}
              alt="Get it on Google Play"
            />
          </a>
        </div>
      </section>
    </div>
  );
}
