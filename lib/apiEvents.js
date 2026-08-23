import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';
const EVENTS_API_URL = `${API_BASE_URL}/events`;

function authHeaders(token) {
  return token ? { 'x-auth-token': token } : {};
}

export async function getEvents(filters = {}, cursor = null) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, value);
    }
  });
  if (cursor) params.set('cursor', cursor);

  const response = await axios.get(`${EVENTS_API_URL}?${params.toString()}`);
  const payload = response.data;
  return {
    events: Array.isArray(payload) ? payload : payload.events || [],
    nextCursor: payload.nextCursor || null,
    totalCount: payload.totalCount ?? payload.pagination?.totalCount ?? null,
  };
}

export async function getEvent(slugOrId) {
  const response = await axios.get(`${EVENTS_API_URL}/${encodeURIComponent(slugOrId)}`);
  return response.data?.event || response.data;
}

export async function saveEvent(eventId, token) {
  const response = await axios.post(
    `${EVENTS_API_URL}/${eventId}/save`,
    {},
    { headers: authHeaders(token) },
  );
  return response.data;
}

export async function unsaveEvent(eventId, token) {
  const response = await axios.delete(`${EVENTS_API_URL}/${eventId}/save`, {
    headers: authHeaders(token),
  });
  return response.data;
}
