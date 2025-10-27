import { z } from 'zod';

/**
 * Schéma de validation pour une activité
 */
export const activitySchema = z.object({
  id: z.string().optional(), // ID optionnel (généré côté serveur pour les nouvelles activités)
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(3, 'La description doit contenir au moins 3 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
  hours: z
    .number({ message: "Le nombre d'heures doit être un nombre" })
    .positive("Le nombre d'heures doit être positif")
    .max(24, "Le nombre d'heures ne peut pas dépasser 24h")
    .refine(
      (hours) => {
        // Vérifier que c'est un multiple de 0.25 (15 minutes)
        return hours % 0.25 === 0;
      },
      {
        message: "Le nombre d'heures doit être un multiple de 0.25 (15 minutes)",
      }
    ),
  category: z
    .string()
    .min(1, 'La catégorie est requise')
    .min(2, 'La catégorie doit contenir au moins 2 caractères')
    .max(100, 'La catégorie ne peut pas dépasser 100 caractères'),
});

/**
 * Schéma de validation pour la création/édition d'un CRA
 */
export const craFormSchema = z.object({
  date: z
    .string()
    .min(1, 'La date est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Date invalide' }
    )
    .refine(
      (date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d <= today;
      },
      { message: 'La date ne peut pas être dans le futur' }
    ),
  client: z
    .string()
    .min(1, 'Le client est requis')
    .min(2, 'Le nom du client doit contenir au moins 2 caractères')
    .max(100, 'Le nom du client ne peut pas dépasser 100 caractères'),
  activities: z
    .array(activitySchema)
    .min(1, 'Au moins une activité est requise')
    .refine(
      (activities) => {
        // Vérifier que le total des heures ne dépasse pas 24h
        const totalHours = activities.reduce((sum, a) => sum + a.hours, 0);
        return totalHours <= 24;
      },
      { message: 'Le total des heures ne peut pas dépasser 24h' }
    ),
  status: z
    .enum(['draft', 'submitted', 'approved', 'rejected'])
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
  description: z.string().min(1, 'La description est requise'),
  hours: z.coerce
    .number()
    .positive("Le nombre d'heures doit être positif")
    .max(24, 'Maximum 24 heures'),
  category: z.string().min(1, 'La catégorie est requise'),
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
