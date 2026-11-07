'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './Icons';

const STORAGE_KEY = 'ef-theme';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
    setTheme(next);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private mode. The class still applies.
    }
  };

  return (
    <button
      type="button"
      className={`ef-header__action ef-header__action--theme ${className}`}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      suppressHydrationWarning
    >
      <span className="ef-theme-icon ef-theme-icon--sun" aria-hidden="true">
        <SunIcon />
      </span>
      <span className="ef-theme-icon ef-theme-icon--moon" aria-hidden="true">
        <MoonIcon />
      </span>
      {!mounted && <span className="ef-sr-only">Toggle colour theme</span>}
    </button>
  );
}
