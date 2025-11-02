import { api, env } from './api';
import { logger } from '@/lib/logger';
import type { Company, CreateCompanyInput } from '@/types/company.types';

// Log de l'URL de l'API au chargement
logger.log('🌐 [Company Service] API_URL:', env.apiUrl);

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
 * Filtres pour la récupération des sociétés
 */
export interface CompanyFilters {
  designation?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service pour la gestion des sociétés
 */
export const companyService = {
  /**
   * Récupère la liste des sociétés avec filtres optionnels
   */
  async getCompanies(filters?: CompanyFilters): Promise<Company[]> {
    logger.log('🔍 [Company Service] Fetching companies...', { filters });

    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString();
    const url = `/companies${query ? `?${query}` : ''}`;

    const response = await api.get<ApiResponse<Company[]>>(url);
    logger.log(
      '✅ [Company Service] Companies fetched:',
      response.data?.length || 0
    );
    return response.data || [];
  },

  /**
   * Récupère une société par son ID
   */
  async getCompanyById(id: string): Promise<Company> {
    logger.log('🔍 [Company Service] Fetching company by ID:', id);
    const response = await api.get<ApiResponse<Company>>(`/companies/${id}`);
    if (!response.success || !response.data) {
      logger.error(
        '❌ [Company Service] Failed to fetch company:',
        response.error
      );
      throw new Error(response.error || 'Failed to fetch company');
    }
    logger.log('✅ [Company Service] Company fetched:', response.data.id);
    return response.data;
  },

  /**
   * Crée une nouvelle société
   */
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    logger.log('📝 [Company Service] Creating company...', data);
    const response = await api.post<ApiResponse<Company>>('/companies', data);
    if (!response.success || !response.data) {
      logger.error(
        '❌ [Company Service] Failed to create company:',
        response.error
      );
      throw new Error(response.error || 'Failed to create company');
    }
    logger.log('✅ [Company Service] Company created:', response.data.id);
    return response.data;
  },

  /**
   * Met à jour une société existante
   */
  async updateCompany(
    id: string,
    data: Partial<CreateCompanyInput>
  ): Promise<Company> {
    logger.log('✏️ [Company Service] Updating company:', id, data);
    const response = await api.put<ApiResponse<Company>>(
      `/companies/${id}`,
      data
    );
    if (!response.success || !response.data) {
      logger.error(
        '❌ [Company Service] Failed to update company:',
        response.error
      );
      throw new Error(response.error || 'Failed to update company');
    }
    logger.log('✅ [Company Service] Company updated:', response.data.id);
    return response.data;
  },

  /**
   * Supprime une société
   */
  async deleteCompany(id: string): Promise<void> {
    logger.log('🗑️ [Company Service] Deleting company:', id);
    const response = await api.delete<ApiResponse<void>>(`/companies/${id}`);
    if (!response.success) {
      logger.error(
        '❌ [Company Service] Failed to delete company:',
        response.error
      );
      throw new Error(response.error || 'Failed to delete company');
    }
    logger.log('✅ [Company Service] Company deleted:', id);
  },
};
