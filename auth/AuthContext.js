import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [token, setToken] = useState(null); // Initializing token state
	const [email, setEmail] = useState(null);

	// Run once when the component mounts to load the initial state from sessionStorage
	useEffect(() => {
		const initialToken = sessionStorage.getItem("userToken");
		const initialEmail = sessionStorage.getItem("userEmail");
		if (initialToken) {
			setLoggedIn(true);
			setToken(initialToken);
			setEmail(initialEmail);
		}
	}, []);

	// Update sessionStorage whenever token or email changes
	useEffect(() => {
		if (token) {
			sessionStorage.setItem("userToken", token);
		} else {
			sessionStorage.removeItem("userToken");
		}

		if (email) {
			sessionStorage.setItem("userEmail", email);
		} else {
			sessionStorage.removeItem("userEmail");
		}
	}, [token, email]);

	const logIn = (newToken, email) => {
		setLoggedIn(true);
		setToken(newToken);
		setEmail(email);
		// Optionally store token in localStorage for persistence
		// localStorage.setItem("userToken", newToken);
	};

	const logOut = () => {
		setLoggedIn(false);
		setToken(null);
		setEmail(null);
		// Remove token from localStorage
		// localStorage.removeItem("userToken");
	};

	const value = {
		loggedIn,
		token,
		logIn,
		logOut,
		email,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
