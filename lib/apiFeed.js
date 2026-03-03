import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

// Feed API calls for "The Feed"

// Get algorithmic feed (homies prioritized)
export async function getFeed({ page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(`${API_BASE_URL}/feed?page=${page}&limit=${limit}`, {
    headers: token ? { 'x-auth-token': token } : {},
  });
  return response.data;
}

// Get feed from followed users only
export async function getFollowingFeed({ page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(`${API_BASE_URL}/feed/following?page=${page}&limit=${limit}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get trending posts
export async function getTrendingFeed({ page = 1, limit = 20, sport } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (sport && sport !== 'all') params.append('sport', sport);

  const response = await axios.get(`${API_BASE_URL}/feed/trending?${params}`);
  return response.data;
}

// Get user's posts
export async function getUserPosts(userId, { page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(
    `${API_BASE_URL}/feed/user/${userId}?page=${page}&limit=${limit}`,
    {
      headers: token ? { 'x-auth-token': token } : {},
    },
  );
  return response.data;
}

// Get sport-specific feed
export async function getSportFeed(sportType, { page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(
    `${API_BASE_URL}/feed/sport/${sportType}?page=${page}&limit=${limit}`,
    {
      headers: token ? { 'x-auth-token': token } : {},
    },
  );
  return response.data;
}

// Get single post details
export async function getPost(postId, token) {
  const response = await axios.get(`${API_BASE_URL}/feed/${postId}`, {
    headers: token ? { 'x-auth-token': token } : {},
  });
  return response.data;
}

// Create new post
export async function createPost(postData, token) {
  const response = await axios.post(`${API_BASE_URL}/feed`, postData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Update post (caption, visibility)
export async function updatePost(postId, updates, token) {
  const response = await axios.put(`${API_BASE_URL}/feed/${postId}`, updates, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Delete post
export async function deletePost(postId, token) {
  const response = await axios.delete(`${API_BASE_URL}/feed/${postId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Add reaction (love or respect)
export async function addReaction(postId, type, token) {
  const response = await axios.post(
    `${API_BASE_URL}/feed/${postId}/reaction`,
    { type },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Remove reaction
export async function removeReaction(postId, type, token) {
  const response = await axios.delete(`${API_BASE_URL}/feed/${postId}/reaction/${type}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get comments for a post
export async function getComments(postId, { page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(
    `${API_BASE_URL}/feed/${postId}/comments?page=${page}&limit=${limit}`,
    {
      headers: token ? { 'x-auth-token': token } : {},
    },
  );
  return response.data;
}

// Add comment
export async function addComment(postId, content, parentCommentId = null, token) {
  const response = await axios.post(
    `${API_BASE_URL}/feed/${postId}/comments`,
    { content, parentCommentId },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Delete comment
export async function deleteComment(postId, commentId, token) {
  const response = await axios.delete(`${API_BASE_URL}/feed/${postId}/comments/${commentId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Love a comment
export async function loveComment(postId, commentId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/feed/${postId}/comments/${commentId}/love`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get replies to a comment
export async function getCommentReplies(postId, commentId, { page = 1, limit = 10 } = {}, token) {
  const response = await axios.get(
    `${API_BASE_URL}/feed/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`,
    {
      headers: token ? { 'x-auth-token': token } : {},
    },
  );
  return response.data;
}

// Save/unsave post
export async function toggleSavePost(postId, save, token) {
  const response = await axios.post(
    `${API_BASE_URL}/feed/${postId}/save`,
    { save },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get saved posts
export async function getSavedPosts({ page = 1, limit = 20 } = {}, token) {
  const response = await axios.get(`${API_BASE_URL}/feed/saved?page=${page}&limit=${limit}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Track view on a post (for analytics/algorithm)
export async function trackPostView(postId, watchDuration, completed, token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/feed/${postId}/view`,
      { watchDuration, completed },
      {
        headers: token ? { 'x-auth-token': token } : {},
      },
    );
    return response.data;
  } catch (_error) {
    // Don't throw - view tracking shouldn't affect UX
  }
}

// Report a post
export async function reportPost(postId, reason, token) {
  const response = await axios.post(
    `${API_BASE_URL}/feed/${postId}/report`,
    { reason },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}
