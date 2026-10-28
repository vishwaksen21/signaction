'use client';

import { createContext, useContext, useLayoutEffect, useState, ReactNode } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [mounted, setMounted] = useState(false);

  // Synchronize document theme and Android system bar meta tag
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      
      // Remove both classes first
      html.classList.remove('dark', 'light');
      
      // Add the appropriate class
      html.classList.add(theme === 'dark' ? 'dark' : 'light');

      // Update Android system bar theme-color
      const color = theme === 'dark' ? '#090D16' : '#F8FAFC';
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    }
  }, [theme]);

  // Initialize theme from localStorage or system preference
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as ThemeType | null;

      const system: ThemeType = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      const initialTheme = saved ?? system;
      setTheme(initialTheme);
      setMounted(true);
      
      // Apply immediately
      const html = document.documentElement;
      html.classList.remove('dark', 'light');
      html.classList.add(initialTheme === 'dark' ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeType = prev === 'dark' ? 'light' : 'dark';

      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next);
        // Apply theme immediately
        const html = document.documentElement;
        html.classList.remove('dark', 'light');
        html.classList.add(next === 'dark' ? 'dark' : 'light');
      }

      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}