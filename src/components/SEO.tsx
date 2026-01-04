import { Helmet } from 'react-helmet-async';
import {
  defaultSEO,
  getSiteUrl,
  isIndexable,
  type SEOConfig,
} from '@/lib/seo';

interface SEOProps extends Partial<SEOConfig> {
  path?: string;
}

export function SEO({
  title,
  description,
  canonical,
  noindex,
  openGraph,
  twitter,
  path = '',
}: SEOProps) {
  const siteUrl = getSiteUrl();
  const shouldNoindex = noindex ?? !isIndexable();

  const finalTitle = title || defaultSEO.title;
  const finalDescription = description || defaultSEO.description;
  const finalCanonical = canonical || `${siteUrl}${path}`;

  const ogTitle = openGraph?.title || finalTitle;
  const ogDescription = openGraph?.description || finalDescription;
  const ogImage = openGraph?.image || defaultSEO.openGraph?.image;
  const ogType = openGraph?.type || defaultSEO.openGraph?.type;

  const twitterCard = twitter?.card || defaultSEO.twitter?.card;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonical} />

      {/* Robots */}
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Crafter" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={finalCanonical} />
      <meta property="twitter:title" content={ogTitle} />
      <meta property="twitter:description" content={ogDescription} />
      {ogImage && <meta property="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
