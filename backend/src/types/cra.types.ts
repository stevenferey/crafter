// Types pour les CRA mensuels

export interface Activity {
  id: string;
  cra_id: string;
  description: string;
  hours: number;
  category: string;
  created_at: Date;
}

export interface CRA {
  id: string;
  user_id: string; // UUID de l'utilisateur propriétaire
  month: number; // 1-12 (Janvier = 1, Décembre = 12)
  year: number; // Année (ex: 2025)
  worked_days: number[]; // Liste des jours travaillés du mois
  comment?: string; // Commentaire global optionnel
  client_id: string; // UUID de la société cliente
  provider_id: string; // UUID de la société prestataire
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

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

  created_at: Date;
  updated_at: Date;
}

export interface CreateCRAInput {
  user_id: string; // UUID de l'utilisateur propriétaire
  month: number;
  year: number;
  worked_days: number[];
  comment?: string;
  client_id: string;
  provider_id: string;
  status?: 'draft' | 'submitted';

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
}

export interface UpdateCRAInput {
  month?: number;
  year?: number;
  worked_days?: number[];
  comment?: string;
  client_id?: string;
  provider_id?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';

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
}

export interface CRAFilters {
  user_id?: string; // UUID de l'utilisateur (pour filtrer par propriétaire)
  status?: string;
  client?: string; // UUID de la société cliente
  provider?: string; // UUID de la société prestataire
  year?: number; // Filtrer par année
  month?: number; // Filtrer par mois
  limit?: number;
  offset?: number;
}

/**
 * Représente les données complètes d'une signature
 * Utilisé pour afficher et gérer les signatures dans les composants UI
 */
export interface SignatureData {
  signatoryName: string; // Nom du signataire
  signatoryTitle: string; // Titre/fonction du signataire
  signatureImage: string; // Chemin ou URL de l'image de signature
}
