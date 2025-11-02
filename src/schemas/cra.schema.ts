import { z } from 'zod';
import { CRA_STATUSES, CRA_CONSTRAINTS } from '@/constants/cra.constants';

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
    .max(CRA_CONSTRAINTS.MAX_HOURS_PER_ACTIVITY, `Le nombre d'heures ne peut pas dépasser ${CRA_CONSTRAINTS.MAX_HOURS_PER_ACTIVITY}h`)
    .refine(
      (hours) => {
        // Vérifier que c'est un multiple de l'incrément (15 minutes)
        return hours % CRA_CONSTRAINTS.HOUR_INCREMENT === 0;
      },
      {
        message: `Le nombre d'heures doit être un multiple de ${CRA_CONSTRAINTS.HOUR_INCREMENT} (15 minutes)`,
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
  client_id: z
    .string()
    .min(1, 'Le client est requis')
    .uuid('Le client sélectionné est invalide'),
  provider_id: z
    .string()
    .min(1, 'Le prestataire est requis')
    .uuid('Le prestataire sélectionné est invalide'),
  activities: z
    .array(activitySchema)
    .min(1, 'Au moins une activité est requise')
    .refine(
      (activities) => {
        // Vérifier que le total des heures ne dépasse pas le maximum
        const totalHours = activities.reduce((sum, a) => sum + a.hours, 0);
        return totalHours <= CRA_CONSTRAINTS.MAX_HOURS_PER_CRA;
      },
      { message: `Le total des heures ne peut pas dépasser ${CRA_CONSTRAINTS.MAX_HOURS_PER_CRA}h` }
    ),
  status: z
    .enum(CRA_STATUSES)
    .optional()
    .default('draft'),
}).refine(
  (data) => data.client_id !== data.provider_id,
  {
    message: 'Le client et le prestataire doivent être différents',
    path: ['provider_id'],
  }
);

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
    .max(CRA_CONSTRAINTS.MAX_HOURS_PER_ACTIVITY, `Maximum ${CRA_CONSTRAINTS.MAX_HOURS_PER_ACTIVITY} heures`),
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
