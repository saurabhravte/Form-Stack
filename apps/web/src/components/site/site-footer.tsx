import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-md bg-primary text-white grid place-items-center font-bold text-sm">
              F
            </div>
            <span className="font-display text-lg font-semibold">FormStack</span>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            The form builder that doesn&apos;t make people sigh. Themed, typed, tracked.
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
          <span>© {new Date().getFullYear()} FormStack. Built for the hackathon, designed for the long haul.</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
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
