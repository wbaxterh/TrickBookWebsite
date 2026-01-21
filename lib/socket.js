import { io } from "socket.io-client";

const SOCKET_URL = "https://api.thetrickbook.com";

// Log socket URL on module load
if (typeof window !== "undefined") {
	console.log("[Socket] SOCKET_URL:", SOCKET_URL);
	console.log("[Socket] ENV API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
}

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
	// If socket exists but is disconnected, clean up and create new one
	if (messagesSocket && !messagesSocket.connected) {
		console.log("[Messages Socket] Cleaning up disconnected socket");
		messagesSocket.removeAllListeners();
		messagesSocket = null;
	}

	// Return existing connected socket
	if (messagesSocket?.connected) {
		console.log("[Messages Socket] Reusing existing socket:", messagesSocket.id);
		return messagesSocket;
	}

	const socketUrl = `${SOCKET_URL}/messages`;
	console.log("[Messages Socket] Creating new connection to:", socketUrl);
	console.log("[Messages Socket] Token present:", !!token);

	messagesSocket = io(socketUrl, {
		auth: { token },
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		timeout: 20000,
		forceNew: false,
	});

	// Immediately check connection state
	console.log("[Messages Socket] Socket created, connected:", messagesSocket.connected);

	messagesSocket.on("connect", () => {
		console.log("[Messages Socket] Connected! Socket ID:", messagesSocket.id);
	});

	messagesSocket.on("connect_error", (err) => {
		console.error("[Messages Socket] Connection error:", err.message);
		console.error("[Messages Socket] Full error:", err);
	});

	messagesSocket.on("disconnect", (reason) => {
		console.log("[Messages Socket] Disconnected:", reason);
	});

	messagesSocket.on("reconnect", (attemptNumber) => {
		console.log("[Messages Socket] Reconnected after", attemptNumber, "attempts");
	});

	messagesSocket.on("reconnect_attempt", (attemptNumber) => {
		console.log("[Messages Socket] Reconnection attempt", attemptNumber);
	});

	messagesSocket.on("error", (err) => {
		console.error("[Messages Socket] Socket error:", err);
	});

	// Explicitly connect
	if (!messagesSocket.connected) {
		console.log("[Messages Socket] Calling connect()...");
		messagesSocket.connect();
	}

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
