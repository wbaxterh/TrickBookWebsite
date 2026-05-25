import axios from 'axios';

const BASE = 'https://api.thetrickbook.com/api/admin/spot-enrichment';

export async function getSpotRuns(params, token) {
  const response = await axios.get(`${BASE}/runs`, {
    params,
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

export async function getLatestSpotRuns(token) {
  const response = await axios.get(`${BASE}/runs/latest`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}
