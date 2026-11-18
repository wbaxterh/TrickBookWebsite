export function newsletterCount(value) {
  return Number.isInteger(value) && value >= 0 ? value.toLocaleString() : '—';
}

export function newsletterRate(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(value)
    : '—';
}

export function newsletterDestination(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return {
      href: url.href,
      label: `${url.hostname.replace(/^www\./, '')}${url.pathname === '/' ? '' : url.pathname}`,
    };
  } catch {
    return null;
  }
}
