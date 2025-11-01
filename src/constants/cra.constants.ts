/**
 * Constantes pour le module CRA (Compte Rendu d'Activité)
 */

/**
 * Liste des catégories d'activités disponibles
 */
export const ACTIVITY_CATEGORIES = [
  'Développement',
  'Réunion',
  'Documentation',
  'Tests',
  'Code Review',
  'Support',
  'Formation',
  'Analyse',
  'Conception',
  'DevOps',
  'Autre',
] as const;

/**
 * Type TypeScript pour les catégories d'activités
 */
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

/**
 * Liste des statuts possibles d'un CRA
 */
export const CRA_STATUSES = ['draft', 'submitted', 'approved', 'rejected'] as const;

/**
 * Type TypeScript pour les statuts de CRA
 */
export type CRAStatus = (typeof CRA_STATUSES)[number];

/**
 * Contraintes et limites pour les CRAs
 */
export const CRA_CONSTRAINTS = {
  /** Nombre maximum d'heures par activité */
  MAX_HOURS_PER_ACTIVITY: 24,
  /** Nombre maximum d'heures total par CRA */
  MAX_HOURS_PER_CRA: 24,
  /** Nombre minimum d'heures pour une activité */
  MIN_ACTIVITY_HOURS: 0.25,
  /** Incrément pour les heures (15 minutes) */
  HOUR_INCREMENT: 0.25,
  /** Nombre maximum d'activités par CRA */
  MAX_ACTIVITIES_PER_CRA: 50,
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
