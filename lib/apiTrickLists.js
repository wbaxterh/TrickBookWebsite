import axios from 'axios';

const API_URL = 'https://api.thetrickbook.com/api/listings';

// Get user's trick lists
export async function getUserTrickLists(userId, token) {
  try {
    const response = await axios.get(API_URL, {
      params: { userId },
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Create a new trick list
export async function createTrickList(title, userId, token) {
  const response = await axios.post(
    API_URL,
    { title, userId },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Delete a trick list
export async function deleteTrickList(listId, token) {
  const response = await axios.delete(`${API_URL}/${listId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Update trick list name
export async function updateTrickList(trickListId, name, token) {
  const response = await axios.put(
    `${API_URL}/edit`,
    { trickListId, name },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get public trick lists (homie lists)
// Note: This will need backend updates to support filtering by isPublic
export async function getPublicTrickLists(token) {
  try {
    const response = await axios.get(`${API_URL}/public`, {
      headers: token ? { 'x-auth-token': token } : {},
    });
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Toggle trick list public/private status
// Note: This will need backend updates
export async function toggleTrickListPublic(trickListId, isPublic, token) {
  const response = await axios.put(
    `${API_URL}/${trickListId}/visibility`,
    { isPublic },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get trick list count for user
export async function getTrickListCount(userId, token) {
  try {
    const response = await axios.get(`${API_URL}/countTrickLists`, {
      params: { userId },
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return { totalTrickLists: 0 };
  }
}

// ============ Individual Trick Operations ============

const TRICK_API_URL = 'https://api.thetrickbook.com/api/listing';

// Get all tricks in a list
export async function getTricksInList(listId, token) {
  try {
    const response = await axios.get(TRICK_API_URL, {
      params: { list_id: listId },
      headers: {
        'x-auth-token': token,
      },
    });
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Add a trick to a list
// Optional trickipediaId links the trick back to the Trickipedia entry
export async function addTrickToList(listId, trickData, token) {
  const body = {
    list_id: listId,
    name: trickData.name,
    link: trickData.link || '',
    notes: trickData.notes || '',
    checked: 'To Do', // String value matching mobile app format
  };

  // Include trickipediaId if provided (for linking back to Trickipedia)
  if (trickData.trickipediaId) {
    body.trickipediaId = trickData.trickipediaId;
  }

  const response = await axios.put(TRICK_API_URL, body, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Add a trick from Trickipedia to a list (convenience function)
// Automatically includes trickipediaId for "View Tutorial" linking
export async function addTrickFromTrickipedia(listId, trickipediaTrick, token) {
  return addTrickToList(
    listId,
    {
      name: trickipediaTrick.name,
      link: trickipediaTrick.videoUrl || trickipediaTrick.url || '',
      notes: `From Trickipedia: ${trickipediaTrick.category} - ${trickipediaTrick.difficulty}`,
      trickipediaId: trickipediaTrick._id,
    },
    token,
  );
}

// Edit a trick
export async function editTrick(trickId, trickData, token) {
  const response = await axios.put(
    `${TRICK_API_URL}/edit`,
    {
      trickId,
      name: trickData.name,
      link: trickData.link || '',
      notes: trickData.notes || '',
    },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Toggle trick completion status
export async function updateTrickStatus(trickId, checked, token) {
  const response = await axios.put(
    `${TRICK_API_URL}/update`,
    {
      _id: trickId,
      checked,
    },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Delete a trick
export async function deleteTrick(trickId, token) {
  const response = await axios.delete(`${TRICK_API_URL}/${trickId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}
