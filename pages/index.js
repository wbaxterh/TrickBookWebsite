import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useRef } from 'react';
import ControlHomepage from '../components/home/ControlHomepage';
import ProgressionHomepage from '../components/home/ProgressionHomepage';
import { setHomepageExperiment, trackHomepageExposure } from '../lib/analytics';
import nextI18NextConfig from '../next-i18next.config';

export default function Home({ homepage }) {
  const viewed = useRef(false);
  useEffect(() => {
    setHomepageExperiment(homepage);
    if (!viewed.current && homepage.mode === 'experiment') {
      trackHomepageExposure(homepage.variant);
      viewed.current = true;
    }
  }, [homepage]);

  return (
    <>
      {homepage.mode === 'preview' && (
        <aside
          aria-label="Homepage design preview"
          style={{
            padding: '18px 20px',
            background: '#e9e7df',
            color: '#171816',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            alignItems: 'center',
            fontSize: 13,
            borderBottom: '1px solid #b5b6a9',
          }}
        >
          <strong>Design preview</strong>
          <Link
            href="/?homepage=control"
            aria-current={homepage.variant === 'control' ? 'page' : undefined}
            style={{
              color: '#171816',
              textDecoration: 'underline',
              fontWeight: homepage.variant === 'control' ? 800 : 400,
            }}
          >
            A · Current homepage
          </Link>
          <Link
            href="/?homepage=progression"
            aria-current={homepage.variant === 'progression' ? 'page' : undefined}
            style={{
              color: '#171816',
              textDecoration: 'underline',
              fontWeight: homepage.variant === 'progression' ? 800 : 400,
            }}
          >
            B · Progression design
          </Link>
          <span style={{ marginLeft: 'auto', fontSize: 11 }}>
            Review only · Not a live experiment
          </span>
        </aside>
      )}
      {homepage.variant === 'progression' ? (
        <ProgressionHomepage />
      ) : (
        <ControlHomepage freezeHero={homepage.mode !== 'off'} />
      )}
      {homepage.mode === 'preview' && (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      )}
    </>
  );
}

export async function getServerSideProps({ req, res, query, locale }) {
  const { randomInt } = await import('node:crypto');
  const { chooseHomepage, COOKIE } = await import('../lib/homepageExperiment.cjs');
  const homepage = chooseHomepage({
    preview: process.env.NEXT_PUBLIC_HOMEPAGE_PREVIEW === 'true',
    enabled: process.env.HOMEPAGE_EXPERIMENT_ENABLED === 'true',
    locale,
    cookie: req.cookies[COOKIE],
    requested: query.homepage,
    bucket: randomInt(100),
    percentage: process.env.HOMEPAGE_PROGRESSION_PERCENT ?? 50,
  });
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (homepage.mode === 'preview') res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (homepage.setCookie) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${COOKIE}=${homepage.variant}; Path=/; Max-Age=7776000; HttpOnly; SameSite=Lax${secure}`,
    );
  }
  return {
    props: {
      homepage,
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'], nextI18NextConfig)),
    },
  };
}
