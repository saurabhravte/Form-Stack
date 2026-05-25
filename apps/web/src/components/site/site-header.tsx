'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth-aware. Removes the "logged-out on home page" UX bug: even though the
  // cookie is still valid, the static header was always showing Sign-in/Get-started.
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 60_000, retry: false });
  const isAuthed = !!me.data?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="h-24" aria-hidden />

      <header
        className={cn(
          'fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
          'w-[calc(100%-1.5rem)] md:w-auto md:max-w-3xl',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full border transition-all duration-300',
            scrolled
              ? 'bg-background/70 backdrop-blur-2xl border-border shadow-lg shadow-black/5'
              : 'bg-background/40 backdrop-blur-xl border-border/60',
          )}
        >
          <Link href="/" className="flex items-center gap-2 pl-2 pr-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-[#9C1029] text-white grid place-items-center font-bold text-sm shadow-sm">
              F
            </div>
            <span className="font-display text-base font-semibold tracking-tight hidden sm:inline">
              FormStack
            </span>
          </Link>

          <div className="hidden md:flex items-center text-sm">
            <NavPill href="/explore">Explore</NavPill>
            <NavPill href="/templates">Templates</NavPill>
            <NavPill href="/pricing">Pricing</NavPill>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {isAuthed ? (
              <Button size="sm" asChild className="rounded-full">
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex rounded-full">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full">
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
              </>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden h-9 w-9 rounded-full grid place-items-center hover:bg-muted"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-lg p-2 animate-fade-in">
            {[
              ['Explore', '/explore'],
              ['Templates', '/templates'],
              ['Pricing', '/pricing'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-muted text-sm"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

function NavPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      {children}
    </Link>
  );
}
