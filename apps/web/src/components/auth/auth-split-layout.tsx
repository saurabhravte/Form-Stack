import Link from 'next/link';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Props {
  brand?: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind classes that paint the left panel — usually a gradient. */
  panelClass?: string;
  /** Optional emoji or icon shown in the left panel. */
  panelGlyph?: ReactNode;
}

export function AuthSplitLayout({
  brand = 'FORMSTACK',
  title,
  subtitle,
  children,
  footer,
  panelClass,
  panelGlyph,
}: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — visual panel (mirrors the reference image, but using our crimson palette) */}
      <div className={`relative hidden lg:flex items-center justify-center overflow-hidden ${panelClass ?? 'bg-gradient-to-br from-[#7A1424] via-[#D7263D] to-[#FF6B7E]'}`}>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay grid-bg" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
        </div>

        <div className="absolute top-8 left-8 text-white/90 text-xs tracking-[0.25em] font-semibold">
          {brand}
        </div>

        <div className="relative z-10 text-center px-8 max-w-sm">
          <div className="text-7xl mb-6 drop-shadow-2xl">{panelGlyph ?? '🗂'}</div>
          <p className="text-white font-display text-2xl font-semibold leading-tight">
            Forms people actually finish.
          </p>
          <p className="mt-3 text-white/80 text-sm leading-relaxed">
            Themed, typed, tracked. Built for the way modern teams collect responses.
          </p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white/70 text-xs">
          <span>v0.1 · hackathon edition</span>
          <span>© FormStack</span>
        </div>
      </div>

      {/* RIGHT — form card */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            <div className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground mb-3">
              {brand}
            </div>
            <h1 className="font-display text-4xl font-bold mb-3">{title}</h1>
            <div className="text-muted-foreground mb-8 leading-relaxed">{subtitle}</div>

            <div className="rounded-xl border border-border bg-surface p-6 md:p-8 shadow-sm">
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
