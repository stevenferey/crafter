import { z } from 'zod';

/**
 * Schéma de validation pour une activité
 */
export const activitySchema = z.object({
  id: z.string().optional(), // ID optionnel (généré côté serveur pour les nouvelles activités)
  date: z
    .string()
    .min(1, 'La date est requise')
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'La date doit être au format YYYY-MM-DD',
    )
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Date invalide' },
    ),
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(3, 'La description doit contenir au moins 3 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
  hours: z
    .number({ message: 'Le nombre d\'heures doit être un nombre' })
    .positive('Le nombre d\'heures doit être positif')
    .max(24, 'Le nombre d\'heures ne peut pas dépasser 24h par jour')
    .refine(
      (hours) => {
        // Vérifier que c'est un multiple de 0.25 (15 minutes)
        return hours % 0.25 === 0;
      },
      { message: 'Le nombre d\'heures doit être un multiple de 0.25 (15 minutes)' },
    ),
});

/**
 * Schéma de validation pour la création/édition d'un CRA
 */
export const craFormSchema = z.object({
  month: z
    .string()
    .min(1, 'Le mois est requis')
    .regex(/^(0?[1-9]|1[0-2])$/, 'Mois invalide (1-12)'),
  year: z
    .string()
    .min(1, 'L\'année est requise')
    .regex(/^\d{4}$/, 'L\'année doit être au format YYYY')
    .refine(
      (year) => {
        const y = parseInt(year);
        const currentYear = new Date().getFullYear();
        return y >= currentYear - 5 && y <= currentYear + 1;
      },
      { message: 'L\'année doit être dans la plage valide' },
    ),
  client: z
    .string()
    .min(1, 'Le client est requis')
    .min(2, 'Le nom du client doit contenir au moins 2 caractères')
    .max(100, 'Le nom du client ne peut pas dépasser 100 caractères'),
  consultant: z
    .string()
    .min(1, 'Le consultant est requis')
    .min(2, 'Le nom du consultant doit contenir au moins 2 caractères')
    .max(100, 'Le nom du consultant ne peut pas dépasser 100 caractères'),
  days: z
    .number({ message: 'Le nombre de jours doit être un nombre' })
    .int('Le nombre de jours doit être un entier')
    .positive('Le nombre de jours doit être positif')
    .min(1, 'Au moins 1 jour doit être travaillé')
    .max(31, 'Le nombre de jours ne peut pas dépasser 31'),
  activities: z
    .array(activitySchema)
    .min(1, 'Au moins une activité est requise')
    .refine(
      (activities) => {
        // Vérifier qu'il n'y a pas de doublons de dates
        const dates = activities.map((a) => a.date);
        return dates.length === new Set(dates).size;
      },
      { message: 'Chaque date ne peut apparaître qu\'une seule fois' },
    )
    .refine(
      (activities) => {
        // Vérifier que les heures totales par jour ne dépassent pas 24h
        const hoursByDate = new Map<string, number>();
        for (const activity of activities) {
          const current = hoursByDate.get(activity.date) || 0;
          hoursByDate.set(activity.date, current + activity.hours);
        }
        return Array.from(hoursByDate.values()).every((hours) => hours <= 24);
      },
      { message: 'Le total des heures par jour ne peut pas dépasser 24h' },
    ),
  status: z
    .enum(['draft', 'completed', 'submitted', 'approved', 'rejected'])
    .optional()
    .default('draft'),
});

/**
 * Type TypeScript inféré du schéma de formulaire
 */
export type CRAFormData = z.infer<typeof craFormSchema>;

/**
 * Type TypeScript inféré du schéma d'activité
 */
export type ActivityFormData = z.infer<typeof activitySchema>;

/**
 * Schéma pour une activité simple (utilisé pour l'ajout dynamique)
 */
export const simpleActivitySchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  description: z.string().min(1, 'La description est requise'),
  hours: z.coerce
    .number()
    .positive('Le nombre d\'heures doit être positif')
    .max(24, 'Maximum 24 heures'),
});

/**
 * Validation partielle pour la sauvegarde en brouillon
 */
export const craFormDraftSchema = craFormSchema.partial({
  activities: true,
}).extend({
  activities: z.array(activitySchema).optional(),
});

/**
 * Type pour le brouillon
 */
export type CRAFormDraftData = z.infer<typeof craFormDraftSchema>;

/**
 * Validation personnalisée : vérifier que le mois/année ne sont pas dans le futur
 */
export const validateCRAPeriod = (month: string, year: string): boolean => {
  const selectedDate = new Date(parseInt(year), parseInt(month) - 1);
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth());

  return selectedDate <= currentMonth;
};

/**
 * Helper pour valider une période de CRA
 */
export const craFormWithPeriodValidation = craFormSchema.refine(
  (data) => validateCRAPeriod(data.month, data.year),
  {
    message: 'La période du CRA ne peut pas être dans le futur',
    path: ['month'],
  },
);
