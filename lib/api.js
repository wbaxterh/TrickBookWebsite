import axios from "axios";

const API_URL = "https://api.thetrickbook.com/api/blog"; // dev : http://174.129.64.158:9000/api/blog"
const API_IMAGE_UPLOAD_URL =
	"https://api.thetrickbook.com/api/blogImage/upload";

const TRICKS_API_URL = "https://api.thetrickbook.com/api/trickipedia";

const CATEGORIES_API_URL = "https://api.thetrickbook.com/api/categories";

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

export async function getSortedTricksData(category) {
	// Hardcoded sample trick for preview
	const sampleTrick = {
		id: "sample123",
		name: "Kickflip",
		category: "Skateboarding",
		difficulty: "Intermediate",
		description:
			"A kickflip is a fundamental skateboarding trick where the rider flips the board 360° along the axis that extends from the nose to the tail of the deck.",
		steps: [
			"Start rolling at a comfortable speed.",
			"Place your back foot on the tail and your front foot just behind the front bolts, angled slightly.",
			"Pop the tail down and slide your front foot up and off the edge to flick the board.",
			"Jump and watch the board flip, then catch it with your back foot.",
			"Land with both feet over the bolts and roll away.",
		],
		images: ["/images/tricks/kickflip1.jpg"],
		videoUrl: "https://www.youtube.com/watch?v=samplekickflip",
		sampleData: true,
		source: "official",
		url: "kickflip",
	};

	try {
		const response = await axios.get(TRICKS_API_URL);
		let allTricksData = response.data.map((trick) => {
			const {
				_id,
				name,
				category,
				difficulty,
				description,
				steps,
				images,
				videoUrl,
				source,
				url,
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
				source,
				url,
			};
		});
		if (category) {
			allTricksData = allTricksData.filter(
				(trick) => trick.category === category
			);
		}
		// Add the sample trick if the category matches
		if (!category || category === "Skateboarding") {
			allTricksData.unshift(sampleTrick);
		}
		return allTricksData.sort((a, b) => a.name.localeCompare(b.name));
	} catch (error) {
		console.error("Error fetching sorted tricks data:", error);
		// Fallback: return just the sample trick if the category matches
		if (!category || category === "Skateboarding") {
			return [sampleTrick];
		}
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

export async function getCategories() {
	try {
		const response = await axios.get(CATEGORIES_API_URL);
		return response.data;
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
}

export async function getCategory(id) {
	try {
		const response = await axios.get(`${CATEGORIES_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching category:", error);
		return null;
	}
}

export async function createCategory(category, token) {
	try {
		const response = await axios.post(CATEGORIES_API_URL, category, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	} catch (error) {
		console.error("Error creating category:", error);
		throw error;
	}
}

export async function updateCategory(id, category, token) {
	try {
		const response = await axios.put(`${CATEGORIES_API_URL}/${id}`, category, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	} catch (error) {
		console.error("Error updating category:", error);
		throw error;
	}
}

export async function deleteCategory(id, token) {
	try {
		const response = await axios.delete(`${CATEGORIES_API_URL}/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting category:", error);
		throw error;
	}
}

export async function uploadTrickImage(file, trickUrl, token) {
	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await axios.post(
			`https://api.thetrickbook.com/api/trickImage/upload?trickUrl=${encodeURIComponent(
				trickUrl
			)}`,
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
		console.error("Error uploading trick image", error);
		throw error;
	}
}

export async function deleteTrickImages(trickUrl, token) {
	try {
		const response = await axios.delete(
			`https://api.thetrickbook.com/api/trickImage/delete-folder/${encodeURIComponent(
				trickUrl
			)}`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting trick images", error);
		throw error;
	}
}
