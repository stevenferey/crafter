/**
 * En-tête du document PDF CRA
 *
 * Affiche le titre "Compte Rendu d'Activité" avec le style DiscoData.
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';

/**
 * Composant d'en-tête pour le PDF CRA
 */
export function PDFHeader() {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.headerTitle}>Compte Rendu d'Activité</Text>
    </View>
  );
}
