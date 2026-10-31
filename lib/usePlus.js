import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { getUsage } from './apiPayments';

// Plus status for the signed-in user. /spotlists/usage is the source of truth
// because its isPremium honours the backend's hasPremiumAccess (admin override,
// canceled-but-still-paid-through). Cached per tab so the header doesn't flicker.
const cacheKey = (userId) => `tb:plus:${userId}`;
// Lets the always-mounted header pick up a status change made on another page.
const CHANGED_EVENT = 'tb:plus-changed';

function readCache(userId) {
  if (!userId) return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKey(userId));
    return raw === null ? null : raw === '1';
  } catch (_err) {
    return null;
  }
}

export function clearPlusCache(userId) {
  try {
    window.sessionStorage.removeItem(cacheKey(userId));
  } catch (_err) {}
}

export default function usePlus() {
  const { loggedIn, token, userId } = useContext(AuthContext);
  const [isPlus, setIsPlus] = useState(false);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token || !userId) return null;
    try {
      const data = await getUsage(token);
      const plus = Boolean(data?.isPremium);
      setIsPlus(plus);
      setUsage(data);
      try {
        window.sessionStorage.setItem(cacheKey(userId), plus ? '1' : '0');
      } catch (_err) {}
      window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: plus }));
      return data;
    } catch (_err) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      setIsPlus(false);
      setLoading(false);
      return;
    }
    const cached = readCache(userId);
    if (cached !== null) {
      setIsPlus(cached);
      setLoading(false);
      return;
    }
    refresh();
  }, [loggedIn, userId, refresh]);

  useEffect(() => {
    const onChanged = (event) => setIsPlus(Boolean(event.detail));
    window.addEventListener(CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(CHANGED_EVENT, onChanged);
  }, []);

  return { isPlus, usage, loading, refresh };
}
