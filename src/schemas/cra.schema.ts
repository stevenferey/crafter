import { z } from 'zod';
import { CRA_STATUSES } from '@/constants/cra.constants';

/**
 * Helper pour obtenir le nombre de jours dans un mois
 */
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Valide qu'un tableau de jours n'a pas de doublons
 */
function hasNoDuplicateDays(days: number[]): boolean {
  return new Set(days).size === days.length;
}

/**
 * Valide que tous les jours sont dans la plage 1-31
 */
function allDaysInValidRange(days: number[]): boolean {
  return days.every((day) => day >= 1 && day <= 31);
}

/**
 * Valide que tous les jours sont valides pour un mois/année donnés
 */
function allDaysValidForMonth(
  days: number[],
  month: number,
  year: number,
): boolean {
  const daysInMonth = getDaysInMonth(month, year);
  return days.every((day) => day <= daysInMonth);
}

/**
 * Expression régulière pour valider un UUID
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Schéma de base pour un CRA (sans worked_days ni refinements cross-field)
 * Utilisé pour dériver les schémas complet et draft
 */
const craFormBaseSchema = z.object({
  month: z
    .number({ message: 'Le mois est requis' })
    .int('Le mois doit être un nombre entier')
    .min(1, 'Le mois doit être entre 1 et 12')
    .max(12, 'Le mois doit être entre 1 et 12'),
  year: z
    .number({ message: "L'année est requise" })
    .int("L'année doit être un nombre entier")
    .min(2000, "L'année doit être supérieure ou égale à 2000")
    .max(2100, "L'année doit être inférieure ou égale à 2100")
    .refine(
      (year) => {
        const currentYear = new Date().getFullYear();
        return year <= currentYear + 5;
      },
      { message: "L'année ne peut pas être trop éloignée dans le futur" },
    ),
  comment: z
    .string()
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
    .optional(),
  client_id: z
    .string()
    .min(1, 'Le client est requis')
    .refine((val) => val.length === 0 || UUID_REGEX.test(val), {
      message: 'Le client sélectionné est invalide',
    }),
  provider_id: z
    .string()
    .min(1, 'Le prestataire est requis')
    .refine((val) => val.length === 0 || UUID_REGEX.test(val), {
      message: 'Le prestataire sélectionné est invalide',
    }),
  status: z.enum(CRA_STATUSES).optional().default('draft'),

  // Signatures (optionnelles, overrides des signatures par défaut)
  client_signatory_name: z.string().max(255).optional(),
  client_signatory_title: z.string().max(255).optional(),
  client_signature_image: z.string().optional(),
  client_signature_location: z.string().max(255).optional(),
  client_use_current_date: z.boolean().optional(),
  client_signature_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format YYYY-MM-DD attendu)')
    .or(z.literal(''))
    .optional(),
  provider_signatory_name: z.string().max(255).optional(),
  provider_signatory_title: z.string().max(255).optional(),
  provider_signature_image: z.string().optional(),
  provider_signature_location: z.string().max(255).optional(),
  provider_use_current_date: z.boolean().optional(),
  provider_signature_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format YYYY-MM-DD attendu)')
    .or(z.literal(''))
    .optional(),
});

/**
 * Schéma pour worked_days avec validations complètes (requis)
 */
const workedDaysRequiredSchema = z
  .array(z.number().int('Les jours doivent être des nombres entiers'))
  .min(1, 'Au moins un jour travaillé est requis')
  .max(31, 'Le nombre de jours travaillés ne peut pas dépasser 31')
  .refine(hasNoDuplicateDays, {
    message: 'Les jours travaillés ne doivent pas contenir de doublons',
  })
  .refine(allDaysInValidRange, {
    message: 'Les jours doivent être entre 1 et 31',
  });

/**
 * Schéma de validation pour la création/édition d'un CRA mensuel
 * Inclut les validations cross-field (client != provider, jours valides pour le mois)
 */
export const craFormSchema = craFormBaseSchema
  .extend({
    worked_days: workedDaysRequiredSchema,
  })
  .refine((data) => data.client_id !== data.provider_id, {
    message: 'Le client et le prestataire doivent être différents',
    path: ['provider_id'],
  })
  .refine(
    (data) => allDaysValidForMonth(data.worked_days, data.month, data.year),
    {
      message: 'Certains jours sélectionnés sont invalides pour le mois choisi',
      path: ['worked_days'],
    },
  );

/**
 * Type TypeScript inféré du schéma de formulaire
 */
export type CRAFormData = z.infer<typeof craFormSchema>;

/**
 * Validation partielle pour la sauvegarde en brouillon
 * - worked_days est optionnel (tableau vide par défaut)
 * - client_id et provider_id sont optionnels
 * - Pas de validation cross-field
 */
export const craFormDraftSchema = craFormBaseSchema.extend({
  worked_days: z.array(z.number().int()).optional().default([]),
  client_id: z.string().optional().default(''),
  provider_id: z.string().optional().default(''),
});

/**
 * Type pour le brouillon
 */
export type CRAFormDraftData = z.infer<typeof craFormDraftSchema>;
