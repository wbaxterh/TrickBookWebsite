import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [token, setToken] = useState(null); // Initializing token state

	const logIn = (newToken) => {
		setLoggedIn(true);
		setToken(newToken);
		// Optionally store token in localStorage for persistence
		// localStorage.setItem("userToken", newToken);
	};

	const logOut = () => {
		setLoggedIn(false);
		setToken(null);
		// Remove token from localStorage
		// localStorage.removeItem("userToken");
	};

	const value = {
		loggedIn,
		token,
		logIn,
		logOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
