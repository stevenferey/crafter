import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Type pour les thèmes disponibles
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Type pour les niveaux de notification
 */
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

/**
 * Interface pour une notification
 */
export interface Notification {
  id: string;
  message: string;
  level: NotificationLevel;
  duration?: number; // Durée en millisecondes
  createdAt: number;
}

/**
 * Interface de l'état du store App
 */
interface AppState {
  // État UI
  isSidebarOpen: boolean;
  theme: Theme;
  isGlobalLoading: boolean;
  notifications: Notification[];

  // Actions UI
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setTheme: (theme: Theme) => void;
  setGlobalLoading: (isLoading: boolean) => void;

  // Actions de notification
  addNotification: (
    message: string,
    level?: NotificationLevel,
    duration?: number,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Actions générales
  reset: () => void;
}

/**
 * État initial du store
 */
const initialState = {
  isSidebarOpen: true,
  theme: 'system' as Theme,
  isGlobalLoading: false,
  notifications: [],
};

/**
 * Store Zustand pour la gestion de l'état global de l'application
 * Utilise le middleware persist pour sauvegarder certaines préférences
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Bascule l'état de la sidebar (ouvert/fermé)
       */
      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      /**
       * Définit l'état de la sidebar
       */
      setSidebarOpen: (isOpen: boolean) => {
        set({ isSidebarOpen: isOpen });
      },

      /**
       * Définit le thème de l'application
       */
      setTheme: (theme: Theme) => {
        set({ theme });

        // Appliquer le thème au document
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // Mode système
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      /**
       * Définit l'état de chargement global
       */
      setGlobalLoading: (isLoading: boolean) => {
        set({ isGlobalLoading: isLoading });
      },

      /**
       * Ajoute une notification
       */
      addNotification: (
        message: string,
        level: NotificationLevel = 'info',
        duration: number = 5000,
      ) => {
        const notification: Notification = {
          id: `${Date.now()}-${Math.random()}`,
          message,
          level,
          duration,
          createdAt: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));

        // Auto-suppression après la durée spécifiée
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, duration);
        }
      },

      /**
       * Supprime une notification par son ID
       */
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      /**
       * Efface toutes les notifications
       */
      clearNotifications: () => {
        set({ notifications: [] });
      },

      /**
       * Réinitialise le store à son état initial
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'crafter-app-storage', // Nom de la clé dans localStorage
      partialize: (state) => ({
        // Ne persister que certaines propriétés
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);

/**
 * Hook pour écouter les changements de préférence de thème système
 */
export const useSystemThemeListener = () => {
  const { theme, setTheme } = useAppStore();

  // Écouter les changements de préférence système
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme('system'); // Réappliquer le thème système
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
};
