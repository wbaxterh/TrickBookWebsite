import { Bell, Check, Loader2 } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { trackEventSaved } from '../../lib/analytics';
import { getSavedEventIds, saveEvent, unsaveEvent } from '../../lib/apiEvents';
import { Button } from '../ui/button';

const STORAGE_KEY = 'trickbook:saved-events';

function readSavedIds() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch (_error) {
    return new Set();
  }
}

function writeSavedId(eventId, saved) {
  const ids = readSavedIds();
  if (saved) ids.add(eventId);
  else ids.delete(eventId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export default function EventSaveButton({ event }) {
  const { loggedIn, token } = useContext(AuthContext);
  const eventId = String(event._id || event.slug);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSaved(readSavedIds().has(eventId));
  }, [eventId]);

  useEffect(() => {
    if (!loggedIn || !token) return;
    let active = true;
    const reconcile = async () => {
      const localIds = [...readSavedIds()];
      await Promise.allSettled(localIds.map((id) => saveEvent(id, token)));
      const accountIds = await getSavedEventIds(token);
      if (!active) return;
      const mergedIds = new Set([...localIds, ...accountIds.map(String)]);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...mergedIds]));
      setSaved(mergedIds.has(eventId));
    };
    reconcile().catch(() => {});
    return () => {
      active = false;
    };
  }, [eventId, loggedIn, token]);

  const toggle = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setError('');
    writeSavedId(eventId, nextSaved);
    trackEventSaved(event, nextSaved, loggedIn ? 'account' : 'browser');

    if (!loggedIn || !token) return;
    setBusy(true);
    try {
      if (nextSaved) await saveEvent(eventId, token);
      else await unsaveEvent(eventId, token);
    } catch (_error) {
      setSaved(!nextSaved);
      writeSavedId(eventId, !nextSaved);
      setError('Could not update your account save. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full mt-2"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4 mr-2 text-emerald-500" />
        ) : (
          <Bell className="h-4 w-4 mr-2" />
        )}
        {saved ? 'Event saved' : 'Save event'}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {saved && loggedIn === false && (
        <p className="mt-2 text-xs text-muted-foreground">
          Saved in this browser. Sign in to keep it with your account.
        </p>
      )}
    </div>
  );
}
