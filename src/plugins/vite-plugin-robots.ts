import type { Plugin } from 'vite';

export function robotsPlugin(): Plugin {
  return {
    name: 'vite-plugin-robots',
    apply: 'build',
    generateBundle() {
      const isIndexable = process.env.VITE_INDEXABLE === 'true';
      // Remove trailing slash to avoid double slashes in URLs
      const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');

      let robotsContent: string;

      if (isIndexable) {
        robotsContent = `# Production robots.txt - Allow indexing
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /verify-email/
Disallow: /reset-password/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;
      } else {
        robotsContent = `# Staging robots.txt - Block all indexing
User-agent: *
Disallow: /
`;
      }

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsContent,
      });
    },
  };
}
