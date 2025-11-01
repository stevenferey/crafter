import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, type CRAStatus } from '@/constants/cra.constants';

export interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Statut du CRA à afficher
   */
  status: CRAStatus;
}

/**
 * Badge d'affichage du statut d'un CRA
 * Affiche automatiquement le label et les couleurs associées au statut
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          config.className,
          className
        )}
        {...props}
      >
        {config.label}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
