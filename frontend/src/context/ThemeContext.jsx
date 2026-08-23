import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const THEMES = {
    emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },
    blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },
    indigo: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
    },
    rose: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
    },
    amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    }
};

const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `${r} ${g} ${b}`;
};

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState(() => {
        return localStorage.getItem('doctor_theme') || 'emerald';
    });

    useEffect(() => {
        const palette = THEMES[themeName] || THEMES.emerald;
        const root = document.documentElement;
        
        Object.entries(palette).forEach(([shade, color]) => {
            root.style.setProperty(`--color-theme-${shade}`, hexToRgb(color));
        });

        localStorage.setItem('doctor_theme', themeName);
    }, [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName, availableThemes: Object.keys(THEMES), THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};
