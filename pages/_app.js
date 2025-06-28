// pages/_app.js
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.css";
import "material-icons/iconfont/material-icons.css";
import { ThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../auth/AuthContext";
import { CategoryProvider } from "../auth/CategoryContext";
import theme from "../config/theme"; // Adjust the path as necessary
import Layout from "../components/layout";

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}) {
	return (
		<ThemeProvider theme={theme}>
			<SessionProvider session={session}>
				<AuthProvider>
					<CategoryProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</CategoryProvider>
				</AuthProvider>
			</SessionProvider>
		</ThemeProvider>
	);
}
