import {
  ANANT_A, ANANT_B, ANANT_PALETTE, SUIT_A, SUIT_B, SUIT_LOOKS, PANIC_LOOK, PANIC_BLINK,
  BRIEFCASE, CASE_PALETTE, CODE_BIT, BIT_PALETTE, COFFEE, COFFEE_PALETTE, bake,
} from './sprites';

// ── Maze ────────────────────────────────────────────────────────────────────
// # hedge  . code bit  o coffee  P player start  E business major start  (space) open
const MAP = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '    .#  EEE  #.    ',
  '####.# ##### #.####',
  '#........P........#',
  '#.##.###.#.###.##.#',
  '#o.#.....#.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '###################',
];
const COLS = MAP[0].length;
const ROWS = MAP.length;
const T = 16; // logical px per tile

type Dir = { x: number; y: number };
const NONE: Dir = { x: 0, y: 0 };
const UP: Dir = { x: 0, y: -1 }, DOWN: Dir = { x: 0, y: 1 }, LEFT: Dir = { x: -1, y: 0 }, RIGHT: Dir = { x: 1, y: 0 };
const DIRS = [UP, LEFT, DOWN, RIGHT];
const same = (a: Dir, b: Dir) => a.x === b.x && a.y === b.y;
const isReverse = (a: Dir, b: Dir) => a.x === -b.x && a.y === -b.y && !same(a, NONE);

const wrapX = (x: number) => (x + COLS) % COLS;
const isWall = (x: number, y: number) => {
  if (y < 0 || y >= ROWS) return true;
  return MAP[y][wrapX(x)] === '#';
};

interface Mover {
  tx: number; ty: number; dir: Dir; t: number; speed: number;
}
interface Suit extends Mover {
  look: number;
  mode: 'home' | 'out' | 'panic' | 'eaten';
  release: number;
  style: 'chase' | 'ambush' | 'wander';
  homeX: number; homeY: number;
  bubble: string; bubbleT: number;
}

type State = 'title' | 'ready' | 'playing' | 'paused' | 'dying' | 'won' | 'lost';

const LINES = [
  'Quick coffee chat?', "Let's circle back", 'Synergy!', 'Case comp?', "I'm pre-consulting",
  'Touch base?', 'Add me on LinkedIn', 'Think bigger picture', 'Disrupt!', 'Per my last email',
];
const PANIC_LINES = ['I have a midterm!', 'My LinkedIn!', 'Not the GPA!', 'Recession!'];

const pos = (m: Mover) => ({ x: m.tx + m.dir.x * m.t, y: m.ty + m.dir.y * m.t });

export interface GameUI {
  canvas: HTMLCanvasElement;
  overlay: HTMLElement;
  overlayTitle: HTMLElement;
  overlayText: HTMLElement;
  overlayButton: HTMLButtonElement;
  score: HTMLElement;
  best: HTMLElement;
  lives: HTMLElement;
  root: HTMLElement;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private state: State = 'title';
  private bits = new Set<string>();
  private coffees = new Set<string>();
  private player!: Mover;
  private want: Dir = NONE;
  private suits: Suit[] = [];
  private score = 0;
  private best = 0;
  private lives = 3;
  private timer = 0;
  private panicT = 0;
  private chain = 0;
  private clock = 0;
  private chatterT = 3;
  private last = 0;
  private raf = 0;
  private scale = 3;
  private popups: { x: number; y: number; text: string; t: number }[] = [];

