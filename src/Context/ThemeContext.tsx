import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { inputsCustomizations } from '../shared-theme/customizations/inputs';
import { dataDisplayCustomizations } from '../shared-theme/customizations/dataDisplay';
import { feedbackCustomizations } from '../shared-theme/customizations/feedback';
import { navigationCustomizations } from '../shared-theme/customizations/navigation';
import { surfacesCustomizations } from '../shared-theme/customizations/surfaces';
import { typography, shadows, shape } from '../shared-theme/themePrimitives';

type ThemeContextType = {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // Light mode colors
                    primary: {
                        main: '#1976d2',
                        light: '#42a5f5',
                        dark: '#1565c0',
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: '#9c27b0',
                        light: '#ba68c8',
                        dark: '#7b1fa2',
                        contrastText: '#ffffff',
                    },
                    background: {
                        default: '#f8f9fa',
                        paper: '#ffffff',
                    },
                    text: {
                        primary: 'rgba(0, 0, 0, 0.87)',
                        secondary: 'rgba(0, 0, 0, 0.6)',
                    },
                }
                : {
                    // Dark mode colors
                    primary: {
                        main: '#90caf9',
                        light: '#e3f2fd',
                        dark: '#42a5f5',
                        contrastText: 'rgba(0, 0, 0, 0.87)',
                    },
                    secondary: {
                        main: '#ce93d8',
                        light: '#f3e5f5',
                        dark: '#ab47bc',
                        contrastText: 'rgba(0, 0, 0, 0.87)',
                    },
                    background: {
                        default: '#0a1929',
                        paper: '#1a2027',
                    },
                    text: {
                        primary: '#ffffff',
                        secondary: 'rgba(255, 255, 255, 0.7)',
                    },
                }),
        },
        typography,
        shadows,
        shape,
        components: {
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#1a2027' : '#ffffff',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: mode === 'dark' ? '#0a1929' : '#f8f9fa',
                        transition: 'background-color 0.3s ease-in-out',
                    },
                },
            },
        },
    }), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
}; 