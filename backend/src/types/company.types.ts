// Types pour les sociétés

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
  default_signature_location?: string;
  default_use_current_date: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
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
  default_signature_location?: string;
  default_use_current_date?: boolean;
}

export interface UpdateCompanyInput {
  // Tous les champs optionnels pour la mise à jour
  designation?: string;
  address?: string;
  complement?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email?: string;
  phone?: string;
  repertoire?: Repertoire;
  repertoire_number?: string;
  dispense?: boolean;
  registre?: Registre;
  registre_number?: string;
  liste?: Liste;
  code?: string;
  exemption?: boolean;
  tva_number?: string;
  default_signatory_name?: string;
  default_signatory_title?: string;
  default_signature_image?: string;
  default_signature_location?: string;
  default_use_current_date?: boolean;
}

export interface CompanyFilters {
  designation?: string;
  city?: string;
  repertoire?: Repertoire;
  registre?: Registre;
  limit?: number;
  offset?: number;
}
