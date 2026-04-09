import { Button } from '@mui/material';
import { Copy, Facebook, Twitter } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import DataBlock from '../../components/blog/DataBlock';
import InsightCallout from '../../components/blog/InsightCallout';
import PostBody from '../../components/blog/PostBody';
import PostFooterCTA from '../../components/blog/PostFooterCTA';
import PostHero from '../../components/blog/PostHero';
import ResearchReferences from '../../components/blog/ResearchReferences';
import { getAdjacentPosts, getAllPostIds, getPostData } from '../../lib/api';
import styles from '../../styles/blog.module.css';

function getReadingTime(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return minutes;
}

function getDeck(content, fallbackDeck) {
  if (fallbackDeck) {
    return fallbackDeck;
  }

  const firstParagraphMatch = content.match(/<p>(.*?)<\/p>/i);
  if (!firstParagraphMatch?.[1]) {
    return null;
  }

  return firstParagraphMatch[1].replace(/<[^>]*>/g, '').trim() || null;
}

function stripHtml(value = '') {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function escapeHtmlAttribute(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function slugifyHeading(value, fallbackIndex) {
  const baseSlug = stripHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return baseSlug || `section-${fallbackIndex}`;
}

function getImageAltFallback({ title, explicitAlt, src, index, isHero = false }) {
  if (explicitAlt?.trim()) {
    return explicitAlt.trim();
  }

  if (src) {
    const fileName = src.split('/').pop()?.split('?')[0]?.replace(/\.[a-z0-9]+$/i, '');
    const normalizedName = fileName
      ?.replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalizedName) {
      return normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    }
  }

  if (isHero) {
    return `${title} hero image`;
  }

  return `${title} image ${index}`;
}

function normalizeArticleContent(content, title) {
  const headingCounts = new Map();
  const headings = [];
  let imageIndex = 0;

  const contentWithAnchors = content.replace(
    /<h([1-6])([^>]*)>(.*?)<\/h\1>|<img([^>]*)>/gi,
    (match, headingLevel, rawHeadingAttributes, innerHeadingHtml, rawImageAttributes) => {
      if (match.startsWith('<img')) {
        imageIndex += 1;
        const sourceMatch = rawImageAttributes.match(/\ssrc=["']([^"']+)["']/i);
        const altMatch = rawImageAttributes.match(/\salt=["']([^"']*)["']/i);
        const resolvedAlt = getImageAltFallback({
          title,
          explicitAlt: altMatch?.[1],
          src: sourceMatch?.[1],
          index: imageIndex,
        });
        const attributesWithoutAlt = rawImageAttributes.replace(/\salt=["'][^"']*["']/i, '');

        return `<img${attributesWithoutAlt} alt="${escapeHtmlAttribute(resolvedAlt)}" />`;
      }

      const normalizedLevel = Math.min(3, Math.max(2, Number(headingLevel)));
      const rawAttributes = rawHeadingAttributes || '';
      const innerHtml = innerHeadingHtml || '';
      const headingText = stripHtml(innerHtml);
      if (!headingText) {
        return match;
      }

      const existingIdMatch = rawAttributes.match(/\sid=["']([^"']+)["']/i);
      const baseId =
        existingIdMatch?.[1] || slugifyHeading(headingText, headings.length + 1);
      const instanceCount = headingCounts.get(baseId) || 0;
      const id = instanceCount === 0 ? baseId : `${baseId}-${instanceCount + 1}`;

      headingCounts.set(baseId, instanceCount + 1);
      headings.push({
        id,
        level: normalizedLevel,
        text: headingText,
      });

      const attributesWithoutId = rawAttributes.replace(/\sid=["'][^"']+["']/i, '');

      return `<h${normalizedLevel}${attributesWithoutId} id="${id}">${innerHtml}</h${normalizedLevel}>`;
    },
  );

  return { contentWithAnchors, headings };
}

function normalizeInsightCallout(postData) {
  const source = postData.insightCallout || postData.editorNote || postData.callout;
  if (!source) {
    return null;
  }

  if (typeof source === 'string') {
    return {
      title: 'Editor note',
      body: source,
      tone: 'info',
    };
  }

  if (!source.body && !source.title) {
    return null;
  }

  return {
    title: source.title || 'Editor note',
    body: source.body || '',
    tone: source.tone || 'info',
  };
}

function normalizeDataBlock(postData, readingTime) {
  const source = postData.dataBlock || postData.keyData;
  if (source?.items?.length) {
    return source;
  }

  if (Array.isArray(source) && source.length > 0) {
    return {
      title: 'At a glance',
      items: source,
    };
  }

  return {
    title: 'At a glance',
    description: 'A quick scan of this post before you dig into the full article.',
    items: [
      { label: 'Author', value: postData.author || 'TrickBook' },
      {
        label: 'Published',
        value: postData.date ? new Date(postData.date).toLocaleDateString() : 'Unknown',
      },
      { label: 'Read time', value: `${readingTime} min` },
    ],
  };
}

function normalizeReferences(postData) {
  const source = postData.researchReferences || postData.references;
  if (!Array.isArray(source) || source.length === 0) {
    return [];
  }

  return source.filter((reference) => reference?.title);
}

function normalizeFooterCta(postData) {
  return {
    eyebrow: postData.footerCta?.eyebrow || postData.cta?.eyebrow || 'Keep Progress Moving',
    title:
      postData.footerCta?.title ||
      postData.cta?.title ||
      'Build your next session plan with TrickBook.',
    body:
      postData.footerCta?.body ||
      postData.cta?.body ||
      'Track tricks, save ideas, and keep your progression organized between sessions.',
    primaryLabel:
      postData.footerCta?.primaryLabel || postData.cta?.primaryLabel || 'Browse more posts',
    primaryHref: postData.footerCta?.primaryHref || postData.cta?.primaryHref || '/blog',
    secondaryLabel:
      postData.footerCta?.secondaryLabel || postData.cta?.secondaryLabel || 'Open TrickBook',
    secondaryHref:
      postData.footerCta?.secondaryHref || postData.cta?.secondaryHref || '/trickbook',
  };
}

export default function BlogPost({ postData, adjacentPosts }) {
  const { title, author, date, content, images, deck: storedDeck, excerpt, description } = postData;
  const readingTime = getReadingTime(content);

  const replaceShortcodes = (content, images) => {
    return content.replace(/\[image(\d+)\]/g, (match, imageNumber) => {
      const index = Number.parseInt(imageNumber, 10) - 1;
      if (!images?.[index]) {
        return match;
      }

      const src = images[index];
      const alt = getImageAltFallback({
        title,
        src,
        index: index + 1,
      });

      return `<img src="${src}" alt="${escapeHtmlAttribute(alt)}" class="blog-image" />`;
    });
  };

  const contentWithImages = replaceShortcodes(content, images);
  const { contentWithAnchors, headings } = normalizeArticleContent(contentWithImages, title);
  const heroImage = images?.find((image) => image.includes('?hero=true')) || images?.[0];
  const heroImageAlt = getImageAltFallback({
    title,
    explicitAlt:
      postData.heroImageAlt ||
      postData.coverImageAlt ||
      postData.coverAlt ||
      postData.imageAlt,
    src: heroImage,
    index: 1,
    isHero: true,
  });
  const deck = getDeck(contentWithAnchors, storedDeck || excerpt || description);
  const insightCallout = normalizeInsightCallout(postData);
  const dataBlock = normalizeDataBlock(postData, readingTime);
  const references = normalizeReferences(postData);
  const footerCta = normalizeFooterCta(postData);

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
        <PostHero
          title={title}
          deck={deck}
          imageSrc={heroImage}
          imageAlt={heroImageAlt}
          author={author}
          date={date}
          readingTime={readingTime}
        />
      </div>
      <div className={styles.blogContent}>
        <div className={styles.postLayout}>
          <div className={styles.postLayoutMain}>
            <PostBody html={contentWithAnchors} measure="body" className={styles.postArticle} />

            {insightCallout ? (
              <div className={styles.editorialBlock}>
                <InsightCallout
                  title={insightCallout.title}
                  body={insightCallout.body}
                  tone={insightCallout.tone}
                />
              </div>
            ) : null}

            {dataBlock?.items?.length ? (
              <div className={styles.editorialBlock}>
                <DataBlock
                  title={dataBlock.title}
                  description={dataBlock.description}
                  items={dataBlock.items}
                />
              </div>
            ) : null}

            {references.length > 0 ? (
              <div className={styles.editorialBlock}>
                <ResearchReferences
                  description="Source material and reference points associated with this post."
                  references={references}
                />
              </div>
            ) : null}

            <div className={styles.postChrome}>
              <PostFooterCTA
                eyebrow={footerCta.eyebrow}
                title={footerCta.title}
                body={footerCta.body}
                primaryLabel={footerCta.primaryLabel}
                primaryHref={footerCta.primaryHref}
                secondaryLabel={footerCta.secondaryLabel}
                secondaryHref={footerCta.secondaryHref}
              />

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
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={styles.shareBtn}
                  aria-label="Copy link"
                >
                  <Copy size={16} />
                </button>
              </div>

              {adjacentPosts && (adjacentPosts.prev || adjacentPosts.next) && (
                <nav className={styles.postNav} aria-label="Post navigation">
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

              <div className={styles.postBackLinkWrap}>
                <Link href="/blog" className={styles.postBackLink}>
                  <Button variant="outlined" color={'secondary'}>
                    <span className="material-icons align-middle">arrow_back</span>
                    Back to blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {headings.length > 0 ? (
            <aside className={styles.postSidebar} aria-label="Table of contents">
              <div className={`${styles.postToc} ${styles.postTocSticky}`}>
                <div className={styles.postTocHeader}>
                  <p className={styles.postTocEyebrow}>Reading Guide</p>
                  <h2 className={styles.postTocTitle}>On this page</h2>
                </div>
                <ol className={styles.postTocList}>
                  {headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? styles.postTocLevel3 : ''}
                    >
                      <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          ) : null}
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
