// `pages/_app.js`
import '../styles/global.css';
import 'material-icons/iconfont/material-icons.css';
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
  }