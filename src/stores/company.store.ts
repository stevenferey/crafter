import { create } from 'zustand';
import { companyService, type CompanyFilters } from '@/services/company.service';
import { logger } from '@/lib/logger';
import type { Company, CreateCompanyInput } from '@/types/company.types';

/**
 * Interface de l'état du store Company
 */
interface CompanyState {
  // État
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  filters: CompanyFilters;

  // Actions de récupération
  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (id: string) => Promise<void>;

  // Actions de modification
  createCompany: (data: CreateCompanyInput) => Promise<Company>;
  updateCompany: (id: string, data: Partial<CreateCompanyInput>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;

  // Actions de gestion de l'état
  setFilters: (filters: CompanyFilters) => void;
  setSelectedCompany: (company: Company | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * État initial du store
 */
const initialState = {
  companies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,
  filters: {},
};

/**
 * Store Zustand pour la gestion des sociétés avec API backend
 */
export const useCompanyStore = create<CompanyState>()((set, get) => ({
  ...initialState,

  /**
   * Récupère la liste des sociétés depuis l'API avec les filtres actuels
   */
  fetchCompanies: async () => {
    logger.log('🔄 [Company Store] Fetching companies from API...');
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const companies = await companyService.getCompanies(filters);
      logger.log('✅ [Company Store] Companies loaded:', companies.length);
      set({ companies, isLoading: false });
    } catch (error) {
      logger.error('❌ [Company Store] Error fetching companies:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des sociétés',
        isLoading: false,
      });
    }
  },

  /**
   * Récupère une société par son ID depuis l'API et la définit comme sélectionnée
   */
  fetchCompanyById: async (id: string) => {
    logger.log('🔄 [Company Store] Fetching company by ID:', id);
    set({ isLoading: true, error: null });
    try {
      const company = await companyService.getCompanyById(id);
      logger.log('✅ [Company Store] Company loaded:', company.id);
      set({ selectedCompany: company, isLoading: false });
    } catch (error) {
      logger.error('❌ [Company Store] Error fetching company:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération de la société',
        isLoading: false,
      });
    }
  },

  /**
   * Crée une nouvelle société via l'API puis recharge la liste
   */
  createCompany: async (data: CreateCompanyInput) => {
    logger.log('📝 [Company Store] Creating company...');
    set({ isLoading: true, error: null });
    try {
      const newCompany = await companyService.createCompany(data);
      logger.log('✅ [Company Store] Company created:', newCompany.id);

      // Recharger la liste des sociétés pour avoir les données à jour
      await get().fetchCompanies();

      return newCompany;
    } catch (error) {
      logger.error('❌ [Company Store] Error creating company:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la création de la société',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Met à jour une société existante via l'API puis recharge la liste
   */
  updateCompany: async (id: string, data: Partial<CreateCompanyInput>) => {
    logger.log('✏️ [Company Store] Updating company:', id);
    set({ isLoading: true, error: null });
    try {
      const updatedCompany = await companyService.updateCompany(id, data);
      logger.log('✅ [Company Store] Company updated:', updatedCompany.id);

      // Recharger la liste des sociétés pour avoir les données à jour
      await get().fetchCompanies();

      // Si c'était la société sélectionnée, la mettre à jour aussi
      if (get().selectedCompany?.id === id) {
        set({ selectedCompany: updatedCompany });
      }

      return updatedCompany;
    } catch (error) {
      logger.error('❌ [Company Store] Error updating company:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la mise à jour de la société',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Supprime une société via l'API puis recharge la liste
   */
  deleteCompany: async (id: string) => {
    logger.log('🗑️ [Company Store] Deleting company:', id);
    set({ isLoading: true, error: null });
    try {
      await companyService.deleteCompany(id);
      logger.log('✅ [Company Store] Company deleted');

      // Recharger la liste des sociétés
      await get().fetchCompanies();

      // Si c'était la société sélectionnée, la désélectionner
      if (get().selectedCompany?.id === id) {
        set({ selectedCompany: null });
      }
    } catch (error) {
      logger.error('❌ [Company Store] Error deleting company:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la suppression de la société',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Définit les filtres et recharge les sociétés
   */
  setFilters: (filters: CompanyFilters) => {
    logger.log('🔧 [Company Store] Setting filters:', filters);
    set({ filters });
    get().fetchCompanies();
  },

  /**
   * Définit la société sélectionnée
   */
  setSelectedCompany: (company: Company | null) => {
    set({ selectedCompany: company });
  },

  /**
   * Efface l'erreur courante
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Réinitialise le store à son état initial
   */
  reset: () => {
    logger.log('🔄 [Company Store] Resetting store');
    set(initialState);
  },
}));
