import axios from "axios";

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return process.env.NEXT_PUBLIC_BASE_URL || "https://api.thetrickbook.com";
	}
	return process.env.NEXT_PUBLIC_BASE_URL || "https://api.thetrickbook.com";
};

const API_BASE_URL = () => `${getBaseUrl()}/api/payments`;

/**
 * Create a Stripe checkout session for TrickBook Plus subscription
 * Returns a session ID to redirect to Stripe checkout
 */
export async function createCheckoutSession(token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL()}/create-checkout-session`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error creating checkout session:", error);
		throw error;
	}
}

/**
 * Get the current user's subscription status
 */
export async function getSubscription(token) {
	try {
		const response = await axios.get(`${API_BASE_URL()}/subscription`, {
			headers: {
				"x-auth-token": token,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching subscription:", error);
		throw error;
	}
}

/**
 * Cancel the current subscription (at period end)
 */
export async function cancelSubscription(token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL()}/cancel-subscription`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error canceling subscription:", error);
		throw error;
	}
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(token) {
	try {
		const response = await axios.post(
			`${API_BASE_URL()}/reactivate-subscription`,
			{},
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error reactivating subscription:", error);
		throw error;
	}
}

/**
 * Get spot lists usage for the current user
 */
export async function getUsage(token) {
	try {
		const response = await axios.get(
			`${getBaseUrl()}/api/spotlists/usage`,
			{
				headers: {
					"x-auth-token": token,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching usage:", error);
		throw error;
	}
}
