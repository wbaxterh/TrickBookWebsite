import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

export async function getShops(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== 'any') params.set(key, value);
  });
  const response = await axios.get(`${API_BASE_URL}/shops?${params.toString()}`);
  const payload = response.data;
  return {
    shops: Array.isArray(payload) ? payload : payload.shops || [],
    totalCount: payload.totalCount ?? payload.pagination?.totalCount ?? null,
  };
}

export async function getShop(slugOrId) {
  const response = await axios.get(`${API_BASE_URL}/shops/${encodeURIComponent(slugOrId)}`);
  return response.data?.shop || response.data;
}

// ============================================
// SHOP COMMENTS API
// ============================================

export async function getShopComments(shopSlugOrId, { page = 1, limit = 20 } = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/shops/${encodeURIComponent(shopSlugOrId)}/comments`,
    { params: { page, limit }, headers },
  );
  return response.data;
}

export async function addShopComment(shopSlugOrId, content, parentCommentId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/shops/${encodeURIComponent(shopSlugOrId)}/comments`,
    { content, parentCommentId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data?.comment || response.data;
}

export async function deleteShopComment(shopSlugOrId, commentId, token) {
  await axios.delete(
    `${API_BASE_URL}/shops/${encodeURIComponent(shopSlugOrId)}/comments/${commentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function loveShopComment(shopSlugOrId, commentId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/shops/${encodeURIComponent(shopSlugOrId)}/comments/${commentId}/love`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function getShopCommentReplies(shopSlugOrId, commentId, { limit = 50 } = {}, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/shops/${encodeURIComponent(shopSlugOrId)}/comments/${commentId}/replies`,
    { params: { limit }, headers },
  );
  return response.data;
}
