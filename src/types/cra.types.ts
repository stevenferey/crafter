/**
 * Type définissant les statuts possibles d'un CRA
 */
export type CRAStatus = 'draft' | 'completed' | 'submitted' | 'approved' | 'rejected';

/**
 * Interface représentant une activité dans un CRA
 */
export interface Activity {
  id: string;
  date: string; // Format ISO 8601 (YYYY-MM-DD)
  description: string;
  hours: number;
}

/**
 * Interface représentant un Compte Rendu d'Activité (CRA)
 */
export interface CRA {
  id: string;
  month: string;
  year: string;
  client: string;
  consultant: string;
  days: number;
  activities: Activity[];
  status: CRAStatus;
  createdAt: string; // Format ISO 8601
  updatedAt?: string; // Format ISO 8601
}

/**
 * Type pour la création d'un nouveau CRA (sans id, createdAt, updatedAt)
 */
export type CreateCRAInput = Omit<CRA, 'id' | 'createdAt' | 'updatedAt' | 'activities'> & {
  activities: CreateActivityInput[];
};

/**
 * Type pour la mise à jour d'un CRA (tous les champs optionnels sauf id)
 */
export type UpdateCRAInput = Partial<Omit<CRA, 'id' | 'createdAt'>> & {
  id: string;
};

/**
 * Type pour la création d'une nouvelle activité (sans id)
 */
export type CreateActivityInput = Omit<Activity, 'id'>;

/**
 * Type pour la mise à jour d'une activité
 */
export type UpdateActivityInput = Partial<Omit<Activity, 'id'>> & {
  id: string;
};

/**
 * Interface pour les filtres de recherche de CRA
 */
export interface CRAFilters {
  client?: string;
  consultant?: string;
  status?: CRAStatus;
  year?: string;
  month?: string;
}

/**
 * Interface pour les options de tri de CRA
 */
export interface CRASortOptions {
  field: keyof CRA;
  direction: 'asc' | 'desc';
}
