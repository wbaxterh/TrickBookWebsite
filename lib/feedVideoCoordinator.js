// One feed stream may load at a time, including when two short cards share a viewport.
export function createFeedVideoCoordinator() {
  const entries = new Map();
  let requested = null;
  let visible = true;

  const selectAutomatic = () => {
    let winner = null;
    let best = 0;
    for (const [id, entry] of entries) {
      if (entry.automatic && entry.score > best) {
        winner = id;
        best = entry.score;
      }
    }
    return winner;
  };

  const notify = () => {
    if (!(entries.get(requested)?.score > 0)) requested = null;
    const winner = visible ? requested || selectAutomatic() : null;
    // Notify deactivations first so a handoff never intentionally keeps two loaders alive.
    for (const [id, entry] of entries) {
      if (entry.active && id !== winner) {
        entry.active = false;
        entry.onChange(false);
      }
    }
    const next = entries.get(winner);
    if (next && !next.active) {
      next.active = true;
      next.onChange(true);
    }
  };

  return {
    register(id, onChange) {
      entries.set(id, { onChange, score: 0, automatic: false, active: false });
    },
    update(id, score, automatic) {
      const entry = entries.get(id);
      if (!entry) return;
      entry.score = score;
      entry.automatic = automatic;
      notify();
    },
    activate(id) {
      const entry = entries.get(id);
      if (!entry) return;
      entry.score = Math.max(entry.score, 0.001);
      requested = id;
      notify();
    },
    setVisible(value) {
      visible = value;
      notify();
    },
    unregister(id) {
      entries.delete(id);
      if (requested === id) requested = null;
      notify();
    },
  };
}
