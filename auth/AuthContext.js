import React, { createContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Cookies from "js-cookie"; // Importing js-cookie to manage cookies

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const { data: session, status } = useSession();
	const [loggedIn, setLoggedIn] = useState(null);
	const [token, setToken] = useState(null);
	const [email, setEmail] = useState(null);

	useEffect(() => {
		console.log("Session data:", session);
		if (status === "loading") {
			setLoggedIn(null); // Loading state
		} else if (status === "authenticated") {
			setLoggedIn(true);
			setToken(session?.user?.token || null);
			setEmail(session?.user?.email || null);
		} else {
			const initialToken = localStorage.getItem("userToken");
			const initialEmail = localStorage.getItem("userEmail");
			if (initialToken) {
				setLoggedIn(true);
				setToken(initialToken);
				setEmail(initialEmail);
			} else {
				setLoggedIn(false);
			}
		}
	}, [status, session]);

	useEffect(() => {
		if (token) {
			localStorage.setItem("userToken", token);
			Cookies.set("token", token);
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

		// Clear cookies
		Cookies.remove("next-auth.session-token"); // This name might vary depending on your NextAuth configuration
		Cookies.remove("next-auth.csrf-token");

		// Sign out from NextAuth
		signOut({ callbackUrl: "/login" }); // Redirect to the home page after sign-out
	};

	return (
		<AuthContext.Provider value={{ loggedIn, token, logIn, logOut, email }}>
			{children}
		</AuthContext.Provider>
	);
}
