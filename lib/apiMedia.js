import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api";

// ============================================
// THE COUCH - Video Library
// ============================================

// Get all published videos
export async function getCouchVideos({ sport, collection, sort, limit } = {}) {
	try {
		const params = new URLSearchParams();
		if (sport && sport !== "all") params.append("sport", sport);
		if (collection) params.append("collection", collection);
		if (sort) params.append("sort", sort);
		if (limit) params.append("limit", limit);

		const response = await axios.get(`${API_BASE_URL}/couch/videos?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching couch videos:", error);
		throw error;
	}
}

// Get featured video for hero section
export async function getFeatured() {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/featured`);
		return response.data;
	} catch (error) {
		console.error("Error fetching featured content:", error);
		return null;
	}
}

// Get single video details
export async function getVideoDetails(videoId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching video details:", error);
		throw error;
	}
}

// Get video stream URL
export async function getVideoStreamUrl(videoId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}/stream`);
		return response.data;
	} catch (error) {
		console.error("Error fetching stream URL:", error);
		throw error;
	}
}

// Get all collections (with their videos)
export async function getCollections({ sport } = {}) {
	try {
		const params = new URLSearchParams();
		if (sport && sport !== "all") params.append("sport", sport);

		const response = await axios.get(`${API_BASE_URL}/couch/collections?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching collections:", error);
		return [];
	}
}

// Get single collection with all videos
export async function getCollection(collectionId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/collections/${collectionId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching collection:", error);
		throw error;
	}
}

// ============================================
// REACTIONS (Love/Respect)
// ============================================

// Get user's reactions on a video
export async function getVideoReaction(videoId, token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}/reaction`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching reaction:", error);
		return { love: false, respect: false };
	}
}

// Add reaction (love or respect)
export async function addVideoReaction(videoId, type, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/videos/${videoId}/reaction`,
			{ type },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error adding reaction:", error);
		throw error;
	}
}

// Remove reaction
export async function removeVideoReaction(videoId, type, token) {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/couch/videos/${videoId}/reaction/${type}`,
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error removing reaction:", error);
		throw error;
	}
}

// ============================================
// COMMENTS
// ============================================

// Get comments for a video
export async function getVideoComments(videoId, { page = 1, limit = 20 } = {}) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/couch/videos/${videoId}/comments?page=${page}&limit=${limit}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching comments:", error);
		throw error;
	}
}

// Add comment
export async function addVideoComment(videoId, content, token, parentCommentId = null) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/videos/${videoId}/comments`,
			{ content, parentCommentId },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error adding comment:", error);
		throw error;
	}
}

// Delete comment
export async function deleteVideoComment(videoId, commentId, token) {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/couch/videos/${videoId}/comments/${commentId}`,
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting comment:", error);
		throw error;
	}
}

// ============================================
// VIDEO REQUESTS
// ============================================

// Submit a video request
export async function submitVideoRequest(title, description, link, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/requests`,
			{ title, description, link },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error submitting request:", error);
		throw error;
	}
}

// Get my requests
export async function getMyVideoRequests(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/requests/mine`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching requests:", error);
		throw error;
	}
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Sync videos from Google Drive
export async function syncFromDrive(token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/admin/sync`,
			{},
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error syncing from Drive:", error);
		throw error;
	}
}

// Get all videos (admin - includes unpublished)
export async function getAdminVideos(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/admin/videos`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching admin videos:", error);
		throw error;
	}
}

// Update video metadata (admin)
export async function updateVideo(videoId, data, token) {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/couch/admin/videos/${videoId}`,
			data,
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error updating video:", error);
		throw error;
	}
}

// Delete video (admin)
export async function deleteVideo(videoId, token) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/couch/admin/videos/${videoId}`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting video:", error);
		throw error;
	}
}

// Create collection (admin)
export async function createCollection(data, token) {
	try {
		const response = await axios.post(`${API_BASE_URL}/couch/admin/collections`, data, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error creating collection:", error);
		throw error;
	}
}

// Update collection (admin)
export async function updateCollection(collectionId, data, token) {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/couch/admin/collections/${collectionId}`,
			data,
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error updating collection:", error);
		throw error;
	}
}

// Get all video requests (admin)
export async function getAdminRequests(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/admin/requests`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching requests:", error);
		throw error;
	}
}

// Fetch YouTube metadata (admin)
export async function fetchYouTubeMetadata(youtubeUrl, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/admin/youtube-metadata`,
			{ youtubeUrl },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching YouTube metadata:", error);
		throw error;
	}
}

// Create new video (admin)
export async function createVideo(data, token) {
	try {
		const response = await axios.post(`${API_BASE_URL}/couch/admin/videos`, data, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error creating video:", error);
		throw error;
	}
}

// Create Bunny.net video (admin)
export async function createBunnyVideo(title, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/couch/admin/bunny/create-video`,
			{ title },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error creating Bunny video:", error);
		throw error;
	}
}

// Get single video for editing (admin)
export async function getAdminVideo(videoId, token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/couch/admin/videos/${videoId}`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching video:", error);
		throw error;
	}
}

// Update request status (admin)
export async function updateRequestStatus(requestId, status, token) {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/couch/admin/requests/${requestId}`,
			{ status },
			{ headers: { "x-auth-token": token } }
		);
		return response.data;
	} catch (error) {
		console.error("Error updating request:", error);
		throw error;
	}
}

// ============================================
// CONSTANTS
// ============================================

// Sport types constant
export const SPORT_TYPES = [
	{ value: "all", label: "All Sports" },
	{ value: "skateboarding", label: "Skateboarding" },
	{ value: "snowboarding", label: "Snowboarding" },
	{ value: "skiing", label: "Skiing" },
	{ value: "bmx", label: "BMX" },
	{ value: "mtb", label: "MTB" },
	{ value: "scooter", label: "Scooter" },
	{ value: "surf", label: "Surf" },
	{ value: "wakeboarding", label: "Wakeboarding" },
	{ value: "rollerblading", label: "Rollerblading" },
];

// Content types constant
export const CONTENT_TYPES = [
	{ value: "all", label: "All Types" },
	{ value: "film", label: "Films" },
	{ value: "documentary", label: "Documentaries" },
	{ value: "series", label: "Series" },
	{ value: "edit", label: "Edits" },
	{ value: "tutorial", label: "Tutorials" },
	{ value: "competition", label: "Competitions" },
];
