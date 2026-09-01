import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.[^/]+$/;
const SUPPORTED_LOCALES = [
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
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    PUBLIC_FILE.test(pathname) ||
    SUPPORTED_LOCALES.some(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    )
  ) {
    return NextResponse.next();
  }

  const localizedUrl = request.nextUrl.clone();
  localizedUrl.pathname = `/en${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(localizedUrl);
}

export const config = {
  matcher: '/:path*',
};
