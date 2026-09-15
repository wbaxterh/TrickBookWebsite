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
