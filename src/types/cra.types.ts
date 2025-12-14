/**
 * Type définissant les statuts possibles d'un CRA
 */
export type CRAStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/**
 * Interface représentant un Compte Rendu d'Activité (CRA) mensuel
 * Un CRA couvre maintenant un mois entier avec sélection des jours travaillés
 */
export interface CRA {
  id: string;
  month: number; // 1-12 (Janvier = 1, Décembre = 12)
  year: number; // Année (ex: 2025)
  worked_days: number[]; // Liste des jours travaillés du mois (ex: [1, 5, 10, 15, 20])
  comment?: string; // Commentaire global optionnel
  client_id: string; // UUID de la société cliente
  provider_id: string; // UUID de la société prestataire
  status: CRAStatus;

  // Signatures (overrides de la signature par défaut de la société)
  client_signatory_name?: string;
  client_signatory_title?: string;
  client_signature_image?: string;
  client_signature_location?: string;
  client_use_current_date?: boolean;
  provider_signatory_name?: string;
  provider_signatory_title?: string;
  provider_signature_image?: string;
  provider_signature_location?: string;
  provider_use_current_date?: boolean;

  created_at: string; // Format ISO 8601
  updated_at: string; // Format ISO 8601
}

/**
 * Type pour la création d'un nouveau CRA
 */
export type CreateCRAInput = {
  month: number; // 1-12
  year: number;
  worked_days: number[]; // Liste des jours travaillés
  comment?: string; // Commentaire optionnel
  client_id: string; // UUID de la société cliente (obligatoire)
  provider_id: string; // UUID de la société prestataire (obligatoire)
  status?: CRAStatus;

  // Signatures (optionnel)
  client_signatory_name?: string;
  client_signatory_title?: string;
  client_signature_image?: string;
  client_signature_location?: string;
  client_use_current_date?: boolean;
  provider_signatory_name?: string;
  provider_signatory_title?: string;
  provider_signature_image?: string;
  provider_signature_location?: string;
  provider_use_current_date?: boolean;
};

/**
 * Type pour la mise à jour d'un CRA
 * Note: les champs de signature acceptent null pour permettre l'effacement explicite via l'API
 */
export type UpdateCRAInput = {
  month?: number;
  year?: number;
  worked_days?: number[];
  comment?: string;
  client_id?: string;
  provider_id?: string;
  status?: CRAStatus;

  // Signatures (optionnel, accepte null pour effacer)
  client_signatory_name?: string | null;
  client_signatory_title?: string | null;
  client_signature_image?: string | null;
  client_signature_location?: string | null;
  client_use_current_date?: boolean | null;
  provider_signatory_name?: string | null;
  provider_signatory_title?: string | null;
  provider_signature_image?: string | null;
  provider_signature_location?: string | null;
  provider_use_current_date?: boolean | null;
};

/**
 * Interface pour les filtres de recherche de CRA
 */
export interface CRAFilters {
  client?: string; // UUID de la société cliente
  provider?: string; // UUID de la société prestataire
  status?: CRAStatus;
  year?: number; // Filtrer par année
  month?: number; // Filtrer par mois
  limit?: number;
  offset?: number;
}

/**
 * Interface pour les options de tri de CRA
 */
export interface CRASortOptions {
  field: 'year' | 'month' | 'client' | 'created_at';
  direction: 'asc' | 'desc';
}

/**
 * Représente les données complètes d'une signature
 * Utilisé pour afficher et gérer les signatures dans les composants UI
 */
export interface SignatureData {
  signatoryName: string; // Nom du signataire
  signatoryTitle: string; // Titre/fonction du signataire
  signatureImage: string; // Chemin ou URL de l'image de signature
  signatureLocation?: string; // Lieu de signature (ville)
  useCurrentDate?: boolean; // Utiliser la date du jour
}
