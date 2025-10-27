/**
 * Type définissant les statuts possibles d'un CRA
 */
export type CRAStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/**
 * Interface représentant une activité dans un CRA
 */
export interface Activity {
  id: string;
  cra_id?: string; // Optionnel car pas présent lors de la création
  description: string;
  hours: number;
  category: string;
  created_at?: string; // Format ISO 8601
}

/**
 * Interface représentant un Compte Rendu d'Activité (CRA)
 */
export interface CRA {
  id: string;
  date: string; // Format ISO 8601 (YYYY-MM-DD)
  client: string;
  total_hours: number;
  activities: Activity[];
  status: CRAStatus;
  created_at: string; // Format ISO 8601
  updated_at: string; // Format ISO 8601
}

/**
 * Type pour la création d'un nouveau CRA (sans id, createdAt, updatedAt, total_hours)
 */
export type CreateCRAInput = {
  date: string;
  client: string;
  status?: CRAStatus;
  activities: CreateActivityInput[];
};

/**
 * Type pour la mise à jour d'un CRA
 */
export type UpdateCRAInput = {
  date?: string;
  client?: string;
  status?: CRAStatus;
  activities?: CreateActivityInput[];
};

/**
 * Type pour la création d'une nouvelle activité (sans id, cra_id, created_at)
 */
export type CreateActivityInput = {
  description: string;
  hours: number;
  category: string;
};

/**
 * Type pour la mise à jour d'une activité
 */
export type UpdateActivityInput = Partial<CreateActivityInput> & {
  id: string;
};

/**
 * Interface pour les filtres de recherche de CRA
 */
export interface CRAFilters {
  client?: string;
  status?: CRAStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Interface pour les options de tri de CRA
 */
export interface CRASortOptions {
  field: 'date' | 'client' | 'created_at' | 'total_hours';
  direction: 'asc' | 'desc';
}
