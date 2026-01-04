export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    site?: string;
  };
}

const SITE_NAME = import.meta.env.VITE_APP_NAME || 'Crafter';
const SITE_URL = import.meta.env.VITE_SITE_URL || '';
const IS_INDEXABLE = import.meta.env.VITE_INDEXABLE === 'true';

export const defaultSEO: SEOConfig = {
  title: `${SITE_NAME} - Gestion simplifiee de vos CRA`,
  description:
    "Creez, gerez et exportez vos comptes rendus d'activite en quelques clics. Solution simple et efficace pour les freelances et consultants.",
  canonical: SITE_URL,
  noindex: !IS_INDEXABLE,
  openGraph: {
    type: 'website',
    title: `${SITE_NAME} - Gestion simplifiee de vos CRA`,
    description:
      "Creez, gerez et exportez vos comptes rendus d'activite en quelques clics.",
    image: `${SITE_URL}/og-image.png`,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export function getSiteUrl(): string {
  return SITE_URL;
}

export function isIndexable(): boolean {
  return IS_INDEXABLE;
}
