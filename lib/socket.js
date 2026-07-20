import { io } from 'socket.io-client';

const SOCKET_URL = 'https://api.thetrickbook.com';

// Log socket URL on module load
if (typeof window !== 'undefined') {
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
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  feedSocket.on('connect', () => {});

  feedSocket.on('connect_error', (_err) => {});

  feedSocket.on('disconnect', (_reason) => {});

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
    messagesSocket.removeAllListeners();
    messagesSocket = null;
  }

  // Return existing connected socket
  if (messagesSocket?.connected) {
    return messagesSocket;
  }

  const socketUrl = `${SOCKET_URL}/messages`;

  messagesSocket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false,
  });

  messagesSocket.on('connect', () => {});

  messagesSocket.on('connect_error', (_err) => {});

  messagesSocket.on('disconnect', (_reason) => {});

  messagesSocket.on('reconnect', (_attemptNumber) => {});

  messagesSocket.on('reconnect_attempt', (_attemptNumber) => {});

  messagesSocket.on('error', (_err) => {});

  // Explicitly connect
  if (!messagesSocket.connected) {
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
