import { api } from './api';
import type {
  CRA,
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
  CRASortOptions,
} from '@/types/cra.types';

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
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortDir', sort.direction);
    }

    const query = params.toString();
    const url = `/cras${query ? `?${query}` : ''}`;

    return api.get<CRA[]>(url);
  },

  /**
   * Récupère un CRA par son ID
   */
  async getCRAById(id: string): Promise<CRA> {
    return api.get<CRA>(`/cras/${id}`);
  },

  /**
   * Crée un nouveau CRA
   */
  async createCRA(data: CreateCRAInput): Promise<CRA> {
    return api.post<CRA>('/cras', data);
  },

  /**
   * Met à jour un CRA existant
   */
  async updateCRA(id: string, data: Partial<UpdateCRAInput>): Promise<CRA> {
    return api.put<CRA>(`/cras/${id}`, data);
  },

  /**
   * Supprime un CRA
   */
  async deleteCRA(id: string): Promise<void> {
    return api.delete(`/cras/${id}`);
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
