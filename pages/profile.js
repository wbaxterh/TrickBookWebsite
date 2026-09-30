import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';

// This page now redirects to either the public profile or settings
export default function ProfileRedirect() {
  const router = useRouter();
  const { loggedIn, userId } = useContext(AuthContext);

  useEffect(() => {
    // NextAuth briefly reports an indeterminate state while an SSO callback is
    // hydrating. Do not mistake that state for a signed-out user and bounce the
    // rider back to the login page.
    if (loggedIn === null) return;

    if (loggedIn === false) {
      router.replace('/login');
      return;
    }

    if (userId) {
      // Redirect to the authenticated rider's public profile by default.
      const query = router.query.kaori === 'open' ? '?kaori=open' : '';
      router.replace(`/profile/${userId}${query}`);
    }
  }, [loggedIn, router, router.query.kaori, userId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
  );
}
