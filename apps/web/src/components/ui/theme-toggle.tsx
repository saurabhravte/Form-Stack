'use client';

import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme-provider';

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface',
        'hover:bg-muted transition-colors text-foreground',
        className,
      )}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
