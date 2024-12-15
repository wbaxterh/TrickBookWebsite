import axios from "axios";

const API_URL = "https://api.thetrickbook.com/api/users";

// Delete a user
export async function deleteUser(id, token) {
	try {
		const response = await axios.delete(`${API_URL}/${id}`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
}
