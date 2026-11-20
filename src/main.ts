import { Game } from './game/game';
import { initPixelTitles } from './pixelTitles';
import { initProjects } from './projects';
import { initFlair } from './flair';
import { initScene } from './scene';
import { initNavWalker } from './nav';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Intro curtain: lock scrolling while it plays, then remove it.
const intro = document.querySelector('.intro');
if (intro) {
  if (reduceMotion.matches) intro.remove();
  else {
    document.documentElement.classList.add('is-intro');
    window.setTimeout(() => { intro.remove(); document.documentElement.classList.remove('is-intro'); }, 1750);
  }
}

// ── Hero parallax: each ridge drifts at its own speed as you scroll ─────────
const layers = [...document.querySelectorAll<HTMLElement | SVGGElement>('.hero__art .layer, [data-parallax]')].map((el) => ({
  el, speed: Number(el.dataset.speed ?? 0),
}));
const hero = document.querySelector<HTMLElement>('.hero')!;
let ticking = false;
function paintParallax() {
  ticking = false;
  const y = window.scrollY;
  if (reduceMotion.matches || y > hero.offsetHeight) return;
  for (const { el, speed } of layers) el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(paintParallax); }
}, { passive: true });
reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) layers.forEach(({ el }) => (el.style.transform = ''));
});

// Fit the landscape crop to the hero's shape. Wide screens see the whole scene (unchanged).
// Narrower or taller screens keep the full height and slide the window so the hiker on the cliff stays in view;
// the tower on the right comes along whenever there's room for both.
const art = document.querySelector<SVGSVGElement>('.hero__art')!;
const frame = () => {
  const aspect = hero.clientWidth / hero.clientHeight;
  const w = Math.min(1600, 1000 * aspect);
  const left = w >= 1600 ? 0 : Math.max(0, Math.min(112, (1600 - w) / 2));
  art.setAttribute('viewBox', `${left.toFixed(1)} 0 ${w.toFixed(1)} 1000`);
};
frame();
window.addEventListener('resize', frame);
// Safari can report the hero's height before 100svh settles, so also re-crop whenever the hero itself resizes.
new ResizeObserver(frame).observe(hero);

// ── Mobile nav ──────────────────────────────────────────────────────────────
const toggle = document.querySelector<HTMLButtonElement>('.nav__toggle')!;
const links = document.querySelector<HTMLElement>('.nav__links')!;
const setOpen = (open: boolean) => {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
  links.toggleAttribute('data-open', open);
};
toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
links.addEventListener('click', (e) => (e.target as HTMLElement).closest('a') && setOpen(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

// ── Game ────────────────────────────────────────────────────────────────────
const root = document.querySelector<HTMLElement>('[data-game]')!;
const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
new Game({
  root,
  canvas: q<HTMLCanvasElement>('[data-canvas]'),
  overlay: q('[data-overlay]'),
  overlayTitle: q('[data-overlay-title]'),
  overlayText: q('[data-overlay-text]'),
  overlayButton: q<HTMLButtonElement>('[data-overlay-btn]'),
  score: q('[data-score]'),
  best: q('[data-best]'),
  lives: q('[data-lives]'),
});

// "Play the game" in the hero scrolls down, then starts once the board is in view.
document.querySelector('[data-play]')?.addEventListener('click', (e) => {
  e.preventDefault();
  root.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  window.setTimeout(() => {
    const btn = q<HTMLButtonElement>('[data-overlay-btn]');
    if (!q('[data-overlay]').hidden && btn.textContent !== 'Resume') btn.click();
  }, reduceMotion.matches ? 50 : 700);
});

initProjects(reduceMotion);
initFlair(reduceMotion);
initScene(reduceMotion);
initNavWalker(reduceMotion);
initPixelTitles();
