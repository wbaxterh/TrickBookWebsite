import Cookies from 'js-cookie'; // Importing js-cookie to manage cookies
import jwt from 'jsonwebtoken';
import { signOut, useSession } from 'next-auth/react';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [loggedIn, setLoggedIn] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (status === 'loading') {
      setLoggedIn(null); // Loading state
    } else if (status === 'authenticated') {
      const jwtToken = session?.user?.jwtToken?.token || Cookies.get('token');
      if (jwtToken) {
        try {
          const profileInfo = jwt.decode(jwtToken.toString()); // Decode JWT (verification happens on backend)
          if (profileInfo) {
            setLoggedIn(true);
            setToken(jwtToken);
            setEmail(session?.user?.email || null);
            setImageUri(profileInfo.imageUri || '/default-profile.png');
            setRole(profileInfo.role || null);
            setName(profileInfo.name || null);
            setUserId(profileInfo.userId || null);
          } else {
            throw new Error('Invalid token');
          }
        } catch (_err) {
          setLoggedIn(false);
          setToken(null);
          setEmail(null);
          setRole(null);
          setImageUri(null);
          setName(null);
          setUserId(null);
        }
      } else {
        setLoggedIn(false);
        setToken(null);
        setEmail(null);
        setRole(null);
        setUserId(null);
      }
    } else {
      const initialToken = Cookies.get('token');
      const initialEmail = localStorage.getItem('userEmail');
      if (initialToken) {
        try {
          const profileInfo = jwt.decode(initialToken); // Decode JWT (verification happens on backend)
          if (profileInfo) {
            setLoggedIn(true);
            setToken(initialToken);
            setEmail(initialEmail);
            setRole(profileInfo.role || null);
            setImageUri(profileInfo.imageUri || '/default-profile.png');
            setName(profileInfo.name || null);
            setUserId(profileInfo.userId || null);
          } else {
            throw new Error('Invalid token');
          }
        } catch (_err) {
          setLoggedIn(false);
          setToken(null);
          setEmail(null);
          setRole(null);
          setImageUri(null);
          setName(null);
          setUserId(null);
        }
      } else {
        setLoggedIn(false);
        setToken(null);
        setEmail(null);
        setRole(null);
        setImageUri(null);
        setName(null);
        setUserId(null);
      }
    }
    localStorage.setItem('userImageUri', imageUri);
    localStorage.setItem('userName', name);
  }, [status, session, imageUri, name]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
    }

    if (email) {
      localStorage.setItem('userEmail', email);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [token, email]);

  const logIn = (newToken, newEmail) => {
    setLoggedIn(true);
    setToken(newToken);
    setEmail(newEmail);
    if (newToken) {
      try {
        const decodedToken = jwt.decode(newToken);
        localStorage.setItem('userImageUri', decodedToken?.imageUri || null);
      } catch (_err) {}
    }
    localStorage.setItem('userEmail', newEmail);
  };

  const logOut = () => {
    setLoggedIn(false);
    setToken(null);
    setEmail(null);
    setRole(null);
    setImageUri(null);
    setUserId(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userImageUri');

    // Clear cookies
    Cookies.remove('next-auth.session-token'); // This name might vary depending on your NextAuth configuration
    Cookies.remove('next-auth.csrf-token');
    Cookies.remove('token');

    // Sign out from NextAuth
    signOut({ callbackUrl: '/login' }); // Redirect to the home page after sign-out
  };

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        token,
        logIn,
        logOut,
        email,
        role,
        imageUri,
        setImageUri,
        name,
        setName,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
