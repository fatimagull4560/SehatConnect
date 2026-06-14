import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { buildTheme } from '../theme';

interface ColorModeContextType { mode: 'light' | 'dark'; toggleMode: () => void; }
const ColorModeContext = createContext<ColorModeContextType>({ mode: 'light', toggleMode: () => {} });

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem('sehat_theme_mode') as 'light' | 'dark' | null;
  const [mode, setMode] = useState<'light' | 'dark'>(stored ?? 'light');

  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('sehat_theme_mode', next);
      return next;
    });
  };

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => useContext(ColorModeContext);
