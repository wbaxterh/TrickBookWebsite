import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [loggedIn, setLoggedIn] = useState(null); // null means loading
	const [token, setToken] = useState(null);
	const [email, setEmail] = useState(null);

	useEffect(() => {
		const initialToken = localStorage.getItem("userToken");
		const initialEmail = localStorage.getItem("userEmail");
		if (initialToken) {
			setLoggedIn(true);
			setToken(initialToken);
			setEmail(initialEmail);
		} else {
			setLoggedIn(false);
		}
	}, []);

	useEffect(() => {
		if (token) {
			localStorage.setItem("userToken", token);
		} else {
			localStorage.removeItem("userToken");
		}

		if (email) {
			localStorage.setItem("userEmail", email);
		} else {
			localStorage.removeItem("userEmail");
		}
	}, [token, email]);

	const logIn = (newToken, newEmail) => {
		setLoggedIn(true);
		setToken(newToken);
		setEmail(newEmail);
		localStorage.setItem("userToken", newToken);
		localStorage.setItem("userEmail", newEmail);
	};

	const logOut = () => {
		setLoggedIn(false);
		setToken(null);
		setEmail(null);
		localStorage.removeItem("userToken");
		localStorage.removeItem("userEmail");
	};

	return (
		<AuthContext.Provider value={{ loggedIn, token, logIn, logOut, email }}>
			{children}
		</AuthContext.Provider>
	);
}
