import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

// ============================================
// THE COUCH - Video Library
// ============================================

// Get all published videos
export async function getCouchVideos({ sport, collection, sort, limit } = {}) {
  const params = new URLSearchParams();
  if (sport && sport !== 'all') params.append('sport', sport);
  if (collection) params.append('collection', collection);
  if (sort) params.append('sort', sort);
  if (limit) params.append('limit', limit);

  const response = await axios.get(`${API_BASE_URL}/couch/videos?${params}`);
  return response.data;
}

// Get featured video for hero section
export async function getFeatured() {
  try {
    const response = await axios.get(`${API_BASE_URL}/couch/featured`);
    return response.data;
  } catch (_error) {
    return null;
  }
}

// Get single video details
export async function getVideoDetails(videoId) {
  const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}`);
  return response.data;
}

// Get video stream URL
export async function getVideoStreamUrl(videoId) {
  const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}/stream`);
  return response.data;
}

// Get all collections (with their videos)
export async function getCollections({ sport } = {}) {
  try {
    const params = new URLSearchParams();
    if (sport && sport !== 'all') params.append('sport', sport);

    const response = await axios.get(`${API_BASE_URL}/couch/collections?${params}`);
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Get single collection with all videos
export async function getCollection(collectionId) {
  const response = await axios.get(`${API_BASE_URL}/couch/collections/${collectionId}`);
  return response.data;
}

// ============================================
// REACTIONS (Love/Respect)
// ============================================

// Get user's reactions on a video
export async function getVideoReaction(videoId, token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/couch/videos/${videoId}/reaction`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (_error) {
    return { love: false, respect: false };
  }
}

// Add reaction (love or respect)
export async function addVideoReaction(videoId, type, token) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/videos/${videoId}/reaction`,
    { type },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Remove reaction
export async function removeVideoReaction(videoId, type, token) {
  const response = await axios.delete(`${API_BASE_URL}/couch/videos/${videoId}/reaction/${type}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// ============================================
// COMMENTS
// ============================================

// Get comments for a video
export async function getVideoComments(videoId, { page = 1, limit = 20 } = {}) {
  const response = await axios.get(
    `${API_BASE_URL}/couch/videos/${videoId}/comments?page=${page}&limit=${limit}`,
  );
  return response.data;
}

// Add comment
export async function addVideoComment(videoId, content, token, parentCommentId = null) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/videos/${videoId}/comments`,
    { content, parentCommentId },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Delete comment
export async function deleteVideoComment(videoId, commentId, token) {
  const response = await axios.delete(
    `${API_BASE_URL}/couch/videos/${videoId}/comments/${commentId}`,
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// ============================================
// VIDEO REQUESTS
// ============================================

// Submit a video request
export async function submitVideoRequest(title, description, link, token) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/requests`,
    { title, description, link },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Get my requests
export async function getMyVideoRequests(token) {
  const response = await axios.get(`${API_BASE_URL}/couch/requests/mine`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Sync videos from Google Drive
export async function syncFromDrive(token) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/admin/sync`,
    {},
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Get all videos (admin - includes unpublished)
export async function getAdminVideos(token) {
  const response = await axios.get(`${API_BASE_URL}/couch/admin/videos`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Update video metadata (admin)
export async function updateVideo(videoId, data, token) {
  const response = await axios.put(`${API_BASE_URL}/couch/admin/videos/${videoId}`, data, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Delete video (admin)
export async function deleteVideo(videoId, token) {
  const response = await axios.delete(`${API_BASE_URL}/couch/admin/videos/${videoId}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Create collection (admin)
export async function createCollection(data, token) {
  const response = await axios.post(`${API_BASE_URL}/couch/admin/collections`, data, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Update collection (admin)
export async function updateCollection(collectionId, data, token) {
  const response = await axios.put(
    `${API_BASE_URL}/couch/admin/collections/${collectionId}`,
    data,
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Get all video requests (admin)
export async function getAdminRequests(token) {
  const response = await axios.get(`${API_BASE_URL}/couch/admin/requests`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Fetch YouTube metadata (admin)
export async function fetchYouTubeMetadata(youtubeUrl, token) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/admin/youtube-metadata`,
    { youtubeUrl },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Create new video (admin)
export async function createVideo(data, token) {
  const response = await axios.post(`${API_BASE_URL}/couch/admin/videos`, data, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Create Bunny.net video (admin)
export async function createBunnyVideo(title, token) {
  const response = await axios.post(
    `${API_BASE_URL}/couch/admin/bunny/create-video`,
    { title },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// Get single video for editing (admin)
export async function getAdminVideo(videoId, token) {
  const response = await axios.get(`${API_BASE_URL}/couch/admin/videos/${videoId}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

// Update request status (admin)
export async function updateRequestStatus(requestId, status, token) {
  const response = await axios.put(
    `${API_BASE_URL}/couch/admin/requests/${requestId}`,
    { status },
    { headers: { 'x-auth-token': token } },
  );
  return response.data;
}

// ============================================
// CONSTANTS
// ============================================

// Sport types constant
export const SPORT_TYPES = [
  { value: 'all', label: 'All Sports' },
  { value: 'skateboarding', label: 'Skateboarding' },
  { value: 'snowboarding', label: 'Snowboarding' },
  { value: 'skiing', label: 'Skiing' },
  { value: 'bmx', label: 'BMX' },
  { value: 'mtb', label: 'MTB' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'surf', label: 'Surf' },
  { value: 'wakeboarding', label: 'Wakeboarding' },
  { value: 'rollerblading', label: 'Rollerblading' },
];

// Content types constant
export const CONTENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'film', label: 'Films' },
  { value: 'documentary', label: 'Documentaries' },
  { value: 'series', label: 'Series' },
  { value: 'edit', label: 'Edits' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'competition', label: 'Competitions' },
];
