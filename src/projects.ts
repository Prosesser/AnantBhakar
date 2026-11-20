// Project rows: click to expand into the full card; hover shows a circular preview that trails the cursor.
export function initProjects(reduceMotion: MediaQueryList) {
  const rows = [...document.querySelectorAll<HTMLElement>('.proj')];
  const orb = document.querySelector<HTMLElement>('.orb');
  const orbImg = orb?.querySelector('img');

  for (const row of rows) {
    const btn = row.querySelector<HTMLButtonElement>('.proj__toggle')!;
    const panel = row.querySelector<HTMLElement>('.proj__panel')!;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      row.classList.toggle('is-open', open);
      panel.inert = !open;
      if (open) hover = null;
    });
  }

  if (!orb || !orbImg || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let hover: HTMLElement | null = null;
  let tx = 0, ty = 0, x = 0, y = 0, s = 0, running = false;

  const frame = () => {
    const target = hover && !hover.classList.contains('is-open') ? 1 : 0;
    const k = reduceMotion.matches ? 1 : 0.18;
    x += (tx - x) * k; y += (ty - y) * k; s += (target - s) * (reduceMotion.matches ? 1 : 0.2);
    orb.style.setProperty('--x', `${x.toFixed(1)}px`);
    orb.style.setProperty('--y', `${y.toFixed(1)}px`);
    orb.style.setProperty('--s', s.toFixed(3));
    if (target === 0 && s < 0.01) { running = false; orb.style.setProperty('--s', '0'); return; }
    requestAnimationFrame(frame);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  for (const row of rows) {
    const toggle = row.querySelector<HTMLElement>('.proj__toggle')!;
    toggle.addEventListener('pointerenter', (e) => {
      if (!hover) { x = tx = e.clientX + 110; y = ty = e.clientY - 40; }
      hover = row;
      orbImg.src = row.dataset.preview ?? '';
      kick();
    });
    toggle.addEventListener('pointermove', (e) => { tx = e.clientX + 110; ty = e.clientY - 40; kick(); });
    toggle.addEventListener('pointerleave', () => { if (hover === row) hover = null; kick(); });
  }
  window.addEventListener('scroll', () => { if (hover) { hover = null; kick(); } }, { passive: true });
}
