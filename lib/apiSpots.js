import axios from 'axios';

const SPOTS_API_URL = 'https://api.thetrickbook.com/api/spots';
const SPOTLISTS_API_URL = 'https://api.thetrickbook.com/api/spotlists';

// ==================== SPOTS ====================

// Get all spots with pagination
export async function getSpotsData(page = 1, limit = 50, sort = 'name', order = 'asc') {
  try {
    const response = await axios.get(
      `${SPOTS_API_URL}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`,
    );
    return response.data;
  } catch (_error) {
    return {
      spots: [],
      pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false },
    };
  }
}

// Search spots with filters
export async function searchSpots(
  query = '',
  city = '',
  state = '',
  tags = '',
  page = 1,
  limit = 50,
) {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (tags) params.append('tags', tags);
    params.append('page', page);
    params.append('limit', limit);

    const response = await axios.get(`${SPOTS_API_URL}/search?${params.toString()}`);
    return response.data;
  } catch (_error) {
    return {
      spots: [],
      pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false },
    };
  }
}

// Get spots grouped by state
export async function getSpotsByState() {
  try {
    const response = await axios.get(`${SPOTS_API_URL}?limit=1000`);
    const spots = response.data.spots || [];

    // Group by state
    const byState = spots.reduce((acc, spot) => {
      const state = spot.state || 'Unknown';
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push(spot);
      return acc;
    }, {});

    return byState;
  } catch (_error) {
    return {};
  }
}

// Get a single spot by ID
export async function getSpotData(id) {
  try {
    const response = await axios.get(`${SPOTS_API_URL}/${id}`);
    return response.data;
  } catch (_error) {
    return null;
  }
}

// Create a new spot
export async function createSpot(spotData, token) {
  const response = await axios.post(SPOTS_API_URL, spotData, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Update a spot
export async function updateSpot(id, spotData, token) {
  const response = await axios.put(`${SPOTS_API_URL}/${id}`, spotData, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Delete a spot (admin only)
export async function deleteSpot(id, token) {
  const response = await axios.delete(`${SPOTS_API_URL}/${id}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get pending spots for admin review
export async function getPendingSpots(token, page = 1, limit = 50) {
  try {
    const response = await axios.get(`${SPOTS_API_URL}/pending?page=${page}&limit=${limit}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return {
      spots: [],
      pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false },
    };
  }
}

// Get all spots (admin only - includes all approval statuses)
export async function getAllSpotsAdmin(token, page = 1, limit = 50, sort = 'name', order = 'asc') {
  try {
    const response = await axios.get(
      `${SPOTS_API_URL}/all?page=${page}&limit=${limit}&sort=${sort}&order=${order}`,
      {
        headers: {
          'x-auth-token': token,
        },
      },
    );
    return response.data;
  } catch (_error) {
    return {
      spots: [],
      pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasMore: false },
    };
  }
}

// Approve a spot (admin only)
export async function approveSpot(id, token) {
  const response = await axios.put(
    `${SPOTS_API_URL}/${id}/approve`,
    { status: 'approved' },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Reject a spot (admin only)
export async function rejectSpot(id, rejectionReason, token) {
  const response = await axios.put(
    `${SPOTS_API_URL}/${id}/reject`,
    { status: 'rejected', rejectionReason },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// ==================== SPOT LISTS ====================

// Get user's spot lists
export async function getSpotLists(token) {
  try {
    const response = await axios.get(SPOTLISTS_API_URL, {
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Get a single spot list by ID
export async function getSpotList(id, token) {
  try {
    const response = await axios.get(`${SPOTLISTS_API_URL}/${id}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return null;
  }
}

// Get spots in a spot list
export async function getSpotsInList(listId, token) {
  try {
    const response = await axios.get(`${SPOTLISTS_API_URL}/${listId}/spots`, {
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Create a new spot list
export async function createSpotList(name, description, token) {
  const response = await axios.post(
    SPOTLISTS_API_URL,
    { name, description },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Update a spot list
export async function updateSpotList(id, name, description, token) {
  const response = await axios.put(
    `${SPOTLISTS_API_URL}/${id}`,
    { name, description },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Delete a spot list
export async function deleteSpotList(id, token) {
  const response = await axios.delete(`${SPOTLISTS_API_URL}/${id}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Add a spot to a list
export async function addSpotToList(listId, spotId, token) {
  const response = await axios.post(
    `${SPOTLISTS_API_URL}/${listId}/spots`,
    { spotId },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Remove a spot from a list
export async function removeSpotFromList(listId, spotId, token) {
  const response = await axios.delete(`${SPOTLISTS_API_URL}/${listId}/spots/${spotId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get subscription usage
export async function getSpotUsage(token) {
  try {
    const response = await axios.get(`${SPOTLISTS_API_URL}/usage`, {
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return null;
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Generate URL-friendly slug from spot name
export function generateSpotSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Get unique states from spots
export async function getUniqueStates() {
  try {
    const response = await axios.get(`${SPOTS_API_URL}?limit=1000`);
    const spots = response.data.spots || [];

    const states = [...new Set(spots.map((spot) => spot.state).filter(Boolean))];
    return states.sort();
  } catch (_error) {
    return [];
  }
}
