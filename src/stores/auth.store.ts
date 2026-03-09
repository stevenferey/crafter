import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/token-store';
import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
} from '@/types/auth.types';

interface AuthState {
  // État
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // État initial
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Connexion
  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);

      tokenStore.set(response.accessToken);
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('[Auth Store] User logged in');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Échec de la connexion';

      tokenStore.set(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  // Inscription
  register: async (data) => {
    set({ isLoading: true, error: null });

    try {
      await authService.register(data);
      set({ isLoading: false, error: null });
      console.log('[Auth Store] User registered');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec de l'inscription";

      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('[Auth Store] Logout error:', error);
    } finally {
      tokenStore.set(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      });
      console.log('[Auth Store] User logged out');
    }
  },

  // Rafraîchir l'authentification
  refreshAuth: async () => {
    try {
      const response = await authService.refreshToken();

      tokenStore.set(response.accessToken);
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
      });

      console.log('[Auth Store] Auth refreshed');
      return true;
    } catch (error) {
      console.error('[Auth Store] Refresh failed:', error);

      tokenStore.set(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });

      return false;
    }
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await authService.updateProfile(data);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });

      console.log('[Auth Store] Profile updated');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Échec de la mise à jour du profil';

      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Setters
  setAccessToken: (token) => {
    tokenStore.set(token);
    set({ accessToken: token });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  clearError: () => set({ error: null }),

  // Initialiser l'authentification au démarrage
  initialize: async () => {
    const { isInitialized } = get();

    // Ne pas initialiser deux fois
    if (isInitialized) return;

    set({ isLoading: true });

    try {
      // Essayer de rafraîchir via le cookie httpOnly
      const success = await get().refreshAuth();

      set({
        isLoading: false,
        isInitialized: true,
      });

      if (success) {
        console.log('[Auth Store] Initialized via refresh token');
      } else {
        console.log('[Auth Store] No valid session found');
      }
    } catch (error) {
      console.error('[Auth Store] Initialization error:', error);
      tokenStore.set(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));

// Hook helper pour vérifier si l'utilisateur est admin
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};

// Hook helper pour obtenir l'utilisateur ou rediriger
export const useRequireAuth = () => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  return { user, isAuthenticated, isLoading, isInitialized };
};
