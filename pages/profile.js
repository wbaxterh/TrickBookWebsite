import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';

// This page now redirects to either the public profile or settings
export default function ProfileRedirect() {
  const router = useRouter();
  const { token, loggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!token && !loggedIn) {
      router.replace('/login');
      return;
    }

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.userId) {
        // Redirect to public profile by default
        router.replace(`/profile/${decoded.userId}`);
      } else {
        router.replace('/login');
      }
    }
  }, [token, loggedIn, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
  );
}
