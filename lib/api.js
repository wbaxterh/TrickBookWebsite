import axios from "axios";

const API_URL = "https://api.thetrickbook.com/api/blog"; // dev : http://174.129.64.158:9000/api/blog"
const API_IMAGE_UPLOAD_URL =
	"https://api.thetrickbook.com/api/blogImage/upload";

const TRICKS_API_URL = "https://api.thetrickbook.com/api/tricks";

export async function getSortedPostsData() {
	try {
		const response = await axios.get(API_URL);
		const allPostsData = response.data.map((post) => {
			const { _id, title, author, date, content, url, images } = post;
			// Assume the first image is still in the content in markdown format
			const firstImageMatch = content.match(/!\[.*\]\((.*)\)/);
			let firstImage = "";
			if (firstImageMatch) {
				firstImage = firstImageMatch[1];
			}
			return {
				id: _id,
				title,
				author,
				date,
				url,
				images,
			};
		});
		// Sort posts by date
		return allPostsData.sort((a, b) =>
			new Date(a.date) < new Date(b.date) ? 1 : -1
		);
	} catch (error) {
		console.error("Error fetching sorted posts data:", error);
		return [];
	}
}

export async function getAllPostIds() {
	try {
		const response = await axios.get(API_URL);
		return response.data.map((post) => {
			return {
				params: {
					slug: post.url,
				},
			};
		});
	} catch (error) {
		console.error("Error fetching post IDs:", error);
		return [];
	}
}

export async function getPostData(slug) {
	try {
		const response = await axios.get(`${API_URL}/url/${slug}`);
		const post = response.data;

		// Return the data directly from the database
		return {
			slug,
			...post,
		};
	} catch (error) {
		console.error("Error fetching post data:", error);
		return null;
	}
}

// Fetch a single post by ID (for editing)
export async function getBlogPostById(id) {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching blog post by ID:", error);
		throw error;
	}
}

// Update a blog post
export async function updateBlogPost(id, postData, token) {
	try {
		const response = await axios.patch(`${API_URL}/update/${id}`, postData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error updating blog post:", error);
		throw error;
	}
}

// Delete a blog post
export async function deleteBlogPost(id, token) {
	try {
		const response = await axios.delete(`${API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting blog post:", error);
		throw error;
	}
}

export async function createBlogPost(postData, token) {
	try {
		const response = await axios.post(API_URL, postData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creating blog post", error);
		throw error;
	}
}

export async function uploadImage(file, blogUrl, token) {
	const formData = new FormData();
	formData.append("file", file);
	// Debug log to check formData contents
	for (let pair of formData.entries()) {
		console.log(`${pair[0]}, ${pair[1]}`);
	}
	try {
		const response = await axios.post(
			`${API_IMAGE_UPLOAD_URL}?blogUrl=${encodeURIComponent(blogUrl)}`,
			formData,
			{
				headers: {
					"x-auth-token": token,
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data.imageUrl;
	} catch (error) {
		console.error("Error uploading image", error);
		throw error;
	}
}

export async function updateBlogPostImages(postId, imageUrls, token) {
	try {
		console.log("Updating blog post images:", imageUrls);
		await axios.patch(
			`${API_URL}/${postId}`,
			{ images: imageUrls },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		console.log("Successfully updated images for post ID:", postId);
	} catch (error) {
		console.error("Error updating blog post with images", error);
		throw error;
	}
}

export async function getSortedTricksData() {
	try {
		const response = await axios.get(TRICKS_API_URL);
		const allTricksData = response.data.map((trick) => {
			const {
				_id,
				name,
				category,
				difficulty,
				description,
				steps,
				images,
				videoUrl,
			} = trick;
			return {
				id: _id,
				name,
				category,
				difficulty,
				description,
				steps,
				images,
				videoUrl,
			};
		});
		return allTricksData.sort((a, b) => a.name.localeCompare(b.name));
	} catch (error) {
		console.error("Error fetching sorted tricks data:", error);
		return [];
	}
}

export async function getTrickData(id) {
	try {
		const response = await axios.get(`${TRICKS_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching trick data:", error);
		return null;
	}
}

export async function createTrick(trickData, token) {
	try {
		const response = await axios.post(TRICKS_API_URL, trickData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creating trick", error);
		throw error;
	}
}

export async function updateTrick(id, trickData, token) {
	try {
		const response = await axios.patch(`${TRICKS_API_URL}/${id}`, trickData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error updating trick:", error);
		throw error;
	}
}

export async function deleteTrick(id, token) {
	try {
		const response = await axios.delete(`${TRICKS_API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting trick:", error);
		throw error;
	}
}
