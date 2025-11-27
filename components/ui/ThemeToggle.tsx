'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-foreground"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-accent transition-all duration-300 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-primary transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
                />
            </div>
        </button>
    );
}
