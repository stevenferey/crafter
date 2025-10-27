import { api, env } from './api';
import type {
  CRA,
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
  CRASortOptions,
} from '@/types/cra.types';

// Log de l'URL de l'API au chargement
console.log('🌐 [CRA Service] API_URL:', env.apiUrl);

/**
 * Format de réponse de l'API backend
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Service pour la gestion des CRAs
 */
export const craService = {
  /**
   * Récupère la liste des CRAs avec filtres et tri optionnels
   */
  async getCRAs(
    filters?: CRAFilters,
    sort?: CRASortOptions,
  ): Promise<CRA[]> {
    console.log('🔍 [CRA Service] Fetching CRAs...', { filters, sort });

    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortDir', sort.direction);
    }

    const query = params.toString();
    const url = `/cras${query ? `?${query}` : ''}`;

    const response = await api.get<ApiResponse<CRA[]>>(url);
    console.log('✅ [CRA Service] CRAs fetched:', response.data?.length || 0);
    return response.data || [];
  },

  /**
   * Récupère un CRA par son ID
   */
  async getCRAById(id: string): Promise<CRA> {
    console.log('🔍 [CRA Service] Fetching CRA by ID:', id);
    const response = await api.get<ApiResponse<CRA>>(`/cras/${id}`);
    if (!response.success || !response.data) {
      console.error('❌ [CRA Service] Failed to fetch CRA:', response.error);
      throw new Error(response.error || 'Failed to fetch CRA');
    }
    console.log('✅ [CRA Service] CRA fetched:', response.data.id);
    return response.data;
  },

  /**
   * Crée un nouveau CRA
   */
  async createCRA(data: CreateCRAInput): Promise<CRA> {
    console.log('📝 [CRA Service] Creating CRA...', data);
    const response = await api.post<ApiResponse<CRA>>('/cras', data);
    if (!response.success || !response.data) {
      console.error('❌ [CRA Service] Failed to create CRA:', response.error);
      throw new Error(response.error || 'Failed to create CRA');
    }
    console.log('✅ [CRA Service] CRA created:', response.data.id);
    return response.data;
  },

  /**
   * Met à jour un CRA existant
   */
  async updateCRA(id: string, data: Partial<UpdateCRAInput>): Promise<CRA> {
    console.log('✏️ [CRA Service] Updating CRA:', id, data);
    const response = await api.put<ApiResponse<CRA>>(`/cras/${id}`, data);
    if (!response.success || !response.data) {
      console.error('❌ [CRA Service] Failed to update CRA:', response.error);
      throw new Error(response.error || 'Failed to update CRA');
    }
    console.log('✅ [CRA Service] CRA updated:', response.data.id);
    return response.data;
  },

  /**
   * Supprime un CRA
   */
  async deleteCRA(id: string): Promise<void> {
    console.log('🗑️ [CRA Service] Deleting CRA:', id);
    const response = await api.delete<ApiResponse<void>>(`/cras/${id}`);
    if (!response.success) {
      console.error('❌ [CRA Service] Failed to delete CRA:', response.error);
      throw new Error(response.error || 'Failed to delete CRA');
    }
    console.log('✅ [CRA Service] CRA deleted');
  },

  /**
   * Génère un PDF pour un CRA
   * @returns L'URL du PDF généré
   */
  async generatePDF(id: string): Promise<{ url: string }> {
    return api.post<{ url: string }>(`/cras/${id}/pdf`, {});
  },

  /**
   * Télécharge le PDF d'un CRA
   * Cette fonction déclenche le téléchargement côté client
   */
  async downloadPDF(id: string): Promise<void> {
    const { url } = await this.generatePDF(id);

    // Créer un lien temporaire pour déclencher le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRA-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Recherche des CRAs par texte
   */
  async searchCRAs(query: string): Promise<CRA[]> {
    return api.get<CRA[]>(`/cras/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Récupère les statistiques des CRAs
   */
  async getStatistics(): Promise<{
    totalCRAs: number;
    totalDays: number;
    activeClients: number;
    averageFillRate: number;
  }> {
    return api.get('/cras/statistics');
  },
};
