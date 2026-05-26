'use client';

import {
  BarChart3,
  Bell,
  FileText,
  Home,
  LogOut,
  Menu,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/forms', label: 'My Forms', icon: FileText },
  { href: '/dashboard/forms?filter=responses', label: 'Responses', icon: Users },
  { href: '/dashboard/themes', label: 'Templates', icon: Palette },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/themes', label: 'Integrations', icon: Zap },
  { href: '/dashboard/themes', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setSession, clear, markHydrated, hydrated } = useAuthStore();

  const me = trpc.auth.me.useQuery(undefined, { staleTime: 30_000 });
  useEffect(() => {
    if (me.data) {
      setSession(me.data.user, me.data.workspaceId);
    } else if (me.isFetched && !me.data) {
      clear();
    }
    if (me.isFetched) markHydrated();
  }, [me.data, me.isFetched, setSession, clear, markHydrated]);

  useEffect(() => {
    if (hydrated && !user) router.replace('/auth/sign-in');
  }, [hydrated, user, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clear();
      toast.success('Signed out');
      router.push('/');
    },
  });

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        Loading workspace…
      </div>
    );
  }
  if (!user) return null;

  const isFullBleed = /^\/dashboard\/forms\/[^/]+(?:\/(?:responses|analytics))?$/.test(pathname ?? '');

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        !isFullBleed && 'lg:grid lg:grid-cols-[260px_1fr]',
      )}
    >
      {/* SIDEBAR (left, per Postform layout) */}
      {!isFullBleed && (
        <>
          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <aside
            className={cn(
              'flex flex-col bg-surface border-r border-border',
              'fixed lg:sticky top-0 h-screen z-50 transition-transform',
              'w-[260px]',
              mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            )}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Link href="/" className="flex items-center gap-2">
                <SidebarStamp />
                <span className="font-display text-base font-bold">FormStack</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden h-8 w-8 grid place-items-center rounded-md hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 flex flex-col gap-0.5 text-sm overflow-y-auto scrollbar-thin">
              {NAV.map((item, idx) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    !item.href.includes('?') &&
                    pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={`${item.href}-${idx}`}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* "Good forms ask great questions" doodle card */}
            <div className="p-3">
              <div className="relative rounded-xl border-2 border-dashed border-foreground/30 bg-pastel-butter p-4">
                <div className="absolute -top-2 left-4 h-3 w-12 bg-accent-violet/60 rounded-sm rotate-[-6deg]" />
                <Sparkles className="h-4 w-4 text-foreground/70 mb-2" />
                <p className="text-xs font-display font-semibold text-foreground leading-snug">
                  Good forms ask great questions.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="h-9 w-9 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => logout.mutate()}
                  className="p-1.5 hover:text-primary text-muted-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* MAIN COLUMN */}
      <div className="flex flex-col min-w-0">
        {/* Top bar */}
        {!isFullBleed && (
          <div className="h-16 border-b border-border flex items-center gap-3 px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur z-30">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-md hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input
                className="bg-transparent flex-1 outline-none placeholder:text-muted-foreground"
                placeholder="Search forms, responses, templates…"
              />
              <kbd className="text-xs font-mono opacity-60">⌘K</kbd>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-muted">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground grid place-items-center font-bold">
                  3
                </span>
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:inline">
                  Hey, {user.name.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile full-bleed top bar fallback */}
        {isFullBleed && (
          <div className="lg:hidden h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-30">
            <Link href="/dashboard" className="flex items-center gap-2">
              <SidebarStamp />
              <span className="font-display font-semibold">FormStack</span>
            </Link>
            <Button size="sm" asChild>
              <Link href="/dashboard/forms/new">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function SidebarStamp() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8">
      <rect
        x="4" y="4" width="40" height="40" rx="2"
        stroke="currentColor" strokeWidth="2" strokeDasharray="3 2"
        className="text-primary"
      />
      <path
        d="M14 32 L24 18 L34 28 L38 22"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-foreground"
      />
      <path d="M30 14 L36 12 L34 18 Z" fill="currentColor" className="text-primary" />
    </svg>
  );
}