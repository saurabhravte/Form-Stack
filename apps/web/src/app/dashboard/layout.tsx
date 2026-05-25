'use client';

import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Palette,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/themes', label: 'Themes', icon: Palette },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // SIDEBAR ON THE RIGHT — per the user's layout request.
  // Hide the sidebar entirely on the form builder route since that page renders
  // its own full-bleed three-pane workspace.
  const isFullBleed = /^\/dashboard\/forms\/[^/]+(?:\/(?:responses|analytics))?$/.test(pathname ?? '');

  return (
    <div
      className={cn(
        'min-h-screen grid grid-cols-1 bg-background',
        !isFullBleed && 'lg:grid-cols-[1fr_280px]',
      )}
    >
      {/* MAIN CONTENT (left) */}
      <div className="flex flex-col min-w-0 order-2 lg:order-1">
        {/* mobile top bar */}
        <div className="lg:hidden h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-[#9C1029] text-white grid place-items-center font-bold text-xs">
              F
            </div>
            <span className="font-display font-semibold">FormStack</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/dashboard/forms/new">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        {children}
      </div>

      {/* SIDEBAR (right) — hidden on builder/responses/analytics detail */}
      {!isFullBleed && (
        <aside className="hidden lg:flex flex-col border-l border-border bg-surface order-1 lg:order-2 sticky top-0 h-screen">
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-[#9C1029] text-white grid place-items-center font-bold text-sm shadow-sm">
                F
              </div>
              <span className="font-display text-base font-semibold">FormStack</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="p-3 border-b border-border">
            <Button asChild className="w-full">
              <Link href="/dashboard/forms/new">
                <Plus className="h-4 w-4" /> New form
              </Link>
            </Button>
          </div>

          <nav className="flex-1 p-3 flex flex-col gap-0.5 text-sm">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-3 border-t border-border" />
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          {/* Profile area at bottom */}
          <div className="p-3 border-t border-border">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent-amber/10 border border-primary/20 p-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                <Sparkles className="h-3 w-3 text-primary" /> Coming soon
              </div>
              <p className="text-xs text-muted-foreground">
                AI form generator + conditional logic.
              </p>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/70 transition-colors">
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
      )}
    </div>
  );
}
