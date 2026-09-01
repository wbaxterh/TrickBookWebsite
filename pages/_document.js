// pages/_document.js
import { Head, Html, Main, NextScript } from 'next/document';

// Locales that render right-to-left. Full RTL polish is tracked in issue #8 (Phase 3).
const RTL_LOCALES = ['ar'];

export default function Document({ locale }) {
  const lang = locale || 'en';
  const dir = RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';

  return (
    <Html lang={lang} dir={dir}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
