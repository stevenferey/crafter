/**
 * Configuration de l'API et fonctions utilitaires pour les requêtes HTTP
 */

// Configuration de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Crafter';

/**
 * Fonction pour récupérer le token d'accès depuis le localStorage
 * Évite la dépendance circulaire avec le store
 */
const getAccessToken = (): string | null => {
  try {
    const stored = localStorage.getItem('crafter-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.accessToken || null;
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return null;
};

/**
 * Options par défaut pour les requêtes fetch
 */
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Nécessaire pour les cookies (refresh token)
};

/**
 * Classe pour gérer les erreurs API
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fonction utilitaire pour effectuer des requêtes API
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Récupérer le token d'accès pour les requêtes authentifiées
  const accessToken = getAccessToken();

  const config: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
      // Ajouter le token d'authentification si disponible
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  };

  try {
    const response = await fetch(url, config);

    // Tenter de parser le JSON même en cas d'erreur
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // Extraire le message d'erreur du backend si disponible
      let errorMessage = `Erreur API: ${response.statusText}`;
      if (data && typeof data === 'object' && 'message' in data) {
        errorMessage = (data as { message: string }).message;
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Erreur réseau inconnue',
      0,
    );
  }
}

/**
 * API Client avec méthodes HTTP
 */
export const api = {
  /**
   * Requête GET
   */
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchAPI<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * Requête POST
   */
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * Requête PUT
   */
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * Requête PATCH
   */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * Requête DELETE
   */
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchAPI<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Interface pour les réponses API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Fonction utilitaire pour extraire les données d'une réponse API
 * Lance une erreur si la réponse n'est pas valide
 *
 * @param response - Réponse API à traiter
 * @param defaultError - Message d'erreur par défaut
 * @returns Les données extraites
 * @throws {Error} Si la réponse n'est pas valide
 */
export function unwrapApiResponse<T>(
  response: ApiResponse<T>,
  defaultError: string,
): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || defaultError);
  }
  return response.data;
}

/**
 * Variables d'environnement exportées
 */
export const env = {
  apiUrl: API_URL,
  aiApiKey: AI_API_KEY,
  appName: APP_NAME,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
