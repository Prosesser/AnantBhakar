# anantbhakar.com

My personal site. A green, Firewatch-style forest hero, a pixel maze game (*Escape the business major*), and an editorial portfolio underneath.

Built with Vite and TypeScript, with no UI framework. All the art is drawn in code: SVG landscapes and pixel sprites, with no image assets apart from the resume PDF.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Where things live

| Path | What |
|---|---|
| `index.html` | All page content (about, projects, experience, achievements, resume, contact) |
| `src/styles.css` | Design tokens and every component style |
| `src/main.ts` | Hero parallax, hero crop, mobile nav, wires everything up |
| `src/game/` | The maze game (`game.ts`) and its pixel sprites (`sprites.ts`) |
| `src/nav.ts` | The little pixel walker on top of the nav bar |
| `src/projects.ts` | Expanding project rows and the hover preview circle |
| `src/flair.ts` | Achievement unlocks (including the hidden one) and the resume stamp |
| `src/scene.ts` | Pixel landscape at the bottom of the page |
| `scripts/` | Generators for the hero SVG and the pixel art in `public/art/` |
| `public/` | Resume PDF, favicon, generated pixel art |

## Changing the art

The hero landscape and the project/badge pixel art are generated. Edit the scripts in `scripts/`, then run:

```bash
npm run art
```

## Deploy

It's a static site, so any static host works. Set the build command to `npm run build` and the output directory to `dist`. That covers Vercel, Netlify and Cloudflare Pages.
