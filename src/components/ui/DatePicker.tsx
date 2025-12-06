import { forwardRef, useId, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'min' | 'max'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  min?: string; // Format YYYY-MM-DD
  max?: string; // Format YYYY-MM-DD
}

/**
 * Composant DatePicker réutilisable avec support de label, erreur et texte d'aide
 * Utilise l'input natif type="date" pour une meilleure accessibilité
 * Compatible avec react-hook-form via forwardRef
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      id,
      disabled,
      required,
      min,
      max,
      ...props
    },
    ref,
  ) => {
    // Générer un ID unique si non fourni
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // Classes pour l'input
    const inputClasses = cn(
      // Styles de base
      'block px-4 py-2 text-sm text-[rgb(var(--color-text))] bg-[rgb(var(--color-surface))] border rounded-lg transition-colors',
      // Focus
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      // États
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-[rgb(var(--color-border))]',
      disabled &&
        'bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-muted))] cursor-not-allowed opacity-60',
      // Largeur
      fullWidth ? 'w-full' : 'w-auto',
      // Styles spécifiques pour le date picker
      '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
      disabled && '[&::-webkit-calendar-picker-indicator]:cursor-not-allowed',
      className,
    );

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-[rgb(var(--color-text))]',
              disabled && 'text-[rgb(var(--color-text-muted))]',
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input wrapper avec icône */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(errorId, helperId)}
            aria-required={required}
            {...props}
          />
        </div>

        {/* Texte d'aide ou erreur */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-[rgb(var(--color-text-muted))]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
