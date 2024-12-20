// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import Cookies from "js-cookie"; // Importing js-cookie to manage cookies
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000"; // || process.env.NEXT_PUBLIC_BASE_URL

export default NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: "openid email profile",
				},
			},
			profile: async (profile, tokens) => {
				// Log tokens to confirm presence of id_token
				console.log("Tokens:", tokens);

				try {
					const response = await axios.post(`${baseUrl}/api/auth/google-auth`, {
						tokenId: tokens.id_token,
					});

					const jwtToken = response.data;
					console.log("JWT Token from backend:", jwtToken);

					return {
						id: profile.sub, // Ensure you have a unique identifier
						email: profile.email,
						name: profile.name,
						image: profile.picture,
						jwtToken: jwtToken,
					};
				} catch (error) {
					console.error("Error during Google authentication:", error);
					throw new Error("Failed to authenticate with Google.");
				}
			},
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				// console.log("Authorize function called with credentials:", credentials);

				try {
					const response = await axios.post(`${baseUrl}/api/auth`, {
						email: credentials.email,
						password: credentials.password,
					});

					const jwtToken = response.data;
					// console.log("User hasJWT token:", jwtToken);
					// Set the JWT token as a cookie
					Cookies.set("token", jwtToken);

					return {
						email: credentials.email,
						jwtToken: jwtToken,
					};
				} catch (error) {
					console.error(
						"Error in authorize function:",
						error.response?.data || error.message
					);
					throw new Error("Invalid email or password");
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.jwtToken = user.jwtToken; // Store the JWT token in the token object
			}
			return token;
		},
		async session({ session, token }) {
			// console.log("token from async session == ", token);
			// session.user.id = token.id;
			session.user.email = token.email;
			session.user.jwtToken = token.jwtToken; // Include the JWT token in the session object

			// Set the JWT token as a cookie
			Cookies.set("token", token.jwtToken);

			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
});
