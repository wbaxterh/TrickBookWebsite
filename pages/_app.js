// pages/_app.js
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/global.css';
import '../styles/tokens/blog.css';
import 'material-icons/iconfont/material-icons.css';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { AuthProvider } from '../auth/AuthContext';
import { CategoryProvider } from '../auth/CategoryContext';
import Layout from '../components/layout';
import PostHogProvider from '../components/PostHogProvider';
import { ThemeProvider } from '../components/theme-provider';
import { ToastProvider } from '../components/ui/toast';
import muiTheme from '../config/theme';
import nextI18NextConfig from '../next-i18next.config';

// Locales that render right-to-left (kept in sync with pages/_document.js).
const RTL_LOCALES = ['ar'];

function App({ Component, pageProps: { session, ...pageProps } }) {
  const { locale } = useRouter();

  // _document.js sets lang/dir on the initial server render; this keeps them in
  // sync when the locale changes through client-side navigation.
  useEffect(() => {
    const lang = locale || 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
  }, [locale]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <MuiThemeProvider theme={muiTheme}>
        <SessionProvider session={session}>
          <AuthProvider>
            <PostHogProvider>
              <CategoryProvider>
                <ToastProvider>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </ToastProvider>
              </CategoryProvider>
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
              )}
            </PostHogProvider>
          </AuthProvider>
        </SessionProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

// Passing the config as the second argument keeps translations working (with
// English fallbacks) on pages that don't call serverSideTranslations yet.
export default appWithTranslation(App, nextI18NextConfig);
