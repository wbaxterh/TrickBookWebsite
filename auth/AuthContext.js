import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [token, setToken] = useState(null); // Initializing token state
	const [email, setEmail] = useState(null);

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
