// next-i18next.config.js
// Shared i18n config for Next.js locale routing and next-i18next translations.
// English is the default locale and keeps unprefixed URLs (e.g. /spots).
// All other locales are served under a sub-path (e.g. /es/spots).
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'es',
      'pt-BR',
      'fr',
      'de',
      'it',
      'zh-CN',
      'zh-TW',
      'ja',
      'ko',
      'hi',
      'ar',
      'ru',
    ],
    // Redirect first-time visitors based on Accept-Language / NEXT_LOCALE cookie.
    localeDetection: true,
  },
  fallbackLng: 'en',
  // Reload locale files without restarting the dev server.
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
