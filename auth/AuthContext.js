import React, { createContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie"; // Importing js-cookie to manage cookies

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const { data: session, status } = useSession();
	const [loggedIn, setLoggedIn] = useState(null);
	const [token, setToken] = useState(null);
	const [email, setEmail] = useState(null);
	const [role, setRole] = useState(null);

	useEffect(() => {
		console.log("Session data:", session);
		if (status === "loading") {
			setLoggedIn(null); // Loading state
		} else if (status === "authenticated") {
			console.log("User is authenticated");
			console.log("Session JWT token: ", session?.user?.jwtToken?.token);

			const jwtToken = session?.user?.jwtToken?.token || Cookies.get("token");

			if (jwtToken) {
				try {
					const profileInfo = jwt.verify(jwtToken.toString(), "jwtPrivateKey"); // Ensure the correct secret key is used
					console.log("Token data == ", profileInfo);
					setLoggedIn(true);
					setToken(jwtToken);
					setEmail(session?.user?.email || null);
					setRole(profileInfo.role || null); // Assuming the role is stored in the JWT
				} catch (err) {
					console.error("Error verifying JWT:", err);
					setLoggedIn(false);
					setToken(null);
					setEmail(null);
					setRole(null);
				}
			} else {
				setLoggedIn(false);
				setToken(null);
				setEmail(null);
				setRole(null);
			}
		} else {
			const initialToken = Cookies.get("token");
			const initialEmail = localStorage.getItem("userEmail");
			if (initialToken) {
				try {
					const profileInfo = jwt.verify(initialToken, "jwtPrivateKey");
					console.log("initial Token data == ", profileInfo);
					setLoggedIn(true);
					setToken(initialToken);
					setEmail(initialEmail);
					setRole(profileInfo.role || null);
				} catch (err) {
					console.error("Error verifying JWT from cookie:", err);
					setLoggedIn(false);
					setToken(null);
					setEmail(null);
					setRole(null);
				}
			} else {
				setLoggedIn(false);
				setToken(null);
				setEmail(null);
				setRole(null);
			}
		}
	}, [status, session]);

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
		setRole(null);
		localStorage.removeItem("userToken");
		localStorage.removeItem("userEmail");

		// Clear cookies
		Cookies.remove("next-auth.session-token"); // This name might vary depending on your NextAuth configuration
		Cookies.remove("next-auth.csrf-token");
		Cookies.remove("token");

		// Sign out from NextAuth
		signOut({ callbackUrl: "/login" }); // Redirect to the home page after sign-out
	};

	return (
		<AuthContext.Provider
			value={{ loggedIn, token, logIn, logOut, email, role }}
		>
			{children}
		</AuthContext.Provider>
	);
}
