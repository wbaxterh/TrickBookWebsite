// pages/_app.js
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/global.css';
import '../styles/tokens/blog.css';
import 'material-icons/iconfont/material-icons.css';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../auth/AuthContext';
import { CategoryProvider } from '../auth/CategoryContext';
import Layout from '../components/layout';
import PostHogProvider from '../components/PostHogProvider';
import { ThemeProvider } from '../components/theme-provider';
import { ToastProvider } from '../components/ui/toast';
import muiTheme from '../config/theme';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <MuiThemeProvider theme={muiTheme}>
        <PostHogProvider>
          <SessionProvider session={session}>
            <AuthProvider>
              <CategoryProvider>
                <ToastProvider>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </ToastProvider>
              </CategoryProvider>
            </AuthProvider>
          </SessionProvider>
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
        </PostHogProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}
