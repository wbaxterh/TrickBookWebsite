import axios from "axios";

const API_BASE_URL = "https://api.thetrickbook.com/api/users";

// Toggle network visibility (discoverable to other users)
export async function toggleNetwork(userId, enabled, token) {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/${userId}/network`,
			{ network: enabled },
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error toggling network:", error);
		throw error;
	}
}

// Get discoverable users (users with network enabled)
export async function getDiscoverableUsers(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/discoverable`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching discoverable users:", error);
		throw error;
	}
}

// Send homie request to another user
export async function sendHomieRequest(targetUserId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/${targetUserId}/homie-request`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error sending homie request:", error);
		throw error;
	}
}

// Accept a homie request
export async function acceptHomieRequest(requesterId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/${requesterId}/accept-homie`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error accepting homie request:", error);
		throw error;
	}
}

// Reject a homie request
export async function rejectHomieRequest(requesterId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/${requesterId}/reject-homie`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error rejecting homie request:", error);
		throw error;
	}
}

// Get my homies list
export async function getMyHomies(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/homies`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching homies:", error);
		throw error;
	}
}

// Get pending homie requests (both sent and received)
export async function getPendingRequests(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/homie-requests`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching pending requests:", error);
		throw error;
	}
}

// Remove a homie
export async function removeHomie(homieId, token) {
	try {
		const response = await axios.delete(`${API_BASE_URL}/homie/${homieId}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error removing homie:", error);
		throw error;
	}
}

// Get user's network status
export async function getNetworkStatus(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/network-status`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching network status:", error);
		throw error;
	}
}
