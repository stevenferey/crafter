/**
 * Logger conditionnel pour l'application
 * Les logs sont affichés uniquement en mode développement
 * Les erreurs sont toujours affichées (même en production)
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log standard (affiché uniquement en développement)
   */
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log d'information (affiché uniquement en développement)
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Log de warning (affiché uniquement en développement)
   */
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log d'erreur (toujours affiché, même en production)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Log de debug (affiché uniquement en développement)
   */
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log de table (affiché uniquement en développement)
   */
  table: (data: unknown): void => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Groupe de logs (affiché uniquement en développement)
   */
  group: (label: string): void => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * Fin de groupe de logs (affiché uniquement en développement)
   */
  groupEnd: (): void => {
    if (isDev) {
      console.groupEnd();
    }
  },
} as const;
