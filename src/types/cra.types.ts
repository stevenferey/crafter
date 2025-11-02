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
};

/**
 * Type pour la mise à jour d'un CRA
 */
export type UpdateCRAInput = {
  month?: number;
  year?: number;
  worked_days?: number[];
  comment?: string;
  client_id?: string;
  provider_id?: string;
  status?: CRAStatus;
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
