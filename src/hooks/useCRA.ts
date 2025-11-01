import { useEffect } from 'react';
import { useCRAStore } from '@/stores/cra.store';
import type { CRA } from '@/types/cra.types';

/**
 * Hook personnalisé pour charger un CRA par son ID
 * Gère automatiquement le chargement et retourne l'état
 *
 * @param id - ID du CRA à charger
 * @returns État du CRA (cra, isLoading, error)
 *
 * @example
 * ```tsx
 * const { cra, isLoading, error } = useCRA(id);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <div>Erreur: {error}</div>;
 * if (!cra) return <div>CRA introuvable</div>;
 *
 * return <div>{cra.client}</div>;
 * ```
 */
export function useCRA(id: string | undefined) {
  const selectedCRA = useCRAStore((state) => state.selectedCRA);
  const fetchCRAById = useCRAStore((state) => state.fetchCRAById);
  const isLoading = useCRAStore((state) => state.isLoading);
  const error = useCRAStore((state) => state.error);

  useEffect(() => {
    if (id) {
      fetchCRAById(id);
    }
  }, [id, fetchCRAById]);

  return {
    cra: selectedCRA as CRA | null,
    isLoading,
    error,
  };
}
