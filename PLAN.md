# anantbhakar.com: Remake Plan

## 1. Goal

Rebuild the personal site with one idea: **a green Firewatch-style forest you scroll down into, with a pixel game waiting at the bottom of the trees, and then a quiet, literary portfolio.**

- **Hero:** Firewatch-style layered parallax landscape (ridges, pines, fire lookout tower), repainted in greens instead of orange.
- **Everything else:** General Intelligence Company's (GIC) editorial system. Parchment canvas, light display serif, hairline Mist borders, a frosted nav pill, one outlined accent, one idea per screen.
- **Signature moment:** *Escape the Business Major*, a small Pac-Man-style maze game. You play a pixel Anant in a hoodie and dodge suits with briefcases.

Audience: recruiters, hackathon organisers, UofT peers. Primary job: show in 10 seconds that Anant builds things and has taste. Then make the resume and contact one click away.

## 2. Skills and process ("toned-down Superpowers + Impeccable")

Neither plugin is installed in this environment. This plan applies their core ideas by hand. To install them for future passes in a terminal `claude` session:

- **Superpowers** (obra/superpowers): `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`
- **Impeccable** (pbakaus/impeccable): follow the install steps in its README; it provides design commands such as audit, critique, and polish.

### Toned-down Superpowers: what we keep

| Superpowers idea | How it applies here |
|---|---|
| Brainstorm, then write a plan | This file, then `PROMPT.md` |
| Small, verifiable steps | Build the scaffold, then the hero, then the game, then the sections, then polish. Preview in the browser after each step |
| Verification before "done" | Check console errors, run `vite build`, take screenshots at desktop and mobile widths, and test keyboard-only play |
| YAGNI | No CMS, no backend, no framework beyond Vite + TypeScript |
| *Dropped* | Strict TDD, subagent swarms, git worktrees. Overkill for a static personal site |

### Impeccable-style design checklist (run before calling it done)

- **Typography:** One serif for display (weight 400 only), one sans for UI, and a pixel face used *only* inside the game. Lines under 75 characters.
- **Color:** About 95% neutral. One green accent used only on borders. One saturated surface: the forest.
- **Spacing:** A 4px grid with 64–96px section rhythm and nothing crowded.
- **Motion:** Hero parallax is the only motion the visitor doesn't trigger. No fade-up on every section. Respect `prefers-reduced-motion`, which freezes the parallax and keeps the game paused until you press play.
- **Accessibility:** Visible focus rings, semantic landmarks, alt text and `aria-hidden` on decorative SVG, and a canvas label. The game is fully playable by keyboard and has touch controls. A "Skip game" link is provided.
- **Responsive:** Works from 360px to 1440px. The nav pill collapses. The game canvas scales to fit with integer-ish pixel scaling.
- **Copy:** Sentence case, plain verbs, no all-caps eyebrows, no "→" glued onto every link.
- **Anti-template pass:** No identical card grid for everything, no numbered 01/02/03 unless the content is a sequence, no gradient washes.

## 3. Design tokens (GIC system, re-greened)

| Token | Value | Note |
|---|---|---|
| Parchment | `#fefffc` | Canvas (from GIC) |
| Paper | `#ffffff` | Cards |
| Linen | `#f9faf7` | Inputs, nav |
| Graphite | `#2c2c2c` | Headlines |
| Charcoal | `#444141` | Body |
| Ash | `#646464` | Muted |
| Mist | `#dee2de` | Hairlines (already green-tinted) |
| Pine ink | `#1c2a22` | Replaces Twilight/Dusk: nav border, filled button |
| **Moss** | `#3d8a5a` | Replaces Signal Blue: outlined CTA border and text only |
| **Deep forest** | `#16382a` | Replaces Cerulean: the one saturated surface (game band, contact card) |

Hero palette (layered back to front): dawn sky `#e9f2d0 → #b9d89a`, sun `#f6f1c7`, ridges `#9cc283`, `#6fa368`, `#47805a`, `#2c5e44`, `#1b4231`, foreground pines `#10291f`.

**Type**
- Display: **Instrument Serif**, 400 (stands in for PP Mondwest). Sizes 27/40/48/54px, up to 96px in the hero, line-height 1.1, tracking −0.02em.
- UI/body: **Geist**, 400/500. Sizes 13/15/16/18px, line-height 1.5, tracking −0.01em.
- Game only: **Silkscreen** (pixel face). It echoes GIC's pixel flower, the one deliberate break from the painted style.

