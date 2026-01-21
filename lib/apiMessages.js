import axios from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.thetrickbook.com/api";

/**
 * Get all conversations for the current user
 * @param {string} token - JWT auth token
 * @returns {Promise<Array>} List of conversations with other user info
 */
export async function getConversations(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/dm/conversations`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching conversations:", error);
		throw error;
	}
}

/**
 * Get a single conversation by ID
 * @param {string} conversationId - The conversation ID
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Conversation with other user info
 */
export async function getConversation(conversationId, token) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/dm/conversations/${conversationId}`,
			{
				headers: { "x-auth-token": token },
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching conversation:", error);
		throw error;
	}
}

/**
 * Get messages for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Messages per page (default 50)
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Messages array with pagination
 */
export async function getMessages(
	conversationId,
	{ page = 1, limit = 50 } = {},
	token
) {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/dm/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
			{
				headers: { "x-auth-token": token },
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching messages:", error);
		throw error;
	}
}

/**
 * Start a new conversation with a user (or get existing one)
 * @param {string} targetUserId - The user ID to start conversation with
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Conversation object
 */
export async function startConversation(targetUserId, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/dm/conversations`,
			{ targetUserId },
			{
				headers: { "x-auth-token": token },
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error starting conversation:", error);
		throw error;
	}
}

/**
 * Send a message in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} content - Message content
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Created message object
 */
export async function sendMessage(conversationId, content, token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/dm/conversations/${conversationId}/messages`,
			{ content },
			{
				headers: { "x-auth-token": token },
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error sending message:", error);
		throw error;
	}
}

/**
 * Mark a conversation as read
 * @param {string} conversationId - The conversation ID
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Success response
 */
export async function markAsRead(conversationId, token) {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/dm/conversations/${conversationId}/read`,
			{},
			{
				headers: { "x-auth-token": token },
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error marking as read:", error);
		throw error;
	}
}

/**
 * Get total unread message count across all conversations
 * @param {string} token - JWT auth token
 * @returns {Promise<Object>} Object with unreadCount property
 */
export async function getUnreadCount(token) {
	try {
		const response = await axios.get(`${API_BASE_URL}/dm/unread-count`, {
			headers: { "x-auth-token": token },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching unread count:", error);
		throw error;
	}
}
