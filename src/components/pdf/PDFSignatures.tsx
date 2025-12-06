/**
 * Section signatures du PDF CRA
 *
 * Affiche les blocs de signature pour le prestataire et le client,
 * avec support des images de signature uploadées.
 */

import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { env } from '@/services/api';

/** Informations de signature */
interface SignatureInfo {
  /** Nom du signataire */
  name?: string;
  /** Titre/fonction du signataire */
  title?: string;
  /** Chemin ou URL de l'image de signature */
  image?: string;
}

interface PDFSignaturesProps {
  /** Nom de la société cliente */
  clientCompanyName: string;
  /** Nom de la société prestataire */
  providerCompanyName: string;
  /** Signature du client */
  clientSignature: SignatureInfo;
  /** Signature du prestataire */
  providerSignature: SignatureInfo;
}

/**
 * Construit l'URL complète d'une image de signature
 */
function getSignatureImageUrl(path?: string): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = env.apiUrl?.replace('/api', '') || 'http://localhost:3001';
  return `${baseUrl}${path}`;
}

/**
 * Section avec les deux blocs de signature (prestataire et client)
 */
export function PDFSignatures({
  clientCompanyName,
  providerCompanyName,
  clientSignature,
  providerSignature,
}: PDFSignaturesProps) {
  const clientImageUrl = getSignatureImageUrl(clientSignature.image);
  const providerImageUrl = getSignatureImageUrl(providerSignature.image);

  return (
    <View style={pdfStyles.signaturesSection}>
      <Text style={pdfStyles.signaturesTitle}>Signatures</Text>

      <View style={pdfStyles.signaturesRow}>
        {/* Signature Prestataire */}
        <View style={pdfStyles.signatureBlock}>
          <Text style={pdfStyles.signatureLabel}>Pour le Prestataire</Text>
          <Text style={pdfStyles.signatureCompany}>{providerCompanyName}</Text>

          <View style={pdfStyles.signatureImageContainer}>
            {providerImageUrl ? (
              <Image src={providerImageUrl} style={pdfStyles.signatureImage} />
            ) : (
              <View style={pdfStyles.signaturePlaceholder} />
            )}
          </View>

          {providerSignature.name && (
            <Text style={pdfStyles.signatureName}>{providerSignature.name}</Text>
          )}
          {providerSignature.title && (
            <Text style={pdfStyles.signatureTitle}>{providerSignature.title}</Text>
          )}
        </View>

        {/* Signature Client */}
        <View style={pdfStyles.signatureBlock}>
          <Text style={pdfStyles.signatureLabel}>Pour le Client</Text>
          <Text style={pdfStyles.signatureCompany}>{clientCompanyName}</Text>

          <View style={pdfStyles.signatureImageContainer}>
            {clientImageUrl ? (
              <Image src={clientImageUrl} style={pdfStyles.signatureImage} />
            ) : (
              <View style={pdfStyles.signaturePlaceholder} />
            )}
          </View>

          {clientSignature.name && (
            <Text style={pdfStyles.signatureName}>{clientSignature.name}</Text>
          )}
          {clientSignature.title && (
            <Text style={pdfStyles.signatureTitle}>{clientSignature.title}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
