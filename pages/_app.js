// pages/_app.js
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.css";
import "material-icons/iconfont/material-icons.css";
import { AuthProvider } from "../auth/AuthContext";
import Layout from "../components/layout";

export default function App({ Component, pageProps }) {
	return (
		<AuthProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</AuthProvider>
	);
}
