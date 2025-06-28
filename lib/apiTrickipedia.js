import axios from "axios";

const TRICKS_API_URL = "https://api.thetrickbook.com/api/trickipedia";
const TRICK_IMAGE_API_URL = "https://api.thetrickbook.com/api/trickImage";

// Get all tricks (with optional category filter)
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

// Get a single trick by ID
export async function getTrickData(id) {
	try {
		const response = await axios.get(`${TRICKS_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching trick data:", error);
		return null;
	}
}

// Create a new trick
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

// Update an existing trick
export async function updateTrick(id, trickData, token) {
	try {
		const response = await axios.put(`${TRICKS_API_URL}/${id}`, trickData, {
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

// Delete a trick
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

// Upload a trick image
export async function uploadTrickImage(file, trickUrl, token) {
	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await axios.post(
			`${TRICK_IMAGE_API_URL}/upload?trickUrl=${encodeURIComponent(trickUrl)}`,
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

// Delete all images for a trick
export async function deleteTrickImages(trickUrl, token) {
	try {
		const response = await axios.delete(
			`${TRICK_IMAGE_API_URL}/delete-folder/${encodeURIComponent(trickUrl)}`,
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

// Get tricks by category
export async function getTricksByCategory(category) {
	try {
		const response = await axios.get(`${TRICKS_API_URL}/category/${category}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching tricks by category:", error);
		return [];
	}
}

// Search tricks
export async function searchTricks(query, category = null, difficulty = null) {
	try {
		let url = `${TRICKS_API_URL}?search=${encodeURIComponent(query)}`;
		if (category) url += `&category=${encodeURIComponent(category)}`;
		if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;

		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error("Error searching tricks:", error);
		return [];
	}
}
