import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn('flex items-center w-full gap-2', className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all',
                done && 'bg-primary text-primary-foreground border-primary',
                active && 'border-primary text-primary',
                !done && !active && 'border-border text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs hidden sm:inline',
                active ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px transition-colors',
                  i < current ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
