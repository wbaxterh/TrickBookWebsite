import axios from "axios";

const API_URL = "https://api.thetrickbook.com/api/listings";

// Get user's trick lists
export async function getUserTrickLists(userId, token) {
	try {
		const response = await axios.get(API_URL, {
			params: { userId },
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching trick lists:", error);
		return [];
	}
}

// Create a new trick list
export async function createTrickList(title, userId, token) {
	try {
		const response = await axios.post(
			API_URL,
			{ title, userId },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error creating trick list:", error);
		throw error;
	}
}

// Delete a trick list
export async function deleteTrickList(listId, token) {
	try {
		const response = await axios.delete(`${API_URL}/${listId}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting trick list:", error);
		throw error;
	}
}

// Update trick list name
export async function updateTrickList(trickListId, name, token) {
	try {
		const response = await axios.put(
			`${API_URL}/edit`,
			{ trickListId, name },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error updating trick list:", error);
		throw error;
	}
}

// Get public trick lists (homie lists)
// Note: This will need backend updates to support filtering by isPublic
export async function getPublicTrickLists(token) {
	try {
		const response = await axios.get(`${API_URL}/public`, {
			headers: token ? { "x-auth-token": token } : {},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching public trick lists:", error);
		return [];
	}
}

// Toggle trick list public/private status
// Note: This will need backend updates
export async function toggleTrickListPublic(trickListId, isPublic, token) {
	try {
		const response = await axios.put(
			`${API_URL}/${trickListId}/visibility`,
			{ isPublic },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error toggling trick list visibility:", error);
		throw error;
	}
}

// Get trick list count for user
export async function getTrickListCount(userId, token) {
	try {
		const response = await axios.get(`${API_URL}/countTrickLists`, {
			params: { userId },
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching trick list count:", error);
		return { totalTrickLists: 0 };
	}
}

// ============ Individual Trick Operations ============

const TRICK_API_URL = "https://api.thetrickbook.com/api/listing";

// Get all tricks in a list
export async function getTricksInList(listId, token) {
	try {
		const response = await axios.get(TRICK_API_URL, {
			params: { list_id: listId },
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching tricks in list:", error);
		return [];
	}
}

// Add a trick to a list
// Optional trickipediaId links the trick back to the Trickipedia entry
export async function addTrickToList(listId, trickData, token) {
	try {
		const body = {
			list_id: listId,
			name: trickData.name,
			link: trickData.link || "",
			notes: trickData.notes || "",
			checked: "To Do", // String value matching mobile app format
		};

		// Include trickipediaId if provided (for linking back to Trickipedia)
		if (trickData.trickipediaId) {
			body.trickipediaId = trickData.trickipediaId;
		}

		const response = await axios.put(TRICK_API_URL, body, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error adding trick to list:", error);
		throw error;
	}
}

// Add a trick from Trickipedia to a list (convenience function)
// Automatically includes trickipediaId for "View Tutorial" linking
export async function addTrickFromTrickipedia(listId, trickipediaTrick, token) {
	return addTrickToList(
		listId,
		{
			name: trickipediaTrick.name,
			link: trickipediaTrick.videoUrl || trickipediaTrick.url || "",
			notes: `From Trickipedia: ${trickipediaTrick.category} - ${trickipediaTrick.difficulty}`,
			trickipediaId: trickipediaTrick._id,
		},
		token
	);
}

// Edit a trick
export async function editTrick(trickId, trickData, token) {
	try {
		const response = await axios.put(
			`${TRICK_API_URL}/edit`,
			{
				trickId,
				name: trickData.name,
				link: trickData.link || "",
				notes: trickData.notes || "",
			},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error editing trick:", error);
		throw error;
	}
}

// Toggle trick completion status
export async function updateTrickStatus(trickId, checked, token) {
	try {
		const response = await axios.put(
			`${TRICK_API_URL}/update`,
			{
				_id: trickId,
				checked,
			},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error updating trick status:", error);
		throw error;
	}
}

// Delete a trick
export async function deleteTrick(trickId, token) {
	try {
		const response = await axios.delete(`${TRICK_API_URL}/${trickId}`, {
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
