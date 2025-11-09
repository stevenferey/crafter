// Types pour les sociétés (frontend)

export type Repertoire = 'SIREN' | 'SIRET';
export type Liste = 'NAF' | 'APE';
export type Registre =
  | 'RCS'
  | 'RM'
  | 'RCS/RM'
  | 'RNE'
  | 'RBE'
  | 'RSAC'
  | 'RNA'
  | 'REE'
  | 'RS'
  | 'RCC'
  | 'RAC'
  | 'RMJPM'
  | 'RMJLE'
  | 'ROVS'
  | 'ORIAS'
  | 'RAI'
  | 'RCT'
  | 'TRM'
  | 'LVIC'
  | 'STP'
  | 'REEP'
  | 'ROF'
  | 'IFP'
  | 'ROA'
  | 'RNROM'
  | 'RA'
  | 'RESS'
  | 'CNAPS'
  | 'RPI';

export interface Company {
  id: string;

  // Désignation
  designation: string;

  // Siège social
  address: string;
  complement?: string;
  city: string;
  postal_code: string;
  country: string;

  // Contact
  email: string;
  phone?: string;

  // Identification
  repertoire: Repertoire;
  repertoire_number: string;

  // Immatriculation
  dispense: boolean;
  registre?: Registre;
  registre_number?: string;

  // Activité
  liste: Liste;
  code?: string;

  // TVA
  exemption: boolean;
  tva_number?: string;

  // Signature par défaut
  default_signatory_name?: string;
  default_signatory_title?: string;
  default_signature_image?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyInput {
  // Désignation (obligatoire)
  designation: string;

  // Siège social (obligatoire sauf complement)
  address: string;
  complement?: string;
  city: string;
  postal_code: string;
  country: string;

  // Contact (email obligatoire, téléphone optionnel)
  email: string;
  phone?: string;

  // Identification (répertoire + numéro obligatoires)
  repertoire: Repertoire;
  repertoire_number: string;

  // Immatriculation (dispense obligatoire, registre et numéro optionnels)
  dispense: boolean;
  registre?: Registre;
  registre_number?: string;

  // Activité (liste obligatoire, code optionnel)
  liste: Liste;
  code?: string;

  // TVA (exemption obligatoire, numéro optionnel)
  exemption: boolean;
  tva_number?: string;

  // Signature par défaut (optionnel)
  default_signatory_name?: string;
  default_signatory_title?: string;
  default_signature_image?: string;
}

// Options pour les selects
export interface SelectOption<T = string> {
  value: T;
  label: string;
}

// Options des répertoires
export const REPERTOIRE_OPTIONS: SelectOption<Repertoire>[] = [
  { value: 'SIREN', label: 'SIREN' },
  { value: 'SIRET', label: 'SIRET' },
];

// Options des listes d'activité
export const LISTE_OPTIONS: SelectOption<Liste>[] = [
  { value: 'NAF', label: 'NAF' },
  { value: 'APE', label: 'APE' },
];

// Options des registres
export const REGISTRE_OPTIONS: SelectOption<Registre>[] = [
  { value: 'RCS', label: 'RCS - Registre du Commerce et des Sociétés' },
  { value: 'RM', label: 'RM - Répertoire des Métiers' },
  { value: 'RCS/RM', label: 'RCS/RM - Registre Commerce/Métiers' },
  { value: 'RNE', label: 'RNE - Répertoire National des Entreprises' },
  { value: 'RBE', label: 'RBE - Registre des Bénéficiaires Effectifs' },
  { value: 'RSAC', label: 'RSAC - Registre Agents Commerciaux' },
  { value: 'RNA', label: 'RNA - Répertoire National des Associations' },
  { value: 'REE', label: 'REE - Registre des Établissements' },
  { value: 'RS', label: 'RS - Registre Spécial' },
  { value: 'RCC', label: 'RCC - Registre du Commerce du Canton' },
  { value: 'RAC', label: 'RAC - Registre des Actifs Circulants' },
  { value: 'RMJPM', label: 'RMJPM - Registre Mandataires Judiciaires' },
  { value: 'RMJLE', label: 'RMJLE - Registre Mandataires Judiciaires Entreprises' },
  { value: 'ROVS', label: 'ROVS - Registre des Organismes de Ventes' },
  { value: 'ORIAS', label: 'ORIAS - Registre Intermédiaires Assurance' },
  { value: 'RAI', label: 'RAI - Registre des Agents Immobiliers' },
  { value: 'RCT', label: 'RCT - Registre des Compagnies de Transport' },
  { value: 'TRM', label: 'TRM - Transport Routier de Marchandises' },
  { value: 'LVIC', label: 'LVIC - Licence Véhicules Industriels' },
  { value: 'STP', label: 'STP - Service de Transport Public' },
  { value: 'REEP', label: 'REEP - Registre Européen des Entreprises' },
  { value: 'ROF', label: 'ROF - Registre des Organismes de Formation' },
  { value: 'IFP', label: 'IFP - Institut Français du Pétrole' },
  { value: 'ROA', label: 'ROA - Registre des Organismes Agréés' },
  { value: 'RNROM', label: 'RNROM - Registre National Organismes de Médiation' },
  { value: 'RA', label: 'RA - Registre de l\'Agriculture' },
  { value: 'RESS', label: 'RESS - Registre Économie Sociale et Solidaire' },
  { value: 'CNAPS', label: 'CNAPS - Conseil National Activités Privées de Sécurité' },
  { value: 'RPI', label: 'RPI - Registre de la Propriété Intellectuelle' },
];
