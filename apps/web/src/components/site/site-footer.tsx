import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <FooterStamp className="h-8 w-8" />
            <span className="font-display text-lg font-bold">FormStack</span>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            Forms that feel like a conversation. Themed, typed, and built for creators.
          </p>
        </div>
        <Column
          title="Product"
          links={[
            ['Explore', '/explore'],
            ['Templates', '/templates'],
            ['Pricing', '/pricing'],
          ]}
        />
        <Column
          title="Resources"
          links={[
            ['GitHub', 'https://github.com/saurabhravte/Form-Stack'],
          ]}
        />
        <Column
          title="Account"
          links={[
            ['Sign in', '/auth/sign-in'],
            ['Create workspace', '/auth/sign-up'],
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} FormStack. Made for creators.</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterStamp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
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

function Column({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-semibold mb-3 text-foreground">{title}</h4>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="hover:text-foreground transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}