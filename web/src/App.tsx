import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import StoresList from './pages/StoresList';
import StoreDetail from './pages/StoreDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    // Remove focus outline after mouse click for all buttons
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus:not(:focus-visible)': {
            outline: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
    // More visible hover for IconButtons
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/stores" replace />} />
              <Route path="/stores" element={<StoresList />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
