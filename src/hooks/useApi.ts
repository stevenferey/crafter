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
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useApi(
 *   () => api.get<User[]>('/users')
 * );
 *
 * if (loading) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {error.message}</div>;
 * return <div>{data?.length} utilisateurs</div>;
 * ```
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: unknown[] = [],
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction();

        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
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
      cancelled = true;
    };
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
