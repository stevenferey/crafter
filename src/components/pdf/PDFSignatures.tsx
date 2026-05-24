/**
 * Section signatures du PDF CRA
 *
 * Affiche deux blocs de signature côte à côte (prestataire et client).
 * Chaque bloc utilise un layout en deux colonnes :
 * - Gauche : informations (société, nom, titre, mention légale)
 * - Droite : "lu et approuvé" (manuscrit) + image de signature
 *
 * Particularités :
 * - Le prestataire a "lu et approuvé" pré-rempli en police Caveat
 * - Le client doit écrire manuellement la mention
 * - Espace réservé en bas pour notes manuscrites additionnelles
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
  /** Lieu de signature (ville) */
  location?: string;
  /** Utiliser la date courante (jour de la génération) */
  useCurrentDate?: boolean;
  /** Date fixe (YYYY-MM-DD). Prime sur useCurrentDate si présente. */
  signatureDate?: string;
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
 * Vérifie si les champs lieu/date sont vides (nécessitant un remplissage manuel)
 */
function isManualEntry(
  location?: string,
  useCurrentDate?: boolean,
  signatureDate?: string,
): boolean {
  return !location && !useCurrentDate && !signatureDate;
}

/**
 * Formate la ligne "Fait à <VILLE>,"
 */
function formatFaitALocation(location?: string): string {
  const locationPart = location
    ? location.toUpperCase()
    : '________________________';
  return `Fait à ${locationPart},`;
}

/**
 * Formate la ligne "le <DATE>"
 *
 * Trois cas :
 * - signatureDate fournie (YYYY-MM-DD) → date fixe formatée en fr-FR
 * - useCurrentDate true → date du jour à la génération
 * - sinon → champ vide à remplir à la main
 */
function formatFaitADate(
  useCurrentDate?: boolean,
  signatureDate?: string,
): string {
  let datePart: string;
  if (signatureDate) {
    // 'T00:00:00' évite les décalages de timezone (la date civile reste celle saisie)
    datePart = new Date(signatureDate + 'T00:00:00').toLocaleDateString(
      'fr-FR',
    );
  } else if (useCurrentDate) {
    datePart = new Date().toLocaleDateString('fr-FR');
  } else {
    datePart = '____/____/_______';
  }
  return `le ${datePart}`;
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
          <View style={pdfStyles.signatureContent}>
            {/* Colonne gauche : infos */}
            <View style={pdfStyles.signatureInfo}>
              <Text style={pdfStyles.signatureCompany}>
                {providerCompanyName}
              </Text>
              {providerSignature.name && (
                <Text style={pdfStyles.signatureName}>
                  {providerSignature.name}
                </Text>
              )}
              {providerSignature.title && (
                <Text style={pdfStyles.signatureTitle}>
                  {providerSignature.title}
                </Text>
              )}
              {isManualEntry(
                providerSignature.location,
                providerSignature.useCurrentDate,
                providerSignature.signatureDate,
              ) ? (
                <>
                  <Text style={pdfStyles.faitAEmpty}>
                    {formatFaitALocation(providerSignature.location)}
                  </Text>
                  <Text style={pdfStyles.faitAEmptyDate}>
                    {formatFaitADate(
                      providerSignature.useCurrentDate,
                      providerSignature.signatureDate,
                    )}
                  </Text>
                </>
              ) : (
                <Text style={pdfStyles.faitA}>
                  {formatFaitALocation(providerSignature.location)}{' '}
                  {formatFaitADate(
                    providerSignature.useCurrentDate,
                    providerSignature.signatureDate,
                  )}
                </Text>
              )}
              <Text style={pdfStyles.luEtApprouvePlaceholder}>
                précédé de la mention « lu et approuvé »
              </Text>
            </View>
            {/* Colonne droite : "lu et approuvé" + signature */}
            <View style={pdfStyles.signatureImageArea}>
              <Text style={pdfStyles.luEtApprouve}>lu et approuvé</Text>
              {providerImageUrl ? (
                <Image
                  src={providerImageUrl}
                  style={pdfStyles.signatureImage}
                />
              ) : (
                <View style={pdfStyles.signaturePlaceholder} />
              )}
            </View>
          </View>
          {/* Espace pour notes manuscrites */}
          <View style={pdfStyles.signatureNotesSpace} />
        </View>

        {/* Signature Client */}
        <View style={pdfStyles.signatureBlock}>
          <Text style={pdfStyles.signatureLabel}>Pour le Client</Text>
          <View style={pdfStyles.signatureContent}>
            {/* Colonne gauche : infos */}
            <View style={pdfStyles.signatureInfo}>
              <Text style={pdfStyles.signatureCompany}>
                {clientCompanyName}
              </Text>
              {clientSignature.name && (
                <Text style={pdfStyles.signatureName}>
                  {clientSignature.name}
                </Text>
              )}
              {clientSignature.title && (
                <Text style={pdfStyles.signatureTitle}>
                  {clientSignature.title}
                </Text>
              )}
              {isManualEntry(
                clientSignature.location,
                clientSignature.useCurrentDate,
                clientSignature.signatureDate,
              ) ? (
                <>
                  <Text style={pdfStyles.faitAEmpty}>
                    {formatFaitALocation(clientSignature.location)}
                  </Text>
                  <Text style={pdfStyles.faitAEmptyDate}>
                    {formatFaitADate(
                      clientSignature.useCurrentDate,
                      clientSignature.signatureDate,
                    )}
                  </Text>
                </>
              ) : (
                <Text style={pdfStyles.faitA}>
                  {formatFaitALocation(clientSignature.location)}{' '}
                  {formatFaitADate(
                    clientSignature.useCurrentDate,
                    clientSignature.signatureDate,
                  )}
                </Text>
              )}
              <Text style={pdfStyles.luEtApprouvePlaceholder}>
                précédé de la mention « lu et approuvé »
              </Text>
            </View>
            {/* Colonne droite : signature (sans placeholder pour le client) */}
            <View style={pdfStyles.signatureImageArea}>
              {clientImageUrl && (
                <Image src={clientImageUrl} style={pdfStyles.signatureImage} />
              )}
            </View>
          </View>
          {/* Espace pour notes manuscrites */}
          <View style={pdfStyles.signatureNotesSpace} />
        </View>
      </View>
    </View>
  );
}
