import { useState, useEffect } from 'react';
import { ApiError } from '@/services/api';

/**
 * État de la requête API
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook personnalisé pour gérer les requêtes API avec état
 * Utilise AbortController pour annuler les requêtes en cours lors du démontage du composant
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useApi(
 *   (signal) => api.get<User[]>('/users', { signal }),
 *   []
 * );
 *
 * if (loading) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {error.message}</div>;
 * return <div>{data?.length} utilisateurs</div>;
 * ```
 */
export function useApi<T>(
  apiFunction: (signal: AbortSignal) => Promise<T>,
  dependencies: unknown[] = [],
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(controller.signal);

        // Ne mettre à jour l'état que si la requête n'a pas été annulée
        if (!controller.signal.aborted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        // Ignorer les erreurs d'annulation (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        if (!controller.signal.aborted) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof ApiError
                ? error
                : new ApiError('Erreur inconnue', 0),
          });
        }
      }
    };

    fetchData();

    return () => {
      // Annuler la requête en cours lors du démontage
      controller.abort();
    };
    // Note: On utilise dependencies fourni par l'utilisateur pour contrôler quand refetch
    // La fonction apiFunction ne doit pas être dans les dépendances car elle change à chaque render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}

/**
 * Hook pour les mutations API (POST, PUT, DELETE, etc.)
 *
 * @example
 * ```tsx
 * const { mutate, loading, error } = useApiMutation(
 *   (id: string) => api.delete(`/users/${id}`)
 * );
 *
 * const handleDelete = async () => {
 *   const result = await mutate('123');
 *   if (result) {
 *     console.log('Supprimé avec succès');
 *   }
 * };
 * ```
 */
export function useApiMutation<T, Args extends unknown[]>(
  mutationFn: (...args: Args) => Promise<T>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = async (...args: Args): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(...args);
      setLoading(false);
      return result;
    } catch (err) {
      const apiError =
        err instanceof ApiError ? err : new ApiError('Erreur inconnue', 0);
      setError(apiError);
      setLoading(false);
      return null;
    }
  };

  return { mutate, loading, error };
}
