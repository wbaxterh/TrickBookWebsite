import axios from 'axios';

const API_URL = 'https://api.thetrickbook.com/api/analytics';
const CLIENT_API_URL = 'https://api.thetrickbook.com/api/client';

async function get(path, token, days = 30) {
  const response = await axios.get(`${API_URL}${path}?days=${days}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}

export const fetchOverview = (token, days) => get('/dashboard/overview', token, days);
export const fetchTraffic = (token, days) => get('/dashboard/traffic', token, days);
export const fetchPages = (token, days) => get('/dashboard/pages', token, days);
export const fetchSections = (token, days) => get('/dashboard/sections', token, days);
export const fetchScrollDepth = (token, days) => get('/dashboard/scroll-depth', token, days);
export const fetchCtas = (token, days) => get('/dashboard/ctas', token, days);
export const fetchAppStores = (token, days) => get('/dashboard/app-stores', token, days);
export const fetchFunnel = (token, days) => get('/dashboard/funnel', token, days);
export const fetchReferrers = (token, days) => get('/dashboard/referrers', token, days);
export const fetchAppUsers = (token, days) => get('/dashboard/app-users', token, days);
export const fetchDownloads = (token, days) => get('/dashboard/downloads', token, days);
export async function fetchRetention(token, days) {
  const weeks = Math.max(4, Math.ceil(days / 7));
  const response = await axios.get(`${API_URL}/dashboard/retention?weeks=${weeks}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}
export const fetchFeatureValue = (token, days) => get('/dashboard/feature-value', token, days);
export const fetchLtv = (token) => get('/dashboard/ltv', token);
export async function fetchClientVersions(token, days) {
  const response = await axios.get(`${CLIENT_API_URL}/admin/versions?days=${days}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
}
