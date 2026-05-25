import { Home, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-primary/15 select-none">
        404
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold -mt-4 md:-mt-8">Form not found.</h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        The page you&apos;re looking for has either been moved, archived, or — let&apos;s be honest — never
        existed.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">
            <Search className="h-4 w-4" /> Explore public forms
          </Link>
        </Button>
      </div>
    </div>
  );
}
