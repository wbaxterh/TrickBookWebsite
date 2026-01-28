import Head from "next/head";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
	const docsDirectory = path.join(process.cwd(), "docs");
	const filenames = fs.readdirSync(docsDirectory);

	const docs = filenames
		.filter((filename) => filename.endsWith(".md"))
		.map((filename) => {
			const filePath = path.join(docsDirectory, filename);
			const content = fs.readFileSync(filePath, "utf8");

			// Extract title from first # heading
			const titleMatch = content.match(/^#\s+(.+)$/m);
			const title = titleMatch ? titleMatch[1] : filename.replace(".md", "");

			// Extract description from content after title
			const descMatch = content.match(/^#.+\n+(?:\*\*.+\*\*\n+)?(.+)/m);
			const description = descMatch
				? descMatch[1].substring(0, 150) + "..."
				: "";

			return {
				slug: filename.replace(".md", ""),
				title,
				description,
				filename,
			};
		});

	return {
		props: {
			docs,
		},
	};
}

export default function DocsIndex({ docs }) {
	return (
		<>
			<Head>
				<title>TrickBook - Documentation</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content="TrickBook technical documentation and development guides"
				/>
			</Head>

			<div className="container-fluid" style={{ background: "#121212", minHeight: "100vh" }}>
				<PageHeader title="Documentation" col="col-sm-4" />

				<div className="container py-5">
					<div className="row g-4">
						{docs.map((doc) => (
							<div key={doc.slug} className="col-md-6 col-lg-4">
								<Link
									href={`/docs/${doc.slug}`}
									style={{ textDecoration: "none" }}
								>
									<div
										style={{
											background: "#1E1E1E",
											borderRadius: "12px",
											padding: "24px",
											height: "100%",
											border: "1px solid #333",
											cursor: "pointer",
											transition: "all 0.2s ease",
										}}
										className="doc-card"
									>
										<h3
											style={{
												color: "#FFD700",
												fontSize: "1.25rem",
												marginBottom: "12px",
											}}
										>
											{doc.title}
										</h3>
										<p
											style={{
												color: "#A0A0A0",
												fontSize: "0.9rem",
												marginBottom: 0,
											}}
										>
											{doc.description}
										</p>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>

			<style jsx>{`
				.doc-card:hover {
					border-color: #ffd700 !important;
					transform: translateY(-2px);
					box-shadow: 0 4px 20px rgba(255, 215, 0, 0.15);
				}
			`}</style>
		</>
	);
}
