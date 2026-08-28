import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { robotsPlugin } from './src/plugins/vite-plugin-robots.ts';
import { sitemapPlugin } from './src/plugins/vite-plugin-sitemap.ts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');

  // Expose VITE_ variables to the plugins
  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      process.env[key] = env[key];
    }
  });

  return {
    plugins: [react(), robotsPlugin(), sitemapPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  };
});
