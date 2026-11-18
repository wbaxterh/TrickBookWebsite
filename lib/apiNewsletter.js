import axios from 'axios';

const API = 'https://api.thetrickbook.com/api/newsletter';

export async function fetchNewsletterCampaigns(token, days = 30, includePreviews = false, signal) {
  const { data } = await axios.get(`${API}/campaigns`, {
    headers: { 'x-auth-token': token },
    params: { days, includePreviews },
    timeout: 15000,
    signal,
  });
  return data;
}

export async function fetchNewsletterStats(token, campaignId, signal) {
  const { data } = await axios.get(`${API}/campaigns/${encodeURIComponent(campaignId)}/stats`, {
    headers: { 'x-auth-token': token },
    timeout: 15000,
    signal,
  });
  return data;
}
