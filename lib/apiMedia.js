import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api";

// Library API calls for "The Couch"

// Get paginated library content
export async function getLibrary({ page = 1, limit = 20, sport, type, search } = {}) {
	try {
		const params = new URLSearchParams({ page, limit });
		if (sport && sport !== "all") params.append("sport", sport);
		if (type && type !== "all") params.append("type", type);
		if (search) params.append("search", search);

		const response = await axios.get(`${API_BASE_URL}/media/library?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching library:", error);
		throw error;
	}
}

// Get single video details
export async function getVideoDetails(videoId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/media/library/${videoId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching video details:", error);
		throw error;
	}
}

// Get featured content for hero section
export async function getFeatured() {
	try {
		const response = await axios.get(`${API_BASE_URL}/media/featured`);
		return response.data;
	} catch (error) {
		console.error("Error fetching featured content:", error);
		throw error;
	}
}

// Get all collections
export async function getCollections({ sport } = {}) {
	try {
		const params = new URLSearchParams();
		if (sport && sport !== "all") params.append("sport", sport);

		const response = await axios.get(`${API_BASE_URL}/media/collections?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching collections:", error);
		throw error;
	}
}

// Get single collection with videos
export async function getCollection(collectionId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/media/collections/${collectionId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching collection:", error);
		throw error;
	}
}

// Search library content
export async function searchLibrary(query, { sport, type, page = 1, limit = 20 } = {}) {
	try {
		const params = new URLSearchParams({ q: query, page, limit });
		if (sport && sport !== "all") params.append("sport", sport);
		if (type && type !== "all") params.append("type", type);

		const response = await axios.get(`${API_BASE_URL}/media/search?${params}`);
		return response.data;
	} catch (error) {
		console.error("Error searching library:", error);
		throw error;
	}
}

// Rate a video (1-5 stars)
export async function rateVideo(videoId, rating, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/media/library/${videoId}/rate`,
			{ rating },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error rating video:", error);
		throw error;
	}
}

// Track video view
export async function trackView(videoId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/media/library/${videoId}/view`,
			{},
			{
				headers: token ? { "x-auth-token": token } : {},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error tracking view:", error);
		// Don't throw - view tracking failure shouldn't affect UX
	}
}

// Get related videos
export async function getRelatedVideos(videoId, limit = 10) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/media/library/${videoId}/related?limit=${limit}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching related videos:", error);
		throw error;
	}
}

// Get content by sport type
export async function getContentBySport(sportType, { page = 1, limit = 20 } = {}) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/media/library/sport/${sportType}?page=${page}&limit=${limit}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching content by sport:", error);
		throw error;
	}
}

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
