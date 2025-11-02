import { z } from 'zod';
import { CRA_STATUSES, CRA_CONSTRAINTS } from '@/constants/cra.constants';

/**
 * Helper pour obtenir le nombre de jours dans un mois
 */
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Schéma de validation pour la création/édition d'un CRA mensuel
 */
export const craFormSchema = z
  .object({
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
          // Ne pas permettre les années trop lointaines dans le futur
          const currentYear = new Date().getFullYear();
          return year <= currentYear + 5;
        },
        { message: "L'année ne peut pas être trop éloignée dans le futur" }
      ),
    worked_days: z
      .array(z.number().int('Les jours doivent être des nombres entiers'))
      .min(1, 'Au moins un jour travaillé est requis')
      .max(31, 'Le nombre de jours travaillés ne peut pas dépasser 31')
      .refine(
        (days) => {
          // Vérifier qu'il n'y a pas de doublons
          const uniqueDays = new Set(days);
          return uniqueDays.size === days.length;
        },
        { message: 'Les jours travaillés ne doivent pas contenir de doublons' }
      )
      .refine(
        (days) => {
          // Vérifier que tous les jours sont dans la plage 1-31
          return days.every((day) => day >= 1 && day <= 31);
        },
        { message: 'Les jours doivent être entre 1 et 31' }
      ),
    comment: z
      .string()
      .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
      .optional(),
    client_id: z
      .string()
      .min(1, 'Le client est requis')
      .uuid('Le client sélectionné est invalide'),
    provider_id: z
      .string()
      .min(1, 'Le prestataire est requis')
      .uuid('Le prestataire sélectionné est invalide'),
    status: z.enum(CRA_STATUSES).optional().default('draft'),
  })
  .refine(
    (data) => data.client_id !== data.provider_id,
    {
      message: 'Le client et le prestataire doivent être différents',
      path: ['provider_id'],
    }
  )
  .refine(
    (data) => {
      // Vérifier que tous les jours travaillés sont valides pour le mois sélectionné
      const daysInMonth = getDaysInMonth(data.month, data.year);
      return data.worked_days.every((day) => day <= daysInMonth);
    },
    {
      message: 'Certains jours sélectionnés sont invalides pour le mois choisi',
      path: ['worked_days'],
    }
  );

/**
 * Type TypeScript inféré du schéma de formulaire
 */
export type CRAFormData = z.infer<typeof craFormSchema>;

/**
 * Validation partielle pour la sauvegarde en brouillon
 */
export const craFormDraftSchema = craFormSchema.partial({
  worked_days: true,
}).extend({
  worked_days: z.array(z.number().int()).optional().default([]),
});

/**
 * Type pour le brouillon
 */
export type CRAFormDraftData = z.infer<typeof craFormDraftSchema>;
