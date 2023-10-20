import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
	// Get file names under /posts
	const fileNames = fs.readdirSync(postsDirectory);
	const allPostsData = fileNames.map((fileName) => {
		// Remove ".md" from file name to get id
		const id = fileName.replace(/\.md$/, "");

		// Read markdown file as string
		const fullPath = path.join(postsDirectory, fileName);
		const fileContents = fs.readFileSync(fullPath, "utf8");

		// Use gray-matter to parse the post metadata section
		const matterResult = matter(fileContents);
		// Use a regex to find the first image in the Markdown
		const firstImageMatch = fileContents.match(/!\[.*\]\((.*)\)/);
		let firstImage = "";
		if (firstImageMatch) {
			// Use slug-based path
			firstImage = `images/${id}/${firstImageMatch[1]}`;
		}

		// Combine the data with the id and first image
		return {
			id,
			firstImage,
			...matterResult.data,
		};
	});
	// Sort posts by date
	return allPostsData.sort(({ date: a }, { date: b }) => {
		if (a < b) {
			return 1;
		} else {
			return -1;
		}
	});
}
// New function to get all post IDs
export function getAllPostIds() {
	const fileNames = fs.readdirSync(postsDirectory);
	return fileNames.map((fileName) => {
		return {
			params: {
				slug: fileName.replace(/\.md$/, ""),
			},
		};
	});
}
// Function to convert relative image paths to absolute
const convertImagePaths = (content, id) => {
	const imgRegex = /!\[([^\]]*)]\(([^)]*)\)/g;
	const replaceString = `![\$1](/images/${id}/\$2)`;
	return content.replace(imgRegex, replaceString);
};

// Function to replace @@http://link.com@@ with an <a> tag
const convertCustomLinks = (content) => {
	const customLinkRegex = /@@(http[^\s@@]+)@@/g;
	return content.replace(customLinkRegex, '<a href="$1">$1</a>');
};

export async function getPostData(slug) {
	const fullPath = path.join(postsDirectory, `${slug}.md`);
	let fileContents = fs.readFileSync(fullPath, "utf8");
	// Convert relative image paths to absolute
	fileContents = convertImagePaths(fileContents, slug);
	// Replace custom links
	fileContents = convertCustomLinks(fileContents);
	// Use gray-matter to parse the post metadata section
	const matterResult = matter(fileContents);

	// Use remark to convert markdown into HTML string
	const processedContent = await remark()
		.use(html)
		.process(matterResult.content);
	const contentHtml = processedContent.toString();

	// Combine the data with the slug
	return {
		slug,
		contentHtml,
		...matterResult.data,
	};
}
