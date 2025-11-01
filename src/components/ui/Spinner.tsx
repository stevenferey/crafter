import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Taille du spinner
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Couleur du spinner (classe Tailwind pour border-color)
   */
  color?: string;
}

/**
 * Composant Spinner pour indiquer un chargement
 * Disponible en 3 tailles : sm, md, lg
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'border-blue-600', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block animate-spin rounded-full border-b-2',
          sizes[size],
          color,
          className
        )}
        role="status"
        aria-label="Chargement"
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
