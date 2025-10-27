import { create } from 'zustand';
import { craService } from '@/services/cra.service';
import type {
  CRA,
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
  CRASortOptions,
} from '@/types/cra.types';

/**
 * Interface de l'état du store CRA
 */
interface CRAState {
  // État
  cras: CRA[];
  selectedCRA: CRA | null;
  isLoading: boolean;
  error: string | null;
  filters: CRAFilters;
  sort: CRASortOptions;

  // Actions de récupération
  fetchCRAs: () => Promise<void>;
  fetchCRAById: (id: string) => Promise<void>;
  searchCRAs: (query: string) => Promise<void>;

  // Actions de modification
  createCRA: (data: CreateCRAInput) => Promise<CRA>;
  updateCRA: (id: string, data: Partial<UpdateCRAInput>) => Promise<CRA>;
  deleteCRA: (id: string) => Promise<void>;

  // Actions de gestion de l'état
  setFilters: (filters: CRAFilters) => void;
  setSort: (sort: CRASortOptions) => void;
  setSelectedCRA: (cra: CRA | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * État initial du store
 */
const initialState = {
  cras: [],
  selectedCRA: null,
  isLoading: false,
  error: null,
  filters: {},
  sort: {
    field: 'date' as const,
    direction: 'desc' as const,
  },
};

/**
 * Store Zustand pour la gestion des CRAs avec API backend
 */
export const useCRAStore = create<CRAState>()((set, get) => ({
  ...initialState,

  /**
   * Récupère la liste des CRAs depuis l'API avec les filtres et le tri actuels
   */
  fetchCRAs: async () => {
    console.log('🔄 [CRA Store] Fetching CRAs from API...');
    set({ isLoading: true, error: null });
    try {
      const { filters, sort } = get();
      const cras = await craService.getCRAs(filters, sort);
      console.log('✅ [CRA Store] CRAs loaded:', cras.length);
      set({ cras, isLoading: false });
    } catch (error) {
      console.error('❌ [CRA Store] Error fetching CRAs:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des CRAs',
        isLoading: false,
      });
    }
  },

  /**
   * Récupère un CRA par son ID depuis l'API et le définit comme sélectionné
   */
  fetchCRAById: async (id: string) => {
    console.log('🔄 [CRA Store] Fetching CRA by ID:', id);
    set({ isLoading: true, error: null });
    try {
      const cra = await craService.getCRAById(id);
      console.log('✅ [CRA Store] CRA loaded:', cra.id);
      set({ selectedCRA: cra, isLoading: false });
    } catch (error) {
      console.error('❌ [CRA Store] Error fetching CRA:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération du CRA',
        isLoading: false,
      });
    }
  },

  /**
   * Recherche des CRAs par texte via l'API
   */
  searchCRAs: async (query: string) => {
    console.log('🔍 [CRA Store] Searching CRAs:', query);
    set({ isLoading: true, error: null });
    try {
      const cras = await craService.searchCRAs(query);
      console.log('✅ [CRA Store] Search results:', cras.length);
      set({ cras, isLoading: false });
    } catch (error) {
      console.error('❌ [CRA Store] Error searching CRAs:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Erreur lors de la recherche',
        isLoading: false,
      });
    }
  },

  /**
   * Crée un nouveau CRA via l'API puis recharge la liste
   */
  createCRA: async (data: CreateCRAInput) => {
    console.log('📝 [CRA Store] Creating CRA...');
    set({ isLoading: true, error: null });
    try {
      const newCRA = await craService.createCRA(data);
      console.log('✅ [CRA Store] CRA created:', newCRA.id);

      // Recharger la liste des CRAs pour avoir les données à jour
      await get().fetchCRAs();

      return newCRA;
    } catch (error) {
      console.error('❌ [CRA Store] Error creating CRA:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la création du CRA',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Met à jour un CRA existant via l'API puis recharge la liste
   */
  updateCRA: async (id: string, data: Partial<UpdateCRAInput>) => {
    console.log('✏️ [CRA Store] Updating CRA:', id);
    set({ isLoading: true, error: null });
    try {
      const updatedCRA = await craService.updateCRA(id, data);
      console.log('✅ [CRA Store] CRA updated:', updatedCRA.id);

      // Recharger la liste des CRAs pour avoir les données à jour
      await get().fetchCRAs();

      // Si c'était le CRA sélectionné, le mettre à jour aussi
      if (get().selectedCRA?.id === id) {
        set({ selectedCRA: updatedCRA });
      }

      return updatedCRA;
    } catch (error) {
      console.error('❌ [CRA Store] Error updating CRA:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la mise à jour du CRA',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Supprime un CRA via l'API puis recharge la liste
   */
  deleteCRA: async (id: string) => {
    console.log('🗑️ [CRA Store] Deleting CRA:', id);
    set({ isLoading: true, error: null });
    try {
      await craService.deleteCRA(id);
      console.log('✅ [CRA Store] CRA deleted');

      // Recharger la liste des CRAs
      await get().fetchCRAs();

      // Si c'était le CRA sélectionné, le désélectionner
      if (get().selectedCRA?.id === id) {
        set({ selectedCRA: null });
      }
    } catch (error) {
      console.error('❌ [CRA Store] Error deleting CRA:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la suppression du CRA',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Définit les filtres et recharge les CRAs
   */
  setFilters: (filters: CRAFilters) => {
    console.log('🔧 [CRA Store] Setting filters:', filters);
    set({ filters });
    get().fetchCRAs();
  },

  /**
   * Définit le tri et recharge les CRAs
   */
  setSort: (sort: CRASortOptions) => {
    console.log('🔧 [CRA Store] Setting sort:', sort);
    set({ sort });
    get().fetchCRAs();
  },

  /**
   * Définit le CRA sélectionné
   */
  setSelectedCRA: (cra: CRA | null) => {
    set({ selectedCRA: cra });
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
    console.log('🔄 [CRA Store] Resetting store');
    set(initialState);
  },
}));
