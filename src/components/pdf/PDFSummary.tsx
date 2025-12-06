/**
 * Section résumé du PDF CRA
 *
 * Affiche le total des jours travaillés dans un bandeau coloré.
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';

interface PDFSummaryProps {
  /** Nombre de jours travaillés */
  workedDaysCount: number;
}

/**
 * Composant résumé affichant le total des jours travaillés
 */
export function PDFSummary({ workedDaysCount }: PDFSummaryProps) {
  return (
    <View style={pdfStyles.summarySection}>
      <Text style={pdfStyles.summaryLabel}>Total des jours travaillés</Text>
      <Text style={pdfStyles.summaryValue}>
        {workedDaysCount} jour{workedDaysCount > 1 ? 's' : ''}
      </Text>
    </View>
  );
}
