// Astro builds the case-study pages. The homepage is a plain file in
// public/ that Astro copies into the site untouched.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://www.talha.design',
  output: 'static',
  integrations: [mdx()],
  // Write /work/priced-offer.html (not /work/priced-offer/index.html), so
  // Vercel's cleanUrls serves it at /work/priced-offer and permanently
  // redirects the old .html address there, exactly as today.
  build: { format: 'file' },
  trailingSlash: 'never',
});
