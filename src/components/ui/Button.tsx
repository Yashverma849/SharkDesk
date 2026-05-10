import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-fast focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:ring-offset-2 focus:ring-offset-navy-deep active:scale-[0.97]",
          {
            "bg-gradient-to-r from-teal-primary to-[#22D3EE] text-navy-deep hover:opacity-90 shadow-[0_0_15px_rgba(20,184,166,0.3)] border border-transparent font-semibold": variant === 'primary',
            "glass-panel text-text-primary hover:bg-navy-surface/80 hover:shadow-lg": variant === 'secondary',
            "bg-transparent text-text-secondary hover:text-text-primary hover:bg-navy-surface/50": variant === 'ghost',
            "h-8 px-3 text-xs": size === 'sm',
            "h-10 px-5 py-2 text-sm": size === 'md',
            "h-12 px-8 text-base": size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
