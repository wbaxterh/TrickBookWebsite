import { io } from "socket.io-client";

const SOCKET_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ||
	"https://api.thetrickbook.com";

let feedSocket = null;
let messagesSocket = null;

/**
 * Connect to the /feed namespace for real-time comment updates
 * @param {string} token - JWT token for authentication
 * @returns {Socket} Socket.IO socket instance
 */
export const connectFeedSocket = (token) => {
	if (feedSocket?.connected) return feedSocket;

	feedSocket = io(`${SOCKET_URL}/feed`, {
		auth: { token },
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
	});

	feedSocket.on("connect", () => {
		console.log("[Feed Socket] Connected:", feedSocket.id);
	});

	feedSocket.on("connect_error", (err) => {
		console.error("[Feed Socket] Connection error:", err.message);
	});

	feedSocket.on("disconnect", (reason) => {
		console.log("[Feed Socket] Disconnected:", reason);
	});

	return feedSocket;
};

/**
 * Connect to the /messages namespace for real-time direct messaging
 * @param {string} token - JWT token for authentication
 * @returns {Socket} Socket.IO socket instance
 */
export const connectMessagesSocket = (token) => {
	if (messagesSocket?.connected) return messagesSocket;

	messagesSocket = io(`${SOCKET_URL}/messages`, {
		auth: { token },
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
	});

	messagesSocket.on("connect", () => {
		console.log("[Messages Socket] Connected:", messagesSocket.id);
	});

	messagesSocket.on("connect_error", (err) => {
		console.error("[Messages Socket] Connection error:", err.message);
	});

	messagesSocket.on("disconnect", (reason) => {
		console.log("[Messages Socket] Disconnected:", reason);
	});

	return messagesSocket;
};

/**
 * Disconnect the feed socket
 */
export const disconnectFeedSocket = () => {
	if (feedSocket) {
		feedSocket.disconnect();
		feedSocket = null;
	}
};

/**
 * Disconnect the messages socket
 */
export const disconnectMessagesSocket = () => {
	if (messagesSocket) {
		messagesSocket.disconnect();
		messagesSocket = null;
	}
};

/**
 * Disconnect all sockets
 */
export const disconnectAllSockets = () => {
	disconnectFeedSocket();
	disconnectMessagesSocket();
};

/**
 * Get the current feed socket instance (without creating a new one)
 * @returns {Socket|null}
 */
export const getFeedSocket = () => feedSocket;

/**
 * Get the current messages socket instance (without creating a new one)
 * @returns {Socket|null}
 */
export const getMessagesSocket = () => messagesSocket;
