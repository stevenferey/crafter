/**
 * Section informations du PDF CRA
 *
 * Affiche la période et les détails complets des sociétés
 * (prestataire et client) en deux colonnes.
 */

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { formatMonthYear } from '@/lib/monthUtils';
import type { Company } from '@/types/company.types';

interface PDFInfoSectionProps {
  /** Société prestataire */
  providerCompany: Company;
  /** Société cliente */
  clientCompany: Company;
  /** Mois du CRA (1-12) */
  month: number;
  /** Année du CRA */
  year: number;
}

/**
 * Formate l'adresse complète d'une société
 */
function formatAddress(company: Company): string {
  const parts = [company.address];
  if (company.complement) parts.push(company.complement);
  parts.push(`${company.postal_code} ${company.city}`);
  if (company.country && company.country !== 'France') {
    parts.push(company.country);
  }
  return parts.join(', ');
}

/**
 * Bloc détails d'une société
 */
function CompanyDetails({
  company,
  label,
}: {
  company: Company;
  label: string;
}) {
  return (
    <View style={pdfStyles.companyBlock}>
      <Text style={pdfStyles.companyHeader}>{label}</Text>
      <Text style={pdfStyles.companyName}>{company.designation}</Text>

      {/* Adresse */}
      <Text style={pdfStyles.companyDetail}>{formatAddress(company)}</Text>

      {/* Contact */}
      <Text style={pdfStyles.companyDetail}>
        {company.email}
        {company.phone ? ` - ${company.phone}` : ''}
      </Text>

      {/* Identification (SIREN/SIRET) */}
      <Text style={pdfStyles.companyDetail}>
        <Text style={pdfStyles.companyDetailBold}>{company.repertoire} : </Text>
        {company.repertoire_number}
      </Text>

      {/* Registre (si non dispensé) */}
      {!company.dispense && company.registre && company.registre_number && (
        <Text style={pdfStyles.companyDetail}>
          <Text style={pdfStyles.companyDetailBold}>{company.registre} : </Text>
          {company.registre_number}
        </Text>
      )}

      {/* Code activité (NAF/APE) */}
      {company.code && (
        <Text style={pdfStyles.companyDetail}>
          <Text style={pdfStyles.companyDetailBold}>{company.liste} : </Text>
          {company.code}
        </Text>
      )}

      {/* Numéro TVA (si non exempté) */}
      {!company.exemption && company.tva_number && (
        <Text style={pdfStyles.companyDetail}>
          <Text style={pdfStyles.companyDetailBold}>TVA : </Text>
          {company.tva_number}
        </Text>
      )}
    </View>
  );
}

/**
 * Section affichant la période et les informations des sociétés
 */
export function PDFInfoSection({
  providerCompany,
  clientCompany,
  month,
  year,
}: PDFInfoSectionProps) {
  return (
    <View>
      {/* Bandeau période */}
      <View style={pdfStyles.periodBanner}>
        <Text style={pdfStyles.periodText}>{formatMonthYear(month, year)}</Text>
      </View>

      {/* Sociétés côte à côte */}
      <View style={pdfStyles.companiesSection}>
        <CompanyDetails company={providerCompany} label="Prestataire" />
        <CompanyDetails company={clientCompany} label="Client" />
      </View>
    </View>
  );
}
