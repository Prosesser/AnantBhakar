# MVP build prompt

Paste this into a fresh Claude Code session, in an empty folder that contains `reference/DESIGN.md` and `reference/AnantBhakar_Resume.pdf`.

---

Build my personal portfolio site as a static **Vite + TypeScript** project with no UI framework. Read `PLAN.md` and `reference/DESIGN.md` first, and follow them exactly.

**Who:** Anant Bhakar. I'm a Computer Science student at the University of Toronto (HBSc, expected April 2030), based in Toronto/Brampton. I build full-stack and ML projects and organise hackathons. Take all facts from `reference/AnantBhakar_Resume.pdf`. Do not invent any.

**Look:** Use the General Intelligence Company style system (parchment `#fefffc` canvas, Instrument Serif at weight 400 for display, Geist for UI, 1px `#dee2de` hairlines, frosted pill nav, 8px buttons, 12px cards, 24px big surfaces). Swap its blue accent for moss green `#3d8a5a` (border and text only), and its cerulean surface for deep forest `#16382a`.

**Hero (100vh):** A Firewatch-style layered landscape, rendered in greens instead of orange. Build it as an inline SVG with 6–7 ridge layers going from pale sage to near-black pine, plus a pale sun, a fire lookout tower on a mid ridge, and pine silhouettes in front. Each layer moves at a different speed on scroll (parallax via `transform` in a rAF loop). Put a frosted glass card at the bottom-left with:
- My name in a big serif
- One line: "CS at the University of Toronto. I build full-stack and machine learning projects, and run hackathons."
- An outlined "Play the game" button, and a ghost "Skip to my work" link

The frosted nav pill sits at the top center with links to About, Projects, Experience, Resume, and Contact.

**Game band (right after the hero, deep forest background so it continues from the last ridge):** The serif headline is "Escape the business major". Below it is a `<canvas>` Pac-Man-style maze game. The maze layout and sprites must be original:
- You are pixel Anant in a green hoodie with a laptop. You collect `{ }` code bits.
- Three suit-wearing business majors with briefcases chase you. Each uses different AI: chase, ambush, and wander. They pop speech bubbles like "Quick coffee chat?" or "Synergy!".
- A coffee power-up makes them panic for about 6 seconds, and you can catch them.
- You get 3 lives.
- Win text: "You escaped. Still a CS major." Lose text: "Recruited into a case competition."
- Controls: arrows/WASD, Space to pause, swipe and an on-screen d-pad on touch.
- Use the Silkscreen font inside the game only.
- Save the high score to localStorage.
- The game must not start until I press play. It pauses when scrolled away.

**Sections, in order:**
1. **About:** Editorial text on the left. On the right, a facts card with education, location, focus, and stack.
2. **Projects:** ChessCircuit (featured), IntegraLearn, UniSign, and MP4 Compressor. Show each one's stack and a GitHub link (github.com/Prosesser).
3. **Experience:** A dated timeline with Director (SciTech Activity Committee), Co-Founder (Scrapyard Toronto), and Student Tutor (PDSB).
4. **Achievements:** Math Department Award, Euclid/CSMC school champion, Peel chess champion, and Cayley top 1%.
5. **Resume:** An embedded PDF preview plus a download button. The file is in `public/`.
6. **Contact:** A deep-forest atmospheric card with an email (anantbhakar@gmail.com), LinkedIn, and GitHub.
7. **Footer:** A large serif line and small links.

**Quality bar:**
- Responsive from 360px.
- Visible focus rings.
- `prefers-reduced-motion` turns off the parallax.
- Semantic HTML, with meta and OG tags.
- No all-caps eyebrow labels, no fade-up-on-every-section animations, no filled accent buttons, no pure black text.

**Verify before finishing:** Check there are no console errors and that `npm run build` passes. Take screenshots at desktop and mobile widths and fix anything that looks templated or crowded. Make sure the game is playable by keyboard and touch.
