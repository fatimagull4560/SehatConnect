import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export function buildTheme(mode: 'light' | 'dark') {
  return responsiveFontSizes(createTheme({
    palette: {
      mode,
      primary: { main: '#1565C0', light: '#1E88E5', dark: '#0D47A1' },
      secondary: { main: '#00897B', light: '#26A69A', dark: '#00695C' },
      success: { main: '#2E7D32', light: '#43A047', dark: '#1B5E20' },
      info: { main: '#0277BD', light: '#0288D1', dark: '#01579B' },
      warning: { main: '#E65100', light: '#F57C00', dark: '#BF360C' },
      error: { main: '#C62828', light: '#E53935', dark: '#B71C1C' },
      ...(mode === 'light' ? {
        background: { default: '#EBF0FA', paper: '#FFFFFF' },
        text: { primary: '#0D1B3E', secondary: '#4A5568' },
      } : {
        background: { default: '#071022', paper: '#0D1E3D' },
        text: { primary: '#E8F0FE', secondary: '#90A4AE' },
      }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 }, h2: { fontWeight: 700 },
      h3: { fontWeight: 600 }, h4: { fontWeight: 600 },
      h5: { fontWeight: 600 }, h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' as const },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: false },
        styleOverrides: {
          root: {
            borderRadius: 10, padding: '8px 20px',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'translateY(-1px)' },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
            boxShadow: '0 4px 15px rgba(21,101,192,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
              boxShadow: '0 6px 20px rgba(21,101,192,0.5)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
            boxShadow: '0 4px 15px rgba(0,137,123,0.4)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
        },
      },
      MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
      MuiTextField: { defaultProps: { variant: 'outlined' as const, size: 'small' as const } },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 10, margin: '2px 8px', transition: 'all 0.2s ease' },
        },
      },
    },
  }));
}

export default buildTheme('light');
