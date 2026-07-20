import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';
};

const API_BASE_URL = () => `${getBaseUrl()}/api/payments`;

/**
 * Create a Stripe checkout session for TrickBook Plus subscription
 * Returns a session ID to redirect to Stripe checkout
 */
export async function createCheckoutSession(token) {
  const response = await axios.post(
    `${API_BASE_URL()}/create-checkout-session`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

/**
 * Get the current user's subscription status
 */
export async function getSubscription(token) {
  const response = await axios.get(`${API_BASE_URL()}/subscription`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

/**
 * Cancel the current subscription (at period end)
 */
export async function cancelSubscription(token) {
  const response = await axios.post(
    `${API_BASE_URL()}/cancel-subscription`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(token) {
  const response = await axios.post(
    `${API_BASE_URL()}/reactivate-subscription`,
    {},
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

/**
 * Get spot lists usage for the current user
 */
export async function getUsage(token) {
  const response = await axios.get(`${getBaseUrl()}/api/spotlists/usage`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

/**
 * Admin: Toggle subscription override for testing
 * @param {string} token - Auth token
 * @param {string|null} override - "free", "premium", or null to clear
 */
export async function toggleAdminSubscription(token, override) {
  const response = await axios.post(
    `${API_BASE_URL()}/admin/toggle-subscription`,
    { override },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}
