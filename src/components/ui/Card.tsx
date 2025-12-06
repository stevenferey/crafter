import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Variante de style du card
   */
  variant?: 'default' | 'outlined' | 'elevated';
  /**
   * Padding du contenu
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Composant Card réutilisable pour encapsuler du contenu
 * Compatible avec le système de thème (dark mode)
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', className, children, ...props },
    ref,
  ) => {
    const variantClasses = {
      default:
        'bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]',
      outlined: 'border-2 border-[rgb(var(--color-border))] bg-transparent',
      elevated:
        'bg-[rgb(var(--color-surface))] shadow-md border border-[rgb(var(--color-border))]',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantClasses[variant],
          paddingClasses[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

/**
 * Composant CardHeader pour le titre du card
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * Composant CardTitle pour le titre principal
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold text-[rgb(var(--color-text))]',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * Composant CardDescription pour la description
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        'text-sm text-[rgb(var(--color-text-secondary))]',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * Composant CardContent pour le contenu principal
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * Composant CardFooter pour les actions en bas du card
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';
