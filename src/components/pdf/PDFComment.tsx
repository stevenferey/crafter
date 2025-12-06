/**
 * Section commentaire du PDF CRA
 *
 * Affiche le commentaire optionnel du CRA dans un bloc stylisé.
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';

interface PDFCommentProps {
  /** Texte du commentaire */
  comment: string;
}

/**
 * Composant affichant le commentaire du CRA
 */
export function PDFComment({ comment }: PDFCommentProps) {
  return (
    <View style={pdfStyles.commentSection}>
      <Text style={pdfStyles.commentTitle}>Commentaire</Text>
      <View style={pdfStyles.commentBox}>
        <Text style={pdfStyles.commentText}>{comment}</Text>
      </View>
    </View>
  );
}
