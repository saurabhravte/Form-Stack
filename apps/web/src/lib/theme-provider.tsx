'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Mode = 'light' | 'dark';

interface ThemeCtx {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('light');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('fs-theme')) as Mode | null;
    const prefers =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    const initial = stored ?? prefers;
    setModeState(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    document.documentElement.classList.toggle('dark', m === 'dark');
    try {
      localStorage.setItem('fs-theme', m);
    } catch {
      /* noop */
    }
  };

  return (
    <Ctx.Provider value={{ mode, setMode, toggle: () => setMode(mode === 'dark' ? 'light' : 'dark') }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used within <ThemeProvider>');
  return v;
}
