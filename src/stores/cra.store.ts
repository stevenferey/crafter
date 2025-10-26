import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    field: 'createdAt' as const,
    direction: 'desc' as const,
  },
};

/**
 * Génère un ID unique pour un CRA
 */
const generateId = (): string => {
  return `cra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Génère un timestamp ISO pour createdAt/updatedAt
 */
const generateTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Store Zustand pour la gestion des CRAs avec persistance localStorage
 */
export const useCRAStore = create<CRAState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Récupère la liste des CRAs avec les filtres et le tri actuels
       * Mode localStorage : les données sont déjà chargées, on simule juste un délai
       */
      fetchCRAs: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simuler un délai réseau
          await new Promise((resolve) => setTimeout(resolve, 100));

          // En mode localStorage, les données sont déjà chargées
          // On ne fait que retirer le flag isLoading
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la récupération des CRAs',
            isLoading: false,
          });
        }
      },

      /**
       * Récupère un CRA par son ID et le définit comme sélectionné
       * Mode localStorage : cherche dans le state
       */
      fetchCRAById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simuler un délai réseau
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { cras } = get();
          const cra = cras.find((c) => c.id === id);

          if (!cra) {
            throw new Error('CRA introuvable');
          }

          set({ selectedCRA: cra, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la récupération du CRA',
            isLoading: false,
          });
        }
      },

      /**
       * Recherche des CRAs par texte
       * Mode localStorage : recherche dans le state
       */
      searchCRAs: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { cras } = get();
          const lowercaseQuery = query.toLowerCase();

          const results = cras.filter((cra) =>
            cra.client.toLowerCase().includes(lowercaseQuery) ||
            cra.consultant.toLowerCase().includes(lowercaseQuery) ||
            cra.activities.some((activity) =>
              activity.description.toLowerCase().includes(lowercaseQuery)
            )
          );

          set({ cras: results, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la recherche',
            isLoading: false,
          });
        }
      },

      /**
       * Crée un nouveau CRA
       * Mode localStorage : ajoute au state et persiste automatiquement
       */
      createCRA: async (data: CreateCRAInput) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const newCRA: CRA = {
            id: generateId(),
            ...data,
            activities: data.activities.map((activity) => ({
              ...activity,
              id: generateId(),
            })),
            createdAt: generateTimestamp(),
          };

          set((state) => ({
            cras: [newCRA, ...state.cras],
            isLoading: false,
          }));

          return newCRA;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la création du CRA',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Met à jour un CRA existant
       * Mode localStorage : met à jour dans le state et persiste automatiquement
       */
      updateCRA: async (id: string, data: Partial<UpdateCRAInput>) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { cras } = get();
          const existingCRA = cras.find((c) => c.id === id);

          if (!existingCRA) {
            throw new Error('CRA introuvable');
          }

          const updatedCRA: CRA = {
            ...existingCRA,
            ...data,
            id, // Préserver l'ID
            activities: data.activities
              ? data.activities.map((activity) => ({
                  ...activity,
                  id: activity.id || generateId(),
                }))
              : existingCRA.activities,
            updatedAt: generateTimestamp(),
          };

          set((state) => ({
            cras: state.cras.map((cra) => (cra.id === id ? updatedCRA : cra)),
            selectedCRA: state.selectedCRA?.id === id ? updatedCRA : state.selectedCRA,
            isLoading: false,
          }));

          return updatedCRA;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du CRA',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Supprime un CRA
       * Mode localStorage : supprime du state et persiste automatiquement
       */
      deleteCRA: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));

          set((state) => ({
            cras: state.cras.filter((cra) => cra.id !== id),
            selectedCRA: state.selectedCRA?.id === id ? null : state.selectedCRA,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression du CRA',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Définit les filtres et recharge les CRAs
       */
      setFilters: (filters: CRAFilters) => {
        set({ filters });
        get().fetchCRAs();
      },

      /**
       * Définit le tri et recharge les CRAs
       */
      setSort: (sort: CRASortOptions) => {
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
        set(initialState);
      },
    }),
    {
      name: 'crafter-cra-storage', // Nom de la clé dans localStorage
      partialize: (state) => ({
        // Persister uniquement les CRAs, pas les états temporaires
        cras: state.cras,
      }),
    }
  )
);
