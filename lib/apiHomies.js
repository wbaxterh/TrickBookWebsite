import axios from 'axios';

const API_BASE_URL = 'https://api.thetrickbook.com/api/users';

// Toggle network visibility (discoverable to other users)
export async function toggleNetwork(userId, enabled, token) {
  const response = await axios.put(
    `${API_BASE_URL}/${userId}/network`,
    { network: enabled },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get discoverable users (users with network enabled)
export async function getDiscoverableUsers(token) {
  const response = await axios.get(`${API_BASE_URL}/discoverable`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Send homie request to another user
export async function sendHomieRequest(targetUserId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/${targetUserId}/homie-request`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Accept a homie request
export async function acceptHomieRequest(requesterId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/${requesterId}/accept-homie`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Reject a homie request
export async function rejectHomieRequest(requesterId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/${requesterId}/reject-homie`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

// Get my homies list
export async function getMyHomies(token) {
  const response = await axios.get(`${API_BASE_URL}/homies`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get pending homie requests (both sent and received)
export async function getPendingRequests(token) {
  const response = await axios.get(`${API_BASE_URL}/homie-requests`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Remove a homie
export async function removeHomie(homieId, token) {
  const response = await axios.delete(`${API_BASE_URL}/homie/${homieId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

// Get user's network status
export async function getNetworkStatus(token) {
  const response = await axios.get(`${API_BASE_URL}/network-status`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}
