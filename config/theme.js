import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#FFF000", // Custom primary color
		},
		secondary: {
			main: "#1f1f1f", // Custom primary color
		},
	},
	typography: {
		h1: {
			fontSize: "4em",
		},
		// In Chinese and Japanese the characters are usually larger,
		// so a smaller fontsize may be appropriate.
		fontSize: 14,
	},
});

export default theme;
