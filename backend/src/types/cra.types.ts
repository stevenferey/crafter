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
  month: number;              // 1-12 (Janvier = 1, Décembre = 12)
  year: number;               // Année (ex: 2025)
  worked_days: number[];      // Liste des jours travaillés du mois
  comment?: string;           // Commentaire global optionnel
  client_id: string;          // UUID de la société cliente
  provider_id: string;        // UUID de la société prestataire
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface CreateCRAInput {
  month: number;
  year: number;
  worked_days: number[];
  comment?: string;
  client_id: string;
  provider_id: string;
  status?: 'draft' | 'submitted';
}

export interface UpdateCRAInput {
  month?: number;
  year?: number;
  worked_days?: number[];
  comment?: string;
  client_id?: string;
  provider_id?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface CRAFilters {
  status?: string;
  client?: string;            // UUID de la société cliente
  provider?: string;          // UUID de la société prestataire
  year?: number;             // Filtrer par année
  month?: number;            // Filtrer par mois
  limit?: number;
  offset?: number;
}
