import axios from "axios";

const SPOTS_API_URL = "https://api.thetrickbook.com/api/spots";
const SPOTLISTS_API_URL = "https://api.thetrickbook.com/api/spotlists";

// ==================== SPOTS ====================

// Get all spots with pagination
export async function getSpotsData(page = 1, limit = 50, sort = "name", order = "asc") {
	try {
		const response = await axios.get(
			`${SPOTS_API_URL}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching spots data:", error);
		return { spots: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false } };
	}
}

// Search spots with filters
export async function searchSpots(query = "", city = "", state = "", tags = "", page = 1, limit = 50) {
	try {
		const params = new URLSearchParams();
		if (query) params.append("q", query);
		if (city) params.append("city", city);
		if (state) params.append("state", state);
		if (tags) params.append("tags", tags);
		params.append("page", page);
		params.append("limit", limit);

		const response = await axios.get(`${SPOTS_API_URL}/search?${params.toString()}`);
		return response.data;
	} catch (error) {
		console.error("Error searching spots:", error);
		return { spots: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false } };
	}
}

// Get spots grouped by state
export async function getSpotsByState() {
	try {
		const response = await axios.get(`${SPOTS_API_URL}?limit=1000`);
		const spots = response.data.spots || [];

		// Group by state
		const byState = spots.reduce((acc, spot) => {
			const state = spot.state || "Unknown";
			if (!acc[state]) {
				acc[state] = [];
			}
			acc[state].push(spot);
			return acc;
		}, {});

		return byState;
	} catch (error) {
		console.error("Error fetching spots by state:", error);
		return {};
	}
}

// Get a single spot by ID
export async function getSpotData(id) {
	try {
		const response = await axios.get(`${SPOTS_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching spot data:", error);
		return null;
	}
}

// Create a new spot
export async function createSpot(spotData, token) {
	try {
		const response = await axios.post(SPOTS_API_URL, spotData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creating spot:", error);
		throw error;
	}
}

// Update a spot
export async function updateSpot(id, spotData, token) {
	try {
		const response = await axios.put(`${SPOTS_API_URL}/${id}`, spotData, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error updating spot:", error);
		throw error;
	}
}

// Delete a spot (admin only)
export async function deleteSpot(id, token) {
	try {
		const response = await axios.delete(`${SPOTS_API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting spot:", error);
		throw error;
	}
}

// ==================== SPOT LISTS ====================

// Get user's spot lists
export async function getSpotLists(token) {
	try {
		const response = await axios.get(SPOTLISTS_API_URL, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching spot lists:", error);
		return [];
	}
}

// Get a single spot list by ID
export async function getSpotList(id, token) {
	try {
		const response = await axios.get(`${SPOTLISTS_API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching spot list:", error);
		return null;
	}
}

// Get spots in a spot list
export async function getSpotsInList(listId, token) {
	try {
		const response = await axios.get(`${SPOTLISTS_API_URL}/${listId}/spots`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching spots in list:", error);
		return [];
	}
}

// Create a new spot list
export async function createSpotList(name, description, token) {
	try {
		const response = await axios.post(
			SPOTLISTS_API_URL,
			{ name, description },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error creating spot list:", error);
		throw error;
	}
}

// Update a spot list
export async function updateSpotList(id, name, description, token) {
	try {
		const response = await axios.put(
			`${SPOTLISTS_API_URL}/${id}`,
			{ name, description },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error updating spot list:", error);
		throw error;
	}
}

// Delete a spot list
export async function deleteSpotList(id, token) {
	try {
		const response = await axios.delete(`${SPOTLISTS_API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting spot list:", error);
		throw error;
	}
}

// Add a spot to a list
export async function addSpotToList(listId, spotId, token) {
	try {
		const response = await axios.post(
			`${SPOTLISTS_API_URL}/${listId}/spots`,
			{ spotId },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error adding spot to list:", error);
		throw error;
	}
}

// Remove a spot from a list
export async function removeSpotFromList(listId, spotId, token) {
	try {
		const response = await axios.delete(
			`${SPOTLISTS_API_URL}/${listId}/spots/${spotId}`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error removing spot from list:", error);
		throw error;
	}
}

// Get subscription usage
export async function getSpotUsage(token) {
	try {
		const response = await axios.get(`${SPOTLISTS_API_URL}/usage`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching spot usage:", error);
		return null;
	}
}

// ==================== UTILITY FUNCTIONS ====================

// Generate URL-friendly slug from spot name
export function generateSpotSlug(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

// Get unique states from spots
export async function getUniqueStates() {
	try {
		const response = await axios.get(`${SPOTS_API_URL}?limit=1000`);
		const spots = response.data.spots || [];

		const states = [...new Set(spots.map(spot => spot.state).filter(Boolean))];
		return states.sort();
	} catch (error) {
		console.error("Error fetching unique states:", error);
		return [];
	}
}
