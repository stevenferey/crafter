// Types pour les CRA et activités

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
  date: string;
  client_id: string; // UUID de la société cliente
  provider_id: string; // UUID de la société prestataire
  activities: Activity[];
  total_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface CreateCRAInput {
  date: string;
  client_id: string; // UUID de la société cliente (obligatoire)
  provider_id: string; // UUID de la société prestataire (obligatoire)
  activities: Omit<Activity, 'id' | 'cra_id' | 'created_at'>[];
  status?: 'draft' | 'submitted';
}

export interface UpdateCRAInput {
  date?: string;
  client_id?: string; // UUID de la société cliente
  provider_id?: string; // UUID de la société prestataire
  activities?: Omit<Activity, 'id' | 'cra_id' | 'created_at'>[];
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface CRAFilters {
  status?: string;
  client?: string; // UUID de la société cliente (client_id)
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
