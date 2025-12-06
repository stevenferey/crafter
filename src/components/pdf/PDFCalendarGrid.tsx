/**
 * Grille calendrier du PDF CRA
 *
 * Affiche un calendrier mensuel avec les jours travaillés mis en évidence.
 * La semaine commence le lundi.
 */

import { View, Text } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { pdfStyles } from './pdfStyles';
import { getCalendarGridMondayFirst, WEEKDAYS_MONDAY_FIRST } from '@/lib/monthUtils';

interface PDFCalendarGridProps {
  /** Mois du calendrier (1-12) */
  month: number;
  /** Année du calendrier */
  year: number;
  /** Liste des jours travaillés */
  workedDays: number[];
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
        {/* En-tête des jours (Lun-Dim) */}
        <View style={pdfStyles.weekHeader}>
          {WEEKDAYS_MONDAY_FIRST.map((day) => (
            <View key={day} style={pdfStyles.weekHeaderCell}>
              <Text style={pdfStyles.weekHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Grille des jours */}
        <View style={pdfStyles.calendarGrid}>
          {grid.map((dayInfo, index) => {
            if (!dayInfo) {
              return <View key={`empty-${index}`} style={pdfStyles.dayCellEmpty} />;
            }

            const isWorked = workedDaysSet.has(dayInfo.day);
            const isWeekend = dayInfo.isWeekend;

            return (
              <View key={dayInfo.day} style={getCellStyle(isWeekend, isWorked)}>
                <Text style={getTextStyle(isWeekend, isWorked)}>{dayInfo.day}</Text>
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
