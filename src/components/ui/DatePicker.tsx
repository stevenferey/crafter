import { forwardRef, InputHTMLAttributes } from 'react';
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
    const inputId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // Classes pour l'input
    const inputClasses = cn(
      // Styles de base
      'block px-4 py-2 text-sm text-gray-900 bg-white border rounded-lg transition-colors',
      // Focus
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      // États
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
      disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-60',
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
              'block text-sm font-medium text-gray-700',
              disabled && 'text-gray-500',
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
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

/**
 * Utilitaires pour formater les dates au format YYYY-MM-DD
 */
export const datePickerUtils = {
  /**
   * Convertit une Date en string format YYYY-MM-DD
   */
  formatDate: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Convertit un string YYYY-MM-DD en Date
   */
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   */
  getToday: (): string => {
    return datePickerUtils.formatDate(new Date());
  },

  /**
   * Retourne une date relative (ex: -7 jours) au format YYYY-MM-DD
   */
  getRelativeDate: (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return datePickerUtils.formatDate(date);
  },
};
