/**
 * Utilitaires pour formater les dates au format YYYY-MM-DD
 */
export const datePickerUtils = {
  /**
   * Convertit une Date en string format YYYY-MM-DD
   */
  formatDate: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Convertit un string YYYY-MM-DD en Date
   */
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   */
  getToday: (): string => {
    return datePickerUtils.formatDate(new Date());
  },

  /**
   * Retourne une date relative (ex: -7 jours) au format YYYY-MM-DD
   */
  getRelativeDate: (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return datePickerUtils.formatDate(date);
  },

  /**
   * Formate une date au format français long
   * @param dateString - Date au format YYYY-MM-DD
   * @returns Date formatée (ex: "15 janvier 2025")
   */
  formatDateLong: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
};
