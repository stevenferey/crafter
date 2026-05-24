/**
 * Document PDF complet pour un CRA
 *
 * Assemble tous les composants PDF pour générer un compte rendu
 * d'activité professionnel sur une seule page A4.
 *
 * @example
 * ```tsx
 * import { pdf } from '@react-pdf/renderer';
 * import { CRAPDFDocument } from '@/components/pdf';
 *
 * const blob = await pdf(
 *   <CRAPDFDocument cra={cra} clientCompany={client} providerCompany={provider} />
 * ).toBlob();
 * ```
 */

import { Document, Page, Text, Font } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { PDFHeader } from './PDFHeader';
import { PDFInfoSection } from './PDFInfoSection';
import { PDFCalendarGrid } from './PDFCalendarGrid';
import { PDFSummary } from './PDFSummary';
import { PDFComment } from './PDFComment';
import { PDFSignatures } from './PDFSignatures';
import type { CRA } from '@/types/cra.types';
import type { Company } from '@/types/company.types';

/**
 * Enregistrement de la police manuscrite Caveat (Google Fonts)
 * Utilisée pour la mention "lu et approuvé" dans le bloc signature prestataire
 * @see https://fonts.google.com/specimen/Caveat
 */
Font.register({
  family: 'Caveat',
  src: 'https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9SII.ttf',
});

interface CRAPDFDocumentProps {
  /** Données du CRA */
  cra: CRA;
  /** Société cliente */
  clientCompany: Company;
  /** Société prestataire */
  providerCompany: Company;
}

/**
 * Document PDF CRA complet
 *
 * Structure du document :
 * - En-tête avec titre
 * - Bandeau période
 * - Informations des sociétés (2 colonnes)
 * - Calendrier avec jours travaillés
 * - Résumé (total jours)
 * - Commentaire (optionnel)
 * - Signatures
 * - Footer avec date de génération
 */
export function CRAPDFDocument({
  cra,
  clientCompany,
  providerCompany,
}: CRAPDFDocumentProps) {
  const workedDaysCount = cra.worked_days?.length || 0;

  // Normalise une date reçue du backend (ISO timestamp ou YYYY-MM-DD) en YYYY-MM-DD
  const toIsoDate = (raw?: string | null): string | undefined =>
    raw ? raw.substring(0, 10) : undefined;

  // Récupérer les signatures (CRA override ou défaut company)
  const clientSignature = {
    name: cra.client_signatory_name || clientCompany.default_signatory_name,
    title: cra.client_signatory_title || clientCompany.default_signatory_title,
    image: cra.client_signature_image || clientCompany.default_signature_image,
    location:
      cra.client_signature_location || clientCompany.default_signature_location,
    useCurrentDate:
      cra.client_use_current_date ?? clientCompany.default_use_current_date,
    signatureDate: toIsoDate(cra.client_signature_date),
  };

  const providerSignature = {
    name: cra.provider_signatory_name || providerCompany.default_signatory_name,
    title:
      cra.provider_signatory_title || providerCompany.default_signatory_title,
    image:
      cra.provider_signature_image || providerCompany.default_signature_image,
    location:
      cra.provider_signature_location ||
      providerCompany.default_signature_location,
    useCurrentDate:
      cra.provider_use_current_date ?? providerCompany.default_use_current_date,
    signatureDate: toIsoDate(cra.provider_signature_date),
  };

  return (
    <Document
      title={`CRA - ${providerCompany.designation} - ${clientCompany.designation}`}
      author={providerCompany.designation}
      subject={`Compte Rendu d'Activité - ${cra.month}/${cra.year}`}
    >
      <Page size="A4" style={pdfStyles.page}>
        <PDFHeader />

        <PDFInfoSection
          providerCompany={providerCompany}
          clientCompany={clientCompany}
          month={cra.month}
          year={cra.year}
        />

        <PDFCalendarGrid
          month={cra.month}
          year={cra.year}
          workedDays={cra.worked_days || []}
        />

        <PDFSummary workedDaysCount={workedDaysCount} />

        {cra.comment && <PDFComment comment={cra.comment} />}

        <PDFSignatures
          clientCompanyName={clientCompany.designation}
          providerCompanyName={providerCompany.designation}
          clientSignature={clientSignature}
          providerSignature={providerSignature}
        />

        <Text style={pdfStyles.footer}>
          Document généré automatiquement par crafter – ©{' '}
          {new Date().getFullYear()} DiscoData. Tous droits réservés.
        </Text>
      </Page>
    </Document>
  );
}
