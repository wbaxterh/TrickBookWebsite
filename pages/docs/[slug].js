import fs from 'fs';
import { marked } from 'marked';
import Head from 'next/head';
import Link from 'next/link';
import path from 'path';

export async function getStaticPaths() {
  const docsDirectory = path.join(process.cwd(), 'docs');
  const filenames = fs.readdirSync(docsDirectory);

  const paths = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => ({
      params: {
        slug: filename.replace('.md', ''),
      },
    }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const docsDirectory = path.join(process.cwd(), 'docs');
  const filePath = path.join(docsDirectory, `${params.slug}.md`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : params.slug;

  // Convert markdown to HTML
  const htmlContent = marked(content);

  return {
    props: {
      title,
      content: htmlContent,
      slug: params.slug,
    },
  };
}

export default function DocPage({ title, content, slug }) {
  return (
    <>
      <Head>
        <title>{title} - TrickBook Docs</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={`${title} - TrickBook Documentation`} />
      </Head>

      <div
        style={{
          background: '#121212',
          minHeight: '100vh',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#1E1E1E',
            borderBottom: '1px solid #333',
            padding: '16px 0',
          }}
        >
          <div className="container">
            <Link
              href="/docs"
              style={{
                color: '#FFD700',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              ← Back to Docs
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="container py-5">
          <article className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>

      <style jsx global>{`
				.markdown-content {
					max-width: 900px;
					margin: 0 auto;
					line-height: 1.7;
				}

				.markdown-content h1 {
					color: #ffd700;
					font-size: 2.5rem;
					margin-bottom: 1.5rem;
					padding-bottom: 1rem;
					border-bottom: 2px solid #333;
				}

				.markdown-content h2 {
					color: #ffd700;
					font-size: 1.75rem;
					margin-top: 3rem;
					margin-bottom: 1rem;
					padding-bottom: 0.5rem;
					border-bottom: 1px solid #333;
				}

				.markdown-content h3 {
					color: #ffffff;
					font-size: 1.35rem;
					margin-top: 2rem;
					margin-bottom: 0.75rem;
				}

				.markdown-content h4 {
					color: #a0a0a0;
					font-size: 1.1rem;
					margin-top: 1.5rem;
					margin-bottom: 0.5rem;
				}

				.markdown-content p {
					color: #e0e0e0;
					margin-bottom: 1rem;
				}

				.markdown-content strong {
					color: #ffffff;
				}

				.markdown-content a {
					color: #ffd700;
					text-decoration: none;
				}

				.markdown-content a:hover {
					text-decoration: underline;
				}

				.markdown-content code {
					background: #2c2c2c;
					color: #ffd700;
					padding: 2px 6px;
					border-radius: 4px;
					font-size: 0.9em;
				}

				.markdown-content pre {
					background: #1e1e1e;
					border: 1px solid #333;
					border-radius: 8px;
					padding: 16px;
					overflow-x: auto;
					margin: 1.5rem 0;
				}

				.markdown-content pre code {
					background: transparent;
					padding: 0;
					color: #e0e0e0;
					font-size: 0.85rem;
					line-height: 1.5;
				}

				.markdown-content ul,
				.markdown-content ol {
					color: #e0e0e0;
					margin-bottom: 1rem;
					padding-left: 1.5rem;
				}

				.markdown-content li {
					margin-bottom: 0.5rem;
				}

				.markdown-content table {
					width: 100%;
					border-collapse: collapse;
					margin: 1.5rem 0;
				}

				.markdown-content th {
					background: #2c2c2c;
					color: #ffd700;
					padding: 12px;
					text-align: left;
					border: 1px solid #333;
					font-weight: 600;
				}

				.markdown-content td {
					padding: 12px;
					border: 1px solid #333;
					color: #e0e0e0;
				}

				.markdown-content tr:nth-child(even) {
					background: #1a1a1a;
				}

				.markdown-content blockquote {
					border-left: 4px solid #ffd700;
					margin: 1.5rem 0;
					padding: 1rem 1.5rem;
					background: #1a1a1a;
					border-radius: 0 8px 8px 0;
				}

				.markdown-content blockquote p {
					margin: 0;
					color: #a0a0a0;
				}

				.markdown-content hr {
					border: none;
					border-top: 1px solid #333;
					margin: 2rem 0;
				}

				.markdown-content img {
					max-width: 100%;
					border-radius: 8px;
				}

				/* Checkbox styling for task lists */
				.markdown-content input[type="checkbox"] {
					margin-right: 8px;
				}
			`}</style>
    </>
  );
}
