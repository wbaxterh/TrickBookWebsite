// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";

export default NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				console.log("Authorize function called with credentials:", credentials);

				try {
					const response = await axios.post(`${baseUrl}/api/auth`, {
						email: credentials.email,
						password: credentials.password,
					});

					const user = response.data;
					console.log("User authenticated:", user);

					return {
						id: user.userId,
						email: credentials.email,
						name: user.name,
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
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.id;
			session.user.email = token.email;
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
});
