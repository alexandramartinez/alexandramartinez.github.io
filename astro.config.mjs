// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.alexmartinez.ca',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Static build. The content catalog is a hand-maintained static list
  // (src/data/content.ts); nothing is fetched at build time. Deployed to
  // GitHub Pages by .github/workflows/deploy.yml on every push to main.
  output: 'static',
});
