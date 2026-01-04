import type { Plugin } from 'vite';

interface SitemapUrl {
  loc: string;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
}

export function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    generateBundle() {
      const isIndexable = process.env.VITE_INDEXABLE === 'true';

      // Only generate sitemap for production
      if (!isIndexable) {
        return;
      }

      const siteUrl = process.env.VITE_SITE_URL || '';

      const urls: SitemapUrl[] = [
        { loc: '/', changefreq: 'weekly', priority: 1.0 },
        { loc: '/login', changefreq: 'monthly', priority: 0.3 },
        { loc: '/register', changefreq: 'monthly', priority: 0.5 },
      ];

      const urlEntries = urls
        .map(
          (url) => `
  <url>
    <loc>${siteUrl}${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
        )
        .join('');

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>
`;

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapContent,
      });
    },
  };
}
