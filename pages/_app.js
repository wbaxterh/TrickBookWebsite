// pages/_app.js
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.css";
import "material-icons/iconfont/material-icons.css";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../auth/AuthContext";
import { CategoryProvider } from "../auth/CategoryContext";
import { ThemeProvider } from "../components/theme-provider";
import muiTheme from "../config/theme";
import Layout from "../components/layout";
import { ToastProvider } from "../components/ui/toast";

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem
			disableTransitionOnChange
		>
			<MuiThemeProvider theme={muiTheme}>
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
			</MuiThemeProvider>
		</ThemeProvider>
	);
}
