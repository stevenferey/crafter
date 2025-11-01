import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Composant Textarea réutilisable avec support de label, erreur et texte d'aide
 * Compatible avec react-hook-form via forwardRef
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      className,
      id,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    // Générer un ID unique si non fourni
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;

    // Classes de resize
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    // Classes pour le textarea
    const textareaClasses = cn(
      // Styles de base
      'block px-4 py-2 text-sm text-[rgb(var(--color-text))] bg-[rgb(var(--color-surface))] border rounded-lg transition-colors',
      // Focus
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      // États
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-[rgb(var(--color-border))]',
      disabled && 'bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-muted))] cursor-not-allowed opacity-60',
      // Resize
      resizeClasses[resize],
      // Largeur
      fullWidth ? 'w-full' : 'w-auto',
      className,
    );

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-[rgb(var(--color-text))]',
              disabled && 'text-[rgb(var(--color-text-muted))]',
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(errorId, helperId)}
          aria-required={required}
          {...props}
        />

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
          <p id={helperId} className="text-sm text-[rgb(var(--color-text-muted))]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
