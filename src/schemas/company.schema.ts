import { z } from 'zod';
import type { Repertoire, Liste, Registre } from '@/types/company.types';

/**
 * Regex pour la validation des formats français
 */
const VALIDATION_REGEX = {
  SIREN: /^\d{9}$/,
  SIRET: /^\d{14}$/,
  POSTAL_CODE: /^\d{5}$/,
  PHONE: /^\d{10}$/,
  EMAIL: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  TVA: /^FR\d{11}$/,
};

/**
 * Valeurs valides pour les enums
 */
const REPERTOIRES: readonly [Repertoire, ...Repertoire[]] = ['SIREN', 'SIRET'];
const LISTES: readonly [Liste, ...Liste[]] = ['NAF', 'APE'];
const REGISTRES: readonly [Registre, ...Registre[]] = [
  'RCS',
  'RM',
  'RCS/RM',
  'RNE',
  'RBE',
  'RSAC',
  'RNA',
  'REE',
  'RS',
  'RCC',
  'RAC',
  'RMJPM',
  'RMJLE',
  'ROVS',
  'ORIAS',
  'RAI',
  'RCT',
  'TRM',
  'LVIC',
  'STP',
  'REEP',
  'ROF',
  'IFP',
  'ROA',
  'RNROM',
  'RA',
  'RESS',
  'CNAPS',
  'RPI',
];

/**
 * Schéma de validation pour la création d'une société
 */
export const companyFormSchema = z
  .object({
    // Désignation
    designation: z
      .string()
      .min(1, 'La désignation est obligatoire')
      .max(255, 'La désignation ne peut pas dépasser 255 caractères'),

    // Siège social
    address: z
      .string()
      .min(1, "L'adresse est obligatoire")
      .max(255, "L'adresse ne peut pas dépasser 255 caractères"),

    complement: z
      .string()
      .max(255, "Le complément d'adresse ne peut pas dépasser 255 caractères")
      .optional(),

    city: z
      .string()
      .min(1, 'La ville est obligatoire')
      .max(255, 'La ville ne peut pas dépasser 255 caractères'),

    postal_code: z
      .string()
      .regex(
        VALIDATION_REGEX.POSTAL_CODE,
        'Le code postal doit contenir exactement 5 chiffres',
      ),

    country: z
      .string()
      .min(1, 'Le pays est obligatoire')
      .max(100, 'Le pays ne peut pas dépasser 100 caractères'),

    // Contact
    email: z
      .string()
      .regex(VALIDATION_REGEX.EMAIL, "Le format de l'email est invalide"),

    phone: z
      .string()
      .refine(
        (val) => !val || val === '' || VALIDATION_REGEX.PHONE.test(val),
        'Le téléphone doit contenir exactement 10 chiffres',
      )
      .optional(),

    // Identification
    repertoire: z.enum(REPERTOIRES, {
      message: 'Le répertoire doit être SIREN ou SIRET',
    }),

    repertoire_number: z
      .string()
      .min(1, 'Le numéro de répertoire est obligatoire'),

    // Immatriculation
    dispense: z.boolean(),

    registre: z
      .string()
      .refine(
        (val) =>
          !val || val === '' || (REGISTRES as readonly string[]).includes(val),
        'Le registre sélectionné est invalide',
      )
      .optional(),

    registre_number: z
      .string()
      .max(255, 'Le numéro de registre ne peut pas dépasser 255 caractères')
      .optional(),

    // Activité
    liste: z.enum(LISTES, {
      message: "La liste d'activité doit être NAF ou APE",
    }),

    code: z
      .string()
      .max(10, "Le code d'activité ne peut pas dépasser 10 caractères")
      .optional(),

    // TVA
    exemption: z.boolean(),

    tva_number: z
      .string()
      .refine(
        (val) => !val || val === '' || VALIDATION_REGEX.TVA.test(val),
        'Le numéro de TVA doit être au format FR suivi de 11 chiffres',
      )
      .optional(),

    // Signature par défaut (optionnel)
    default_signatory_name: z.string().max(255).optional(),
    default_signatory_title: z.string().max(255).optional(),
    default_signature_image: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // Validation du numéro de répertoire selon le type
      if (data.repertoire === 'SIREN') {
        return VALIDATION_REGEX.SIREN.test(data.repertoire_number);
      } else if (data.repertoire === 'SIRET') {
        return VALIDATION_REGEX.SIRET.test(data.repertoire_number);
      }
      return true;
    },
    {
      message:
        'Le numéro SIREN doit contenir 9 chiffres et le numéro SIRET 14 chiffres',
      path: ['repertoire_number'],
    },
  );

/**
 * Type inféré du schéma pour TypeScript
 */
export type CompanyFormData = z.infer<typeof companyFormSchema>;
