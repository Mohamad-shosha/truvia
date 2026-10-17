import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

const KEY = 'truvia-theme';

export function initTheme() {
  let theme = 'light';
  try {
    theme = localStorage.getItem(KEY) || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch {
    /* storage unavailable */
  }
  document.documentElement.dataset.theme = theme;
  return theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      id="theme-toggle"
      className="icon-btn"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