**Shape:** nav pill 50px, buttons 8px, cards 12px, large surfaces 24px. Card shadow: `0 1px 1px rgba(0,0,0,.08), 0 4px 5px rgba(0,0,0,.08)`.

## 4. Information architecture

```
┌──────────── frosted nav pill (About · Projects · Experience · Resume · Contact) ──┐
│ HERO 100vh: layered green ridges + lookout tower, parallax on scroll              │
│   frosted card bottom-left: "Anant Bhakar" / one-line intro / [Play the game]     │
├───────────────────────────────────────────────────────────────────────────────────┤
│ GAME BAND (deep forest, continues from the last ridge)                            │
│   "Escape the business major" + canvas maze + score/lives + controls hint         │
├───────────────────────────────────────────────────────────────────────────────────┤
│ ABOUT     6+6: editorial paragraph | facts card (UofT CS '30, Toronto, stack)     │
│ PROJECTS  one featured wide card (ChessCircuit) + 3 smaller, with stack and links │
│ EXPERIENCE timeline (a real sequence, so dated rows are fine)                     │
│ ACHIEVEMENTS short list of the contest/chess/award wins  ← extra section           │
│ RESUME    inline PDF preview card + [Download PDF]                                │
│ CONTACT   deep-forest atmospheric card: email, LinkedIn, GitHub                   │
│ FOOTER    large serif line + small links + pixel pine                             │
└───────────────────────────────────────────────────────────────────────────────────┘
```

Extras beyond the brief: an **Achievements** section (it's the strongest material on the resume and wasn't on the old site), a **skills/stack** fact card inside About, a short footer colophon, OG meta tags, and a favicon.

## 5. The game: *Escape the Business Major*

- **Genre:** A Pac-Man-like maze chase. The maze layout, characters, and rules are all original.
- **Maze:** A 19×15 tile forest clearing. Walls are hedges and pines, and paths run through the grass.
- **Player:** Pixel Anant in a green hoodie, carrying a laptop.
- **Enemies:** Three business majors in suits with briefcases. Each has a different chase style: direct, ambush ahead of you, and wander. Every so often they say a pixel speech bubble: "Quick coffee chat?", "Let's circle back", "Synergy!", "Ever heard of a case comp?", "I'm pre-consulting".
- **Pickups:**
  - Small: `{ }` code bits worth 10 points.
  - Power: ☕ "all-nighter", worth 50. For about 6 seconds the suits panic ("I have a midterm!") and you can catch them for 200.
- **Lives:** 3.
- **Win:** "You escaped. Still a CS major." Shows the final score and a "Play again" button.
- **Lose:** "Recruited into a case competition." Shows a "Try again" button.
- **Controls:** Arrows/WASD to move, Space or P to pause. On touch screens, swipe or use an on-screen d-pad.
- **Tech:** A single `<canvas>`. Sprites are hand-authored pixel grids in TypeScript, so there are no image assets. The loop uses `requestAnimationFrame` with a fixed timestep. The game doesn't start until you click or press a key, and it pauses when scrolled off screen (IntersectionObserver). The high score is saved in `localStorage`.

## 6. Tech stack

- **Vite + TypeScript, no framework.** Static output, fast, easy to deploy on Vercel, Netlify, or Cloudflare Pages.
- Content is written straight into semantic HTML in `index.html`, which is good for SEO and needs no build-time CMS.
- Fonts come from Google Fonts with `display=swap`.
- **Files**
  - `index.html`: all content.
  - `src/styles.css`: tokens and components.
  - `src/hero.ts`: parallax.
  - `src/game/*`: the game.
  - `public/AnantBhakar_Resume.pdf`.

## 7. Build order (each step ends with a browser check)

1. Scaffold Vite and set up the tokens CSS.
2. Build the hero SVG layers, parallax, and nav pill.
3. Build the game (maze, movement, enemies, pickups, states, touch controls).
4. Build the content sections from the resume.
5. Polish: responsive, reduced motion, focus states, meta tags, then `vite build`.
6. Self-critique with screenshots, then remove one accessory.

## 8. Later (not MVP)

Hand-painted raster hero layers (commission or paint in Procreate), a blog/notes section, a dark "night forest" theme, a game leaderboard (needs a backend), and project case-study pages.
