import axios from 'axios';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api'
).replace(/\/$/, '');

export async function getRiders({ q, sport, page = 1, limit = 24 } = {}) {
  const response = await axios.get(`${API_ROOT}/riders`, {
    params: { q: q || undefined, sport: sport || undefined, page, limit },
  });
  return response.data;
}

// Editorial (pro) rider profiles — curated records, filtered to lowercase
// sport slugs on the API side.
export async function getEditorialRiders({ q, sport, page = 1, limit = 12 } = {}) {
  const response = await axios.get(`${API_ROOT}/riders/editorial`, {
    params: {
      q: q || undefined,
      sport: sport ? sport.toLowerCase() : undefined,
      page,
      limit,
    },
  });
  return response.data;
}

export async function getEditorialRider(slug) {
  const response = await axios.get(`${API_ROOT}/riders/editorial/${encodeURIComponent(slug)}`);
  return response.data;
}
