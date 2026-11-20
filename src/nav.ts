import { ANANT_A, ANANT_B, ANANT_PALETTE, bake } from './game/sprites';

// A tiny pixel you stands on top of the nav bar above the section you're reading,
// and walks over to whichever link you hover.
export function initNavWalker(reduceMotion: MediaQueryList) {
  const nav = document.querySelector<HTMLElement>('.nav');
  const walker = document.querySelector<HTMLElement>('.nav__walker');
  if (!nav || !walker) return;

  // Two-frame sprite sheet, 2× scale
  const sheet = document.createElement('canvas');
  sheet.width = 48; sheet.height = 28;
  const sctx = sheet.getContext('2d')!;
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(bake(ANANT_A, ANANT_PALETTE), 0, 0, 24, 28);
  sctx.drawImage(bake(ANANT_B, ANANT_PALETTE), 24, 0, 24, 28);
  walker.style.backgroundImage = `url(${sheet.toDataURL()})`;

  const mark = nav.querySelector<HTMLElement>('.nav__mark')!;
  const links = new Map<string, HTMLAnchorElement>();
  nav.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]').forEach((a) => links.set(a.hash.slice(1), a));

  let x = -1;
  let active: HTMLElement = mark;
  let stopTimer = 0;

  const centerOf = (el: HTMLElement) => {
    const n = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
    return r.left - n.left + r.width / 2;
  };
  const walkTo = (el: HTMLElement) => {
    const tx = Math.round(centerOf(el));
    if (x < 0 || reduceMotion.matches) {
      walker.style.setProperty('--wt', '0s');
      walker.style.setProperty('--wx', `${tx}px`);
      x = tx;
      return;
    }
    if (tx === x) return;
    const dist = Math.abs(tx - x);
    walker.style.setProperty('--face', tx < x ? '-1' : '1');
    walker.style.setProperty('--wt', `${Math.max(0.15, dist / 260)}s`);
    walker.style.setProperty('--wx', `${tx}px`);
    walker.classList.add('is-walking');
    clearTimeout(stopTimer);
    stopTimer = window.setTimeout(() => walker.classList.remove('is-walking'), Math.max(150, (dist / 260) * 1000));
    x = tx;
  };

  // Scrollspy
  const sections = ['about', 'projects', 'experience', 'resume', 'contact']
    .map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  const spy = () => {
    const line = innerHeight * 0.35;
    let current: HTMLElement = mark;
    let id = '';
    for (const s of sections) if (s.getBoundingClientRect().top < line) { id = s.id; current = links.get(s.id) ?? mark; }
    links.forEach((a, key) => (key === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (current !== active) { active = current; if (!hovering) walkTo(active); }
  };
  let hovering = false;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; spy(); }); }
  }, { passive: true });

  [mark, ...links.values()].forEach((el) => {
    el.addEventListener('pointerenter', () => { hovering = true; walkTo(el); });
    el.addEventListener('pointerleave', () => { hovering = false; walkTo(active); });
  });
  window.addEventListener('resize', () => { x = -1; walkTo(active); });

  document.fonts?.ready.then(() => { x = -1; spy(); walkTo(active); });
  walkTo(active);
}
