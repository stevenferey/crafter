import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Composant FormField wrapper générique pour créer des champs de formulaire
 * Fournit une structure cohérente avec label, erreur et texte d'aide
 * Peut être utilisé avec n'importe quel type de champ (input, select, custom, etc.)
 *
 * @example
 * ```tsx
 * <FormField label="Email" error={errors.email?.message} required>
 *   <input {...register('email')} type="email" />
 * </FormField>
 * ```
 */
export const FormField = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  htmlFor,
  className,
  children,
  ...props
}: FormFieldProps) => {
  // Générer un ID unique si non fourni
  const fieldId = htmlFor || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  return (
    <div
      className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}
      {...props}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-[rgb(var(--color-text))]',
            disabled && 'text-[rgb(var(--color-text-muted))]',
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Children - Le champ de formulaire réel */}
      <div className="relative">
        {children}
      </div>

      {/* Texte d'aide ou erreur */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
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
};

FormField.displayName = 'FormField';

/**
 * Composant FormGroup pour regrouper plusieurs champs
 * Utile pour créer des layouts de formulaires cohérents
 */
export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGroup = ({
  children,
  columns = 1,
  gap = 'md',
  className,
  ...props
}: FormGroupProps) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn('grid', columnClasses[columns], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};

FormGroup.displayName = 'FormGroup';

/**
 * Composant FormSection pour structurer les formulaires en sections
 */
export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: ReactNode;
}

export const FormSection = ({
  title,
  description,
  children,
  className,
  ...props
}: FormSectionProps) => {
  return (
    <div
      className={cn(
        'bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))] p-6 space-y-6',
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-[rgb(var(--color-border))] pb-4">
          {title && (
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

FormSection.displayName = 'FormSection';
