// pages/api/auth/[...nextauth].js

import axios from 'axios';
import Cookies from 'js-cookie'; // Importing js-cookie to manage cookies
import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000';

function generateAppleClientSecret() {
  if (!process.env.APPLE_PRIVATE_KEY) return '';
  const privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  return jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: process.env.APPLE_TEAM_ID,
    subject: process.env.APPLE_WEB_SERVICE_ID,
    keyid: process.env.APPLE_KEY_ID,
  });
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      profile: async (profile, tokens) => {
        console.log('Tokens:', tokens);

        try {
          const response = await axios.post(`${baseUrl}/api/auth/google-auth`, {
            tokenId: tokens.id_token,
          });

          const jwtToken = response.data;
          console.log('JWT Token from backend:', jwtToken);

          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            jwtToken: jwtToken,
          };
        } catch (error) {
          console.error('Error during Google authentication:', error);
          throw new Error('Failed to authenticate with Google.');
        }
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_WEB_SERVICE_ID,
      clientSecret: generateAppleClientSecret(),
      profile: async (profile, tokens) => {
        try {
          const response = await axios.post(`${baseUrl}/api/auth/apple-auth`, {
            identityToken: tokens.id_token,
            email: profile.email || null,
            fullName: profile.name
              ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
              : null,
          });

          const jwtToken = response.data;

          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name
              ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
              : null,
            jwtToken: jwtToken,
          };
        } catch (error) {
          console.error('Error during Apple authentication:', error);
          throw new Error('Failed to authenticate with Apple.');
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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
          Cookies.set('token', jwtToken);

          return {
            email: credentials.email,
            jwtToken: jwtToken,
          };
        } catch (error) {
          console.error('Error in authorize function:', error.response?.data || error.message);
          throw new Error('Invalid email or password');
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
      Cookies.set('token', token.jwtToken);

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
