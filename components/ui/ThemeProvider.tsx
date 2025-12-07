'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    theme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Always set dark theme
        const root = document.documentElement;
        root.setAttribute('data-theme', 'dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
