import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MindMap from './pages/map/index.jsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    }
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 4,
        },
      },
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MindMap />
    </ThemeProvider>
  );
}

export default App; 