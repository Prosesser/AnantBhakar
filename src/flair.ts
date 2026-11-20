// Achievement badges light up one by one when scrolled into view; a hidden one unlocks when you win the game.
// The resume gets stamped the first time it scrolls into view.
const SECRET_KEY = 'escaped-business-major';

export function initFlair(reduceMotion: MediaQueryList) {
  const list = document.querySelector<HTMLElement>('.badges');
  if (list && !reduceMotion.matches) {
    list.classList.add('is-armed');
    const badges = [...list.querySelectorAll<HTMLElement>('.badge:not(.badge--secret)')];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      badges.forEach((b, i) => window.setTimeout(() => b.classList.add('is-lit'), 250 + i * 260));
    }, { threshold: 0.2 });
    io.observe(list);
  }

  const secret = document.querySelector<HTMLElement>('[data-secret]');
  const earn = () => {
    if (!secret) return;
    secret.classList.add('is-earned');
    secret.querySelector<HTMLImageElement>('[data-secret-icon]')!.src = '/art/badge-runner.svg';
    secret.querySelector('[data-secret-title]')!.textContent = 'Escaped the business major';
    secret.querySelector('[data-secret-text]')!.textContent = 'Cleared the maze without a single coffee chat.';
    secret.querySelector('[data-secret-meta]')!.textContent = 'Unlocked on this site';
  };
  if (localStorage.getItem(SECRET_KEY)) earn();
  window.addEventListener('escaped', () => { localStorage.setItem(SECRET_KEY, '1'); earn(); });

  const stamp = document.querySelector<HTMLElement>('.stamp');
  if (stamp && !reduceMotion.matches) {
    stamp.classList.add('is-hidden');
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      window.setTimeout(() => { stamp.classList.add('is-down'); stamp.classList.remove('is-hidden'); }, 400);
    }, { threshold: 0.4 });
    io.observe(stamp.parentElement!);
  }
}
