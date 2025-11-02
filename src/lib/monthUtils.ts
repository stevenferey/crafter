/**
 * Utilitaires pour gérer les mois et les jours dans le contexte des CRA mensuels
 */

/**
 * Liste des mois en français
 */
export const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const;

/**
 * Liste des jours de la semaine en français
 */
export const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;

/**
 * Obtient le nombre de jours dans un mois donné
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Obtient le premier jour de la semaine d'un mois donné (0 = Dimanche, 6 = Samedi)
 */
export function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Formate un mois et une année en string (ex: "Janvier 2025")
 */
export function formatMonthYear(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

/**
 * Obtient le mois et l'année actuels
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // getMonth() retourne 0-11, on veut 1-12
    year: now.getFullYear(),
  };
}

/**
 * Vérifie si un jour est valide pour un mois/année donnés
 */
export function isValidDay(day: number, month: number, year: number): boolean {
  if (day < 1) return false;
  const daysInMonth = getDaysInMonth(month, year);
  return day <= daysInMonth;
}

/**
 * Génère un tableau de tous les jours d'un mois avec métadonnées
 */
export interface DayInfo {
  day: number;
  dayOfWeek: number; // 0 = Dimanche, 6 = Samedi
  isWeekend: boolean;
  date: Date;
}

export function getMonthDays(month: number, year: number): DayInfo[] {
  const daysInMonth = getDaysInMonth(month, year);
  const days: DayInfo[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    days.push({
      day,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      date,
    });
  }

  return days;
}

/**
 * Génère une grille de calendrier avec padding pour aligner les jours
 * Retourne un tableau avec null pour les jours vides et DayInfo pour les jours réels
 */
export function getCalendarGrid(month: number, year: number): (DayInfo | null)[] {
  const firstDayOfWeek = getFirstDayOfMonth(month, year);
  const monthDays = getMonthDays(month, year);

  // Ajouter des null au début pour aligner le premier jour
  const grid: (DayInfo | null)[] = Array(firstDayOfWeek).fill(null);

  // Ajouter les jours du mois
  grid.push(...monthDays);

  // Optionnel: compléter la dernière semaine pour avoir un grid complet
  // const remainingDays = 7 - (grid.length % 7);
  // if (remainingDays < 7) {
  //   grid.push(...Array(remainingDays).fill(null));
  // }

  return grid;
}

/**
 * Formate une liste de jours travaillés en string lisible
 * Ex: [1, 2, 3, 15, 20] => "1, 2, 3, 15, 20"
 */
export function formatWorkedDays(workedDays: number[]): string {
  return workedDays.sort((a, b) => a - b).join(', ');
}

/**
 * Compte le nombre de jours ouvrés (lundi-vendredi) dans une liste de jours
 */
export function countWeekdays(workedDays: number[], month: number, year: number): number {
  return workedDays.filter(day => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Pas dimanche ni samedi
  }).length;
}

/**
 * Compte le nombre de week-ends dans une liste de jours
 */
export function countWeekends(workedDays: number[], month: number, year: number): number {
  return workedDays.filter(day => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Dimanche ou samedi
  }).length;
}

/**
 * Vérifie si un mois/année est dans le futur
 */
export function isMonthInFuture(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
}

/**
 * Obtient la liste des années disponibles (passé et futur proche)
 */
export function getAvailableYears(pastYears: number = 5, futureYears: number = 2): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let i = currentYear - pastYears; i <= currentYear + futureYears; i++) {
    years.push(i);
  }

  return years;
}
