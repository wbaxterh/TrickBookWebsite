// `pages/_app.js`
// add bootstrap css 
import 'bootstrap/dist/css/bootstrap.css'
import '../styles/global.css';
import 'material-icons/iconfont/material-icons.css';
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
  }