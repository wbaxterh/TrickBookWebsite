const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

export async function getSnowboardFilms({ page = 1, limit = 24, q = '' } = {}) {
  const params = new URLSearchParams({
    sport: 'snowboarding',
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set('q', q);
  const response = await fetch(`${API_BASE_URL}/couch/films?${params}`);
  if (!response.ok) throw new Error(`Film catalog returned ${response.status}`);
  return response.json();
}

export async function getSnowboardFilm(slug) {
  const response = await fetch(`${API_BASE_URL}/couch/films/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Film detail returned ${response.status}`);
  return response.json();
}
