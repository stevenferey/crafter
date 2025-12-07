/**
 * Grille calendrier du PDF CRA
 *
 * Affiche un calendrier mensuel avec les jours travaillés mis en évidence.
 * La semaine commence le lundi. Chaque ligne affiche le numéro de semaine ISO.
 */

import { View, Text } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { pdfStyles } from './pdfStyles';
import {
  getCalendarGridMondayFirst,
  getWeekNumber,
  WEEKDAYS_MONDAY_FIRST,
  type DayInfo,
} from '@/lib/monthUtils';

interface PDFCalendarGridProps {
  /** Mois du calendrier (1-12) */
  month: number;
  /** Année du calendrier */
  year: number;
  /** Liste des jours travaillés */
  workedDays: number[];
}

/**
 * Découpe la grille en lignes de 7 jours
 */
function chunkIntoWeeks(grid: (DayInfo | null)[]): (DayInfo | null)[][] {
  const weeks: (DayInfo | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }
  return weeks;
}

/**
 * Trouve le premier jour réel dans une semaine pour calculer le numéro de semaine
 */
function getWeekNumberForRow(week: (DayInfo | null)[]): number | null {
  const firstDay = week.find((day) => day !== null);
  if (firstDay) {
    return getWeekNumber(firstDay.date);
  }
  return null;
}

/**
 * Grille calendrier avec jours travaillés et weekends différenciés
 */
export function PDFCalendarGrid({
  month,
  year,
  workedDays,
}: PDFCalendarGridProps) {
  const grid = getCalendarGridMondayFirst(month, year);
  const weeks = chunkIntoWeeks(grid);
  const workedDaysSet = new Set(workedDays);

  /**
   * Calcule les styles de la cellule en fonction de son état
   */
  const getCellStyle = (isWeekend: boolean, isWorked: boolean): Style[] => {
    const styles: Style[] = [pdfStyles.dayCell];
    if (isWeekend) styles.push(pdfStyles.dayCellWeekend);
    if (isWorked) styles.push(pdfStyles.dayCellWorked);
    return styles;
  };

  /**
   * Calcule les styles du texte en fonction de son état
   */
  const getTextStyle = (isWeekend: boolean, isWorked: boolean): Style[] => {
    const styles: Style[] = [pdfStyles.dayText];
    if (isWeekend) styles.push(pdfStyles.dayTextWeekend);
    if (isWorked) styles.push(pdfStyles.dayTextWorked);
    return styles;
  };

  return (
    <View style={pdfStyles.calendarSection}>
      <View style={pdfStyles.calendarContainer}>
        {/* En-tête : Sem + Lun-Dim */}
        <View style={pdfStyles.weekHeader}>
          <View style={pdfStyles.weekNumberHeaderCell}>
            <Text style={pdfStyles.weekNumberHeaderText}>Sem</Text>
          </View>
          {WEEKDAYS_MONDAY_FIRST.map((day) => (
            <View key={day} style={pdfStyles.weekHeaderCell}>
              <Text style={pdfStyles.weekHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Lignes par semaine */}
        <View style={pdfStyles.calendarGrid}>
          {weeks.map((week, weekIndex) => {
            const weekNumber = getWeekNumberForRow(week);

            return (
              <View key={`week-${weekIndex}`} style={pdfStyles.calendarRow}>
                {/* Numéro de semaine */}
                <View style={pdfStyles.weekNumberCell}>
                  <Text style={pdfStyles.weekNumberText}>
                    {weekNumber !== null ? `n°${weekNumber}` : ''}
                  </Text>
                </View>

                {/* 7 jours de la semaine */}
                {week.map((dayInfo, dayIndex) => {
                  if (!dayInfo) {
                    return (
                      <View
                        key={`empty-${weekIndex}-${dayIndex}`}
                        style={pdfStyles.dayCellEmpty}
                      />
                    );
                  }

                  const isWorked = workedDaysSet.has(dayInfo.day);
                  const isWeekend = dayInfo.isWeekend;

                  return (
                    <View
                      key={dayInfo.day}
                      style={getCellStyle(isWeekend, isWorked)}
                    >
                      <Text style={getTextStyle(isWeekend, isWorked)}>
                        {dayInfo.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>

      {/* Légende */}
      <View style={pdfStyles.legend}>
        <View style={pdfStyles.legendItem}>
          <View style={[pdfStyles.legendBox, pdfStyles.legendBoxWorked]} />
          <Text style={pdfStyles.legendText}>Jour travaillé</Text>
        </View>
        <View style={pdfStyles.legendItem}>
          <View style={[pdfStyles.legendBox, pdfStyles.legendBoxWeekend]} />
          <Text style={pdfStyles.legendText}>Week-end</Text>
        </View>
      </View>
    </View>
  );
}
