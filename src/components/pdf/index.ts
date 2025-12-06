/**
 * Composants PDF pour la génération de Comptes Rendus d'Activité
 *
 * @example
 * ```tsx
 * import { CRAPDFDocument } from '@/components/pdf';
 * import { PDFViewer, pdf } from '@react-pdf/renderer';
 *
 * // Prévisualisation dans le navigateur
 * <PDFViewer>
 *   <CRAPDFDocument cra={cra} clientCompany={client} providerCompany={provider} />
 * </PDFViewer>
 *
 * // Génération et téléchargement
 * const blob = await pdf(<CRAPDFDocument ... />).toBlob();
 * ```
 */

// Composant principal
export { CRAPDFDocument } from './CRAPDFDocument';

// Sous-composants (pour usage avancé)
export { PDFHeader } from './PDFHeader';
export { PDFInfoSection } from './PDFInfoSection';
export { PDFCalendarGrid } from './PDFCalendarGrid';
export { PDFSummary } from './PDFSummary';
export { PDFComment } from './PDFComment';
export { PDFSignatures } from './PDFSignatures';

// Styles et couleurs
export { pdfStyles, colors } from './pdfStyles';
