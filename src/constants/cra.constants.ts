/**
 * Constantes pour le module CRA (Compte Rendu d'Activité)
 */

/**
 * Liste des statuts possibles d'un CRA
 */
export const CRA_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'rejected',
] as const;

/**
 * Type TypeScript pour les statuts de CRA
 */
export type CRAStatus = (typeof CRA_STATUSES)[number];

/**
 * Contraintes et limites pour les CRAs mensuels
 */
export const CRA_CONSTRAINTS = {
  /** Nombre maximum d'heures par mois */
  MAX_HOURS_PER_MONTH: 300,
  /** Nombre minimum d'heures par mois */
  MIN_HOURS_PER_MONTH: 0.25,
  /** Incrément pour les heures (15 minutes) */
  HOUR_INCREMENT: 0.25,
  /** Nombre maximum de jours travaillés par mois */
  MAX_WORKED_DAYS_PER_MONTH: 31,
  /** Nombre de CRAs récents à afficher */
  MAX_RECENT_CRAS: 10,
} as const;

/**
 * Configuration des badges de statut
 */
export const STATUS_CONFIG = {
  draft: {
    label: 'Brouillon',
    className: 'text-gray-700 bg-gray-100 border border-gray-300',
  },
  submitted: {
    label: 'Soumis',
    className: 'text-blue-700 bg-blue-100 border border-blue-300',
  },
  approved: {
    label: 'Approuvé',
    className: 'text-emerald-700 bg-emerald-100 border border-emerald-300',
  },
  rejected: {
    label: 'Rejeté',
    className: 'text-red-700 bg-red-100 border border-red-300',
  },
} as const;
