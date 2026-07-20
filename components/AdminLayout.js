import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdminNav from './AdminNav';

// Scoped dark MUI theme for the whole admin area. The app-wide MUI theme
// (config/theme.js) is a light palette, which renders Typography
// color="textSecondary", default Chips, TextFields, etc. as dark-on-dark on
// the site's dark background. Wrapping every admin page in this dark theme
// makes MUI components readable and consistent without touching public pages.
const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FCF150' }, // brand yellow
    secondary: { main: '#1f1f1f' },
    background: { default: '#0b0d12', paper: '#171c26' },
    text: { primary: '#edf2f7', secondary: '#a7b1c2' },
    divider: '#2a2f3a',
  },
  typography: { fontSize: 14 },
});

// Standard chrome for every admin page: the shared AdminNav + a consistent
// container. The site header/footer come from the global Layout, so pages
// must NOT render their own <Header/> (that duplicated the site nav).
export default function AdminLayout({ children }) {
  return (
    <ThemeProvider theme={adminTheme}>
      <div className="container m-4 mt-5 pt-3" style={{ color: '#edf2f7' }}>
        <AdminNav />
        {children}
      </div>
    </ThemeProvider>
  );
}
