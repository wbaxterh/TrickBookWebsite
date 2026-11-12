export const KAORI_OPEN_EVENT = 'trickbook:open-kaori';
export const KAORI_PREVIEW_DISMISSED_KEY = 'tb_kaori_preview_dismissed';

export function allowsKaoriPromotion(pathname) {
  return !/^\/(media|contact|login|signup|forgot-password|reset-password|settings|messages|admin|kaori-live)(\/|$)/.test(
    pathname,
  );
}

export function requestKaoriOpen(trigger) {
  window.dispatchEvent(new CustomEvent(KAORI_OPEN_EVENT, { detail: { trigger } }));
}

export function restoreKaoriFocus(preferred, fallback) {
  const fromFooter = preferred?.dataset?.kaoriLauncher === 'footer';
  const candidates = [
    preferred,
    fromFooter ? fallback : null,
    document.querySelector('[data-kaori-launcher="header"]'),
    fallback,
  ];
  candidates
    .find((node) => node?.isConnected && node.getClientRects().length > 0)
    ?.focus({ preventScroll: !fromFooter });
}
