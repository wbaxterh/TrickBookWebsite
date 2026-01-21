import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api";

// Feed API calls for "The Feed"

// Get algorithmic feed (homies prioritized)
export async function getFeed({ page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/feed?page=${page}&limit=${limit}`, {
			headers: token ? { "x-auth-token": token } : {},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching feed:", error);
		throw error;
	}
}

// Get feed from followed users only
export async function getFollowingFeed({ page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/following?page=${page}&limit=${limit}`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching following feed:", error);
		throw error;
	}
}

// Get trending posts
export async function getTrendingFeed({ page = 1, limit = 20, sport } = {}) {
	try {
		const params = new URLSearchParams({ page, limit });
		if (sport && sport !== "all") params.append("sport", sport);

		const response = await axios.get(`${API_BASE_URL}/feed/trending?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching trending feed:", error);
		throw error;
	}
}

// Get user's posts
export async function getUserPosts(userId, { page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/user/${userId}?page=${page}&limit=${limit}`,
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching user posts:", error);
		throw error;
	}
}

// Get sport-specific feed
export async function getSportFeed(sportType, { page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/sport/${sportType}?page=${page}&limit=${limit}`,
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching sport feed:", error);
		throw error;
	}
}

// Get single post details
export async function getPost(postId, token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/feed/${postId}`, {
			headers: token ? { "x-auth-token": token } : {},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching post:", error);
		throw error;
	}
}

// Create new post
export async function createPost(postData, token) {
	try {
		const response = await axios.post(`${API_BASE_URL}/feed`, postData, {
			headers: {
				"x-auth-token": token,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creating post:", error);
		throw error;
	}
}

// Update post (caption, visibility)
export async function updatePost(postId, updates, token) {
	try {
		const response = await axios.put(`${API_BASE_URL}/feed/${postId}`, updates, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error updating post:", error);
		throw error;
	}
}

// Delete post
export async function deletePost(postId, token) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/feed/${postId}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting post:", error);
		throw error;
	}
}

// Add reaction (love or respect)
export async function addReaction(postId, type, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/reaction`,
			{ type },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error adding reaction:", error);
		throw error;
	}
}

// Remove reaction
export async function removeReaction(postId, type, token) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/feed/${postId}/reaction/${type}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error removing reaction:", error);
		throw error;
	}
}

// Get comments for a post
export async function getComments(postId, { page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/${postId}/comments?page=${page}&limit=${limit}`,
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching comments:", error);
		throw error;
	}
}

// Add comment
export async function addComment(postId, content, parentCommentId = null, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/comments`,
			{ content, parentCommentId },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error adding comment:", error);
		throw error;
	}
}

// Delete comment
export async function deleteComment(postId, commentId, token) {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/feed/${postId}/comments/${commentId}`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting comment:", error);
		throw error;
	}
}

// Love a comment
export async function loveComment(postId, commentId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/comments/${commentId}/love`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error loving comment:", error);
		throw error;
	}
}

// Get replies to a comment
export async function getCommentReplies(postId, commentId, { page = 1, limit = 10 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`,
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching comment replies:", error);
		throw error;
	}
}

// Save/unsave post
export async function toggleSavePost(postId, save, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/save`,
			{ save },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error saving post:", error);
		throw error;
	}
}

// Get saved posts
export async function getSavedPosts({ page = 1, limit = 20 } = {}, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/feed/saved?page=${page}&limit=${limit}`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching saved posts:", error);
		throw error;
	}
}

// Track view on a post (for analytics/algorithm)
export async function trackPostView(postId, watchDuration, completed, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/view`,
			{ watchDuration, completed },
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error tracking post view:", error);
		// Don't throw - view tracking shouldn't affect UX
	}
}

// Report a post
export async function reportPost(postId, reason, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/feed/${postId}/report`,
			{ reason },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error reporting post:", error);
		throw error;
	}
}
