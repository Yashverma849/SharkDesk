import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-transparent transition-fast",
        {
          "bg-navy-surface text-text-secondary border-navy-border": variant === 'default',
          "bg-teal-primary/10 text-teal-primary border-teal-primary/20": variant === 'info',
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === 'success',
          "bg-amber-500/10 text-amber-400 border-amber-500/20": variant === 'warning',
          "bg-rose-500/10 text-rose-400 border-rose-500/20": variant === 'danger',
        },
        className
      )}
      {...props}
    />
  );
}
