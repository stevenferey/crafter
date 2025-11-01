import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-hover))] focus:ring-blue-500 active:bg-[rgb(var(--color-primary-hover))]',
  secondary:
    'bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-border))] focus:ring-gray-500 border border-[rgb(var(--color-border))]',
  outline:
    'border-2 border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-hover))] focus:ring-gray-500',
  ghost:
    'text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-hover))] focus:ring-gray-500',
  danger:
    'bg-[rgb(var(--color-error))] text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
