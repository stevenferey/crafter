/**
 * Styles pour la génération de PDF des CRA
 *
 * Utilise @react-pdf/renderer StyleSheet avec une charte graphique
 * inspirée du logo DiscoData (tons marron chocolat et orange doré).
 *
 * @see https://react-pdf.org/styling
 */

import { StyleSheet } from '@react-pdf/renderer';

/**
 * Palette de couleurs DiscoData
 */
const colors = {
  // Couleurs principales
  primary: '#5D4A3C', // Marron chocolat (vinyle)
  primaryLight: '#7D6A5C',
  accent: '#E08B2D', // Orange doré (DATA)
  accentLight: '#F5A742',

  // Texte
  text: '#3D3028',
  textSecondary: '#6D5D4D',
  textLight: '#9D8D7D',

  // Backgrounds
  background: '#FAF7F4',
  backgroundAlt: '#F5F0EB',
  white: '#ffffff',

  // Bordures
  border: '#E5DDD5',
  borderLight: '#F0EBE6',

  // États calendrier
  worked: '#FEF3E2',
  workedText: '#B86B1D',
  weekend: '#F5F0EB',
  weekendText: '#8D7D6D',
} as const;

/**
 * Styles PDF pour les composants CRA
 */
const pdfStyles = StyleSheet.create({
  // ==========================================================================
  // PAGE
  // ==========================================================================
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.text,
    backgroundColor: colors.white,
  },

  // ==========================================================================
  // HEADER
  // ==========================================================================
  header: {
    marginBottom: 15,
    textAlign: 'center',
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // ==========================================================================
  // SECTION SOCIÉTÉS
  // ==========================================================================
  companiesSection: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  companyBlock: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  companyHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  companyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 7.5,
    color: colors.textSecondary,
    marginBottom: 1.5,
    lineHeight: 1.3,
  },
  companyDetailBold: {
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },

  // ==========================================================================
  // BANDEAU PÉRIODE
  // ==========================================================================
  periodBanner: {
    backgroundColor: colors.primary,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // ==========================================================================
  // CALENDRIER
  // ==========================================================================
  calendarSection: {
    marginBottom: 10,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  weekHeaderCell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
  },
  weekHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    padding: 4,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderLight,
    textAlign: 'center',
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  dayCellEmpty: {
    width: '14.28%',
    padding: 4,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundAlt,
    minHeight: 20,
  },
  dayCellWeekend: {
    backgroundColor: colors.weekend,
  },
  dayCellWorked: {
    backgroundColor: colors.worked,
  },
  dayText: {
    fontSize: 8,
    color: colors.text,
  },
  dayTextWeekend: {
    color: colors.weekendText,
  },
  dayTextWorked: {
    fontFamily: 'Helvetica-Bold',
    color: colors.workedText,
  },

  // ==========================================================================
  // LÉGENDE
  // ==========================================================================
  legend: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 20,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  legendBoxWorked: {
    backgroundColor: colors.worked,
    borderColor: colors.accentLight,
  },
  legendBoxWeekend: {
    backgroundColor: colors.weekend,
  },
  legendText: {
    fontSize: 7,
    color: colors.textSecondary,
  },

  // ==========================================================================
  // RÉSUMÉ
  // ==========================================================================
  summarySection: {
    marginBottom: 10,
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.white,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // ==========================================================================
  // COMMENTAIRE
  // ==========================================================================
  commentSection: {
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: colors.text,
  },
  commentBox: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  commentText: {
    fontSize: 8,
    color: colors.text,
    lineHeight: 1.4,
  },

  // ==========================================================================
  // SIGNATURES
  // ==========================================================================
  signaturesSection: {
    marginTop: 'auto',
    paddingTop: 8,
  },
  signaturesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: colors.text,
    textAlign: 'center',
  },
  signaturesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signatureBlock: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    borderTopWidth: 3,
    borderTopColor: colors.accent,
    minHeight: 75,
  },
  signatureLabel: {
    fontSize: 7,
    color: colors.accent,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
  },
  signatureCompany: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 6,
  },
  signatureImageContainer: {
    height: 30,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    maxHeight: 30,
    maxWidth: 90,
    objectFit: 'contain',
  },
  signaturePlaceholder: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderBottomStyle: 'dashed',
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  signatureTitle: {
    fontSize: 7,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // ==========================================================================
  // FOOTER
  // ==========================================================================
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: colors.textLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
});

export { pdfStyles, colors };