  constructor(private ui: GameUI) {
    this.ctx = ui.canvas.getContext('2d')!;
    this.best = Number(localStorage.getItem('escape-best') ?? 0) || 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.resetLevel();
    this.bindInput();
    this.updateHud();
    this.showOverlay('Ready to run?', 'Collect the code. Dodge the suits. Coffee turns the tables.', 'Play');
    document.fonts?.load('8px Silkscreen').then(() => this.draw());
    this.draw();
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  private resize() {
    this.scale = Math.max(2, Math.min(4, Math.ceil(window.devicePixelRatio || 1) * 2));
    this.ui.canvas.width = COLS * T * this.scale;
    this.ui.canvas.height = ROWS * T * this.scale;
    this.ctx.imageSmoothingEnabled = false;
    this.draw();
  }

  private resetLevel() {
    this.bits.clear();
    this.coffees.clear();
    MAP.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.') this.bits.add(`${x},${y}`);
      if (ch === 'o') this.coffees.add(`${x},${y}`);
    }));
    this.resetActors();
  }

  private resetActors() {
    const find = (c: string) => {
      const out: { x: number; y: number }[] = [];
      MAP.forEach((row, y) => [...row].forEach((ch, x) => ch === c && out.push({ x, y })));
      return out;
    };
    const p = find('P')[0];
    this.player = { tx: p.x, ty: p.y, dir: NONE, t: 0, speed: 6.2 };
    this.want = NONE;
    const styles: Suit['style'][] = ['chase', 'ambush', 'wander'];
    this.suits = find('E').map((e, i) => ({
      tx: e.x, ty: e.y, dir: NONE, t: 0, speed: 5,
      look: i, mode: 'home', release: 1 + i * 2.5, style: styles[i],
      homeX: e.x, homeY: e.y, bubble: '', bubbleT: 0,
    }));
    this.panicT = 0;
    this.popups = [];
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  private bindInput() {
    const keyDir: Record<string, Dir> = {
      ArrowUp: UP, ArrowDown: DOWN, ArrowLeft: LEFT, ArrowRight: RIGHT,
      w: UP, s: DOWN, a: LEFT, d: RIGHT, W: UP, S: DOWN, A: LEFT, D: RIGHT,
    };
    window.addEventListener('keydown', (e) => {
      const active = this.state === 'playing' || this.state === 'ready' || this.state === 'paused';
      if (!active || !this.inView) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (keyDir[e.key]) {
        e.preventDefault();
        if (this.state === 'paused') this.resume();
        this.want = keyDir[e.key];
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        if (this.state === 'paused') this.resume();
        else if (this.state === 'playing') this.pause();
      }
    });

    this.ui.overlayButton.addEventListener('click', () => {
      if (this.state === 'paused') return this.resume();
      if (this.state === 'won' || this.state === 'lost') {
        this.score = 0; this.lives = 3; this.resetLevel();
      }
      this.start();
    });

    // Swipe on the canvas
    let sx = 0, sy = 0;
    this.ui.canvas.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    this.ui.canvas.addEventListener('touchmove', (e) => {
      if (this.state !== 'playing') return;
      e.preventDefault();
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (Math.hypot(dx, dy) < 18) return;
      this.want = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RIGHT : LEFT) : (dy > 0 ? DOWN : UP);
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: false });

    // On-screen d-pad
    this.ui.root.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((btn) => {
      const d = { up: UP, down: DOWN, left: LEFT, right: RIGHT }[btn.dataset.dir as string]!;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.state === 'paused') this.resume();
        this.want = d;
      });
    });

    // Pause when scrolled out of view
    new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      if (!entry.isIntersecting && this.state === 'playing') this.pause();
    }, { threshold: 0.35 }).observe(this.ui.canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
  }
  private inView = true;

  // ── State machine ─────────────────────────────────────────────────────────
  private start() {
    this.hideOverlay();
    this.state = 'ready';
    this.timer = 1.2;
    this.ui.canvas.focus({ preventScroll: true });
    this.loop();
  }
  private pause() {
    this.state = 'paused';
    this.showOverlay('Paused', 'Press space or an arrow key to keep running.', 'Resume');
  }
  private resume() {
    this.hideOverlay();
    this.state = 'playing';
    this.loop();
  }
  private loop() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      if (this.state === 'ready' || this.state === 'playing' || this.state === 'dying') {
        this.raf = requestAnimationFrame(tick);
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  private showOverlay(title: string, text: string, button: string) {
    this.ui.overlayTitle.textContent = title;
    this.ui.overlayText.textContent = text;
    this.ui.overlayButton.textContent = button;
    this.ui.overlay.hidden = false;
    this.ui.root.dataset.state = this.state;
  }
  private hideOverlay() {
    this.ui.overlay.hidden = true;
  }

  // ── Update ────────────────────────────────────────────────────────────────
  private update(dt: number) {
    this.clock += dt;
    this.popups.forEach((p) => (p.t -= dt));
    this.popups = this.popups.filter((p) => p.t > 0);

    if (this.state === 'ready') {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'playing';
      return;
    }
    if (this.state === 'dying') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.lives <= 0) return this.end(false);
        this.resetActors();
        this.state = 'ready';
        this.timer = 1;
      }
      return;
    }
    if (this.state !== 'playing') return;

    if (this.panicT > 0) {
      this.panicT -= dt;
      if (this.panicT <= 0) this.suits.forEach((s) => s.mode === 'panic' && (s.mode = 'out'));
    }

    this.movePlayer(dt);
    this.eat();
    this.suits.forEach((s) => this.moveSuit(s, dt));
    this.chatter(dt);
    this.collide();
    if (this.bits.size === 0 && this.coffees.size === 0) this.end(true);
  }

  private movePlayer(dt: number) {
    const p = this.player;
    if (isReverse(this.want, p.dir) && p.t > 0) {
      p.tx = wrapX(p.tx + p.dir.x); p.ty += p.dir.y;
      p.dir = this.want; p.t = 1 - p.t;
    }
    if (same(p.dir, NONE)) {
      if (!same(this.want, NONE) && !isWall(p.tx + this.want.x, p.ty + this.want.y)) p.dir = this.want;
      else return;
    }
    p.t += p.speed * dt;
    while (p.t >= 1) {
      p.t -= 1;
      p.tx = wrapX(p.tx + p.dir.x); p.ty += p.dir.y;
      this.eat();
      if (!same(this.want, NONE) && !isWall(p.tx + this.want.x, p.ty + this.want.y)) p.dir = this.want;
      if (isWall(p.tx + p.dir.x, p.ty + p.dir.y)) { p.dir = NONE; p.t = 0; break; }
    }
  }

  private eat() {
    const key = `${this.player.tx},${this.player.ty}`;
    if (this.bits.delete(key)) this.addScore(10);
    if (this.coffees.delete(key)) {
      this.addScore(50);
      this.panicT = 6;
      this.chain = 0;
      this.suits.forEach((s) => {
        if (s.mode === 'out') {
          s.mode = 'panic';
          if (s.t > 0) { s.tx = wrapX(s.tx + s.dir.x); s.ty += s.dir.y; s.dir = { x: -s.dir.x, y: -s.dir.y }; s.t = 1 - s.t; }
        }
      });
      const s = this.suits.find((x) => x.mode === 'panic');
      if (s) this.say(s, PANIC_LINES[Math.floor(Math.random() * PANIC_LINES.length)]);
    }
  }

  private target(s: Suit): { x: number; y: number } {
    const p = this.player;
    if (s.mode === 'eaten') return { x: s.homeX, y: s.homeY };
    if (s.style === 'chase') return { x: p.tx, y: p.ty };
    if (s.style === 'ambush') return { x: p.tx + p.dir.x * 4, y: p.ty + p.dir.y * 4 };
    const d = Math.hypot(s.tx - p.tx, s.ty - p.ty);
    return d > 6 ? { x: p.tx, y: p.ty } : { x: 1, y: ROWS - 2 };
  }

  private moveSuit(s: Suit, dt: number) {
    if (s.mode === 'home') {
      s.release -= dt;
      if (s.release <= 0) s.mode = 'out';
      return;
    }
    const speed = s.mode === 'eaten' ? 11 : s.mode === 'panic' ? 3.4 : s.speed + Math.min(1, (this.score / 2000));
    if (same(s.dir, NONE)) this.chooseDir(s);
    s.t += speed * dt;
    while (s.t >= 1) {
      s.t -= 1;
      s.tx = wrapX(s.tx + s.dir.x); s.ty += s.dir.y;
      if (s.mode === 'eaten' && s.tx === s.homeX && s.ty === s.homeY) {
        s.mode = 'out';
        s.dir = NONE; s.t = 0;
        break;
      }
      this.chooseDir(s);
    }
    if (s.bubbleT > 0) s.bubbleT -= dt;
  }

  private chooseDir(s: Suit) {
    let options = DIRS.filter((d) => !isWall(s.tx + d.x, s.ty + d.y) && !isReverse(d, s.dir));
    if (!options.length) options = DIRS.filter((d) => !isWall(s.tx + d.x, s.ty + d.y));
    if (!options.length) { s.dir = NONE; return; }
    if (s.mode === 'panic') {
      s.dir = options[Math.floor(Math.random() * options.length)];
      return;
    }
    const tg = this.target(s);
    let best = options[0], bestD = Infinity;
    for (const d of options) {
      const nx = s.tx + d.x, ny = s.ty + d.y;
      const dist = (nx - tg.x) ** 2 + (ny - tg.y) ** 2 + (s.style === 'wander' ? Math.random() * 6 : 0);
      if (dist < bestD) { bestD = dist; best = d; }
    }
    s.dir = best;
  }

  private chatter(dt: number) {
    this.chatterT -= dt;
    if (this.chatterT > 0) return;
    this.chatterT = 3 + Math.random() * 3;
    const out = this.suits.filter((s) => s.mode === 'out');
    if (!out.length) return;
    const s = out[Math.floor(Math.random() * out.length)];
    this.say(s, LINES[Math.floor(Math.random() * LINES.length)]);
  }
  private say(s: Suit, line: string) {
    s.bubble = line; s.bubbleT = 2.2;
  }

  private collide() {
    const pp = pos(this.player);
    for (const s of this.suits) {
      if (s.mode === 'eaten' || s.mode === 'home') continue;
      const sp = pos(s);
      if (Math.abs(pp.x - sp.x) < 0.6 && Math.abs(pp.y - sp.y) < 0.6) {
        if (s.mode === 'panic') {
          s.mode = 'eaten';
          this.chain++;
          const pts = 200 * this.chain;
          this.addScore(pts);
          this.popups.push({ x: sp.x, y: sp.y, text: String(pts), t: 1 });
          s.bubbleT = 0;
        } else {
          this.lives--;
          this.updateHud();
          this.state = 'dying';
          this.timer = 1.3;
          return;
        }
      }
    }
  }

  private addScore(n: number) {
    this.score += n;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('escape-best', String(this.best));
    }
    this.updateHud();
  }

  private end(won: boolean) {
    this.state = won ? 'won' : 'lost';
    if (won) window.dispatchEvent(new CustomEvent('escaped'));
    if (won) this.showOverlay('You escaped', `Still a CS major. Final score ${this.score}. Scroll down to see what you unlocked.`, 'Play again');
    else this.showOverlay('Recruited into a case competition', `They got you with a coffee chat. Final score ${this.score}.`, 'Try again');
    this.draw();
  }

  private updateHud() {
    this.ui.score.textContent = String(this.score);
    this.ui.best.textContent = String(this.best);
    this.ui.lives.textContent = String(Math.max(0, this.lives));
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  private draw() {
    const c = this.ctx;
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    c.imageSmoothingEnabled = false;

    // grass
    c.fillStyle = '#1f4a35';
    c.fillRect(0, 0, COLS * T, ROWS * T);
    c.fillStyle = '#245239';
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if ((x * 7 + y * 13) % 5 === 0) c.fillRect(x * T + 4, y * T + 10, 1, 2);
      if ((x * 3 + y * 11) % 7 === 0) c.fillRect(x * T + 11, y * T + 4, 1, 2);
    }

    // hedges
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (MAP[y][x] !== '#') continue;
      const px = x * T, py = y * T;
      c.fillStyle = '#3d7a52';
      c.fillRect(px, py, T, T);
      c.fillStyle = '#5a9d68';
      if (!isWall(x, y - 1) || y === 0) c.fillRect(px, py, T, 3);
      c.fillStyle = '#163826';
      if (!isWall(x, y + 1) || y === ROWS - 1) c.fillRect(px, py + T - 3, T, 3);
      if (!isWall(x - 1, y) && x > 0) c.fillRect(px, py, 2, T);
      if (!isWall(x + 1, y) && x < COLS - 1) c.fillRect(px + T - 2, py, 2, T);
      c.fillStyle = '#4c8c5d';
      if ((x + y) % 3 === 0) c.fillRect(px + 5, py + 6, 2, 2);
      if ((x * 5 + y) % 4 === 0) c.fillRect(px + 10, py + 9, 2, 2);
    }

    // pickups
    const bit = bake(CODE_BIT, BIT_PALETTE);
    this.bits.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      c.drawImage(bit, x * T + 5, y * T + 7);
    });
    const cup = bake(COFFEE, COFFEE_PALETTE);
    const bob = Math.round(Math.sin(this.clock * 5));
    this.coffees.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      c.drawImage(cup, x * T + 4, y * T + 4 + bob);
    });

    // business majors
    const walkFrame = Math.floor(this.clock * 8) % 2;
    for (const s of this.suits) {
      const p = pos(s);
      const px = Math.round(p.x * T), py = Math.round(p.y * T);
      if (s.mode === 'eaten') {
        c.drawImage(bake(BRIEFCASE, CASE_PALETTE), px + 4, py + 5);
        continue;
      }
      let look = SUIT_LOOKS[s.look];
      if (s.mode === 'panic') look = this.panicT < 1.8 && Math.floor(this.clock * 6) % 2 ? PANIC_BLINK : PANIC_LOOK;
      const flip = s.dir.x < 0;
      const frame = s.mode === 'home' || walkFrame === 0 ? SUIT_A : SUIT_B;
      c.drawImage(bake(frame, look, flip), px + 2, py + 1);
      if (s.mode !== 'panic') c.drawImage(bake(BRIEFCASE, CASE_PALETTE), flip ? px - 1 : px + 10, py + 9);
    }

    // player
    if (this.player) {
      const p = pos(this.player);
      const px = Math.round(p.x * T), py = Math.round(p.y * T);
      const dying = this.state === 'dying';
      if (!dying || Math.floor(this.clock * 10) % 2) {
        const moving = !same(this.player.dir, NONE) && this.state === 'playing';
        const frame = moving && walkFrame ? ANANT_B : ANANT_A;
        c.drawImage(bake(frame, ANANT_PALETTE, this.player.dir.x < 0), px + 2, py + 1);
      }
    }

    // speech bubbles and popups
    c.font = '8px Silkscreen, monospace';
    c.textBaseline = 'top';
    for (const s of this.suits) {
      if (s.bubbleT <= 0 || s.mode === 'eaten' || s.mode === 'home') continue;
      const p = pos(s);
      this.bubble(s.bubble, p.x * T + 8, p.y * T - 4);
    }
    for (const pop of this.popups) {
      c.fillStyle = '#f6f1c7';
      c.fillText(pop.text, Math.round(pop.x * T), Math.round(pop.y * T - (1 - pop.t) * 8));
    }

    if (this.state === 'ready') {
      c.font = '16px Silkscreen, monospace';
      const msg = 'Run!';
      const w = c.measureText(msg).width;
      c.fillStyle = '#16382a';
      c.fillRect((COLS * T - w) / 2 - 6, 5 * T + 2, w + 12, 18);
      c.fillStyle = '#f6f1c7';
      c.fillText(msg, (COLS * T - w) / 2, 5 * T + 4);
    }
  }

  private bubble(text: string, cx: number, bottom: number) {
    const c = this.ctx;
    const w = Math.ceil(c.measureText(text).width) + 8;
    const h = 12;
    let x = Math.round(cx - w / 2);
    x = Math.max(1, Math.min(COLS * T - w - 1, x));
    const y = Math.max(1, Math.round(bottom - h - 3));
    c.fillStyle = '#fefffc';
    c.fillRect(x, y, w, h);
    c.fillRect(Math.round(cx) - 1, y + h, 3, 2);
    c.fillStyle = '#1c2a22';
    c.fillText(text, x + 4, y + 2);
  }
}
