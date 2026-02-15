import axios from 'axios';

const TRICKS_API_URL = 'https://api.thetrickbook.com/api/trickipedia';
const TRICK_IMAGE_API_URL = 'https://api.thetrickbook.com/api/trickImage';

// Get all tricks (with optional category filter)
export async function getSortedTricksData(category) {
  try {
    const response = await axios.get(TRICKS_API_URL);
    let allTricksData = response.data.map((trick) => {
      const { _id, name, category, difficulty, description, steps, images, videoUrl, source, url } =
        trick;
      return {
        id: _id,
        name,
        category,
        difficulty,
        description,
        steps,
        images,
        videoUrl,
        source,
        url,
      };
    });
    if (category) {
      allTricksData = allTricksData.filter((trick) => trick.category === category);
    }
    return allTricksData.sort((a, b) => a.name.localeCompare(b.name));
  } catch (_error) {
    return [];
  }
}

// Get a single trick by ID
export async function getTrickData(id) {
  try {
    const response = await axios.get(`${TRICKS_API_URL}/${id}`);
    return response.data;
  } catch (_error) {
    return null;
  }
}

// Create a new trick
export async function createTrick(trickData, token) {
  const response = await axios.post(TRICKS_API_URL, trickData, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Update an existing trick
export async function updateTrick(id, trickData, token) {
  const response = await axios.put(`${TRICKS_API_URL}/${id}`, trickData, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Delete a trick
export async function deleteTrick(id, token) {
  const response = await axios.delete(`${TRICKS_API_URL}/${id}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Upload a trick image
export async function uploadTrickImage(file, trickUrl, token) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(
    `${TRICK_IMAGE_API_URL}/upload?trickUrl=${encodeURIComponent(trickUrl)}`,
    formData,
    {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.imageUrl;
}

// Delete all images for a trick
export async function deleteTrickImages(trickUrl, token) {
  const response = await axios.delete(
    `${TRICK_IMAGE_API_URL}/delete-folder/${encodeURIComponent(trickUrl)}`,
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get tricks by category
export async function getTricksByCategory(category) {
  try {
    const response = await axios.get(`${TRICKS_API_URL}/category/${category}`);
    return response.data;
  } catch (_error) {
    return [];
  }
}

// Search tricks
export async function searchTricks(query, category = null, difficulty = null) {
  try {
    let url = `${TRICKS_API_URL}?search=${encodeURIComponent(query)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;

    const response = await axios.get(url);
    return response.data;
  } catch (_error) {
    return [];
  }
}
