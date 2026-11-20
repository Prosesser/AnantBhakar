import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// Inlines the generated hero landscape so it paints before any JS runs.
export default defineConfig({
  plugins: [{
    name: 'inline-hero-art',
    transformIndexHtml: (html) => html.replace('<!--HERO_ART-->', readFileSync('src/hero-art.svg.html', 'utf8')),
  }],
});
