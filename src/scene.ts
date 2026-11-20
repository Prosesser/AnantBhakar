import { ANANT_A, ANANT_B, ANANT_PALETTE, SUIT_A, SUIT_B, SUIT_LOOKS, BRIEFCASE, CASE_PALETTE, bake } from './game/sprites';

// A low-res pixel landscape at the bottom of the page. Layers slide into place as you reach the end,
// and a tiny Anant is still being chased down the trail by a business major.
const W = 400;
const H = 176;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const dither = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function layer(draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  draw(c.getContext('2d')!);
  return c;
}

function ridge(base: number, amp: number) {
  const a = rand() * 10, b = rand() * 10;
  return (x: number) => Math.round(base + Math.sin(x / 47 + a) * amp + Math.sin(x / 17 + b) * amp * 0.3);
}

function pine(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  const tiers = Math.max(2, Math.round(h / 7));
  const tierH = h / tiers;
  for (let r = 0; r < h; r++) {
    const inTier = (r % tierH) / tierH;
    const w = Math.floor((inTier * 0.45 + (r / h) * 0.55) * h * 0.32);
    ctx.fillRect(x - w, base - h + r, w * 2 + 1, 1);
  }
  ctx.fillRect(x, base, 1, 3);
}

function fillBelow(ctx: CanvasRenderingContext2D, f: (x: number) => number) {
  for (let x = 0; x < W; x++) { const y = f(x); ctx.fillRect(x, y, 1, H - y); }
}

function buildLayers() {
  const sky = layer((ctx) => {
    const stops = ['#c9e0a0', '#dcebbb', '#eaf2cc', '#f6f1cc'];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = Math.min(0.999, y / 120) * (stops.length - 1);
      const i = Math.min(stops.length - 1, Math.floor(t + dither(x, y) - 0.5 + 0.5));
      ctx.fillStyle = stops[Math.max(0, i)];
      ctx.fillRect(x, y, 1, 1);
    }
  });
  const sun = layer((ctx) => {
    const cx = 200, cy = 86;
    for (let y = cy - 40; y < cy + 40; y++) for (let x = cx - 40; x < cx + 40; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < 21) { ctx.fillStyle = '#fbf7dc'; ctx.fillRect(x, y, 1, 1); }
      else if (d < 34 && dither(x, y) > (d - 21) / 13) { ctx.fillStyle = '#f6f3d2'; ctx.fillRect(x, y, 1, 1); }
    }
  });
  const far = layer((ctx) => {
    const f = ridge(98, 12);
    ctx.fillStyle = '#b9d796'; fillBelow(ctx, f);
    ctx.fillStyle = '#aacd89';
    for (let x = 0; x < W; x++) for (let y = f(x) + 6; y < H; y++) if (dither(x, y) < 0.5) ctx.fillRect(x, y, 1, 1);
  });
  const mid = layer((ctx) => {
    const f = ridge(114, 7);
    ctx.fillStyle = '#8fbf76'; fillBelow(ctx, f);
    for (let i = 0; i < 46; i++) { const x = Math.floor(rand() * W); pine(ctx, x, f(x) + 1, 6 + Math.floor(rand() * 6)); }
  });
  const trees = layer((ctx) => {
    const f = ridge(132, 4);
    ctx.fillStyle = '#5f9a63'; fillBelow(ctx, f);
    for (let i = 0; i < 40; i++) { const x = Math.floor(rand() * W); pine(ctx, x, f(x) + 1, 12 + Math.floor(rand() * 14)); }
  });
  const ground = layer((ctx) => {
    ctx.fillStyle = '#3f7a4f'; ctx.fillRect(0, 146, W, H - 146);
    ctx.fillStyle = '#4f8c5a';
    for (let y = 146; y < 154; y++) for (let x = 0; x < W; x++) if (dither(x, y) < 1 - (y - 146) / 8) ctx.fillRect(x, y, 1, 1);
    for (let y = 156; y < 163; y++) for (let x = 0; x < W; x++) {
      const edge = y === 156 || y === 162;
      if (!edge || dither(x, y) < 0.5) { ctx.fillStyle = y < 159 ? '#d2c894' : '#c4b982'; ctx.fillRect(x, y, 1, 1); }
    }
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(rand() * W), y = 148 + Math.floor(rand() * 26);
      if (y >= 155 && y <= 163) continue;
      ctx.fillStyle = rand() < 0.6 ? '#e8d36a' : '#f4f2e6';
      ctx.fillRect(x, y, 1, 1);
    }
  });
  const front = layer((ctx) => {
    ctx.fillStyle = '#16382a';
    [[-6, 176, 150], [14, 176, 120], [34, 180, 96], [378, 176, 156], [398, 176, 128], [360, 180, 84]].forEach(([x, b, h]) => pine(ctx, x, b, h));
    for (let x = 0; x < W; x++) {
      const h = 2 + Math.floor((Math.sin(x * 1.7) + 1) * 2 + rand() * 2);
      ctx.fillRect(x, H - h, 1, h);
    }
  });
  // [canvas, how far it sits below its resting place before you reach the bottom]
  return [[sky, 0], [sun, 30], [far, 22], [mid, 14], [trees, 8], [ground, 2], [front, 0]] as const;
}

export function initScene(reduceMotion: MediaQueryList) {
  const canvas = document.querySelector<HTMLCanvasElement>('.scene__canvas');
  if (!canvas) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const layers = buildLayers();
  const flies = Array.from({ length: 14 }, () => ({ x: rand() * W, y: 120 + rand() * 30, p: rand() * 6 }));
  let visible = false, raf = 0, t0 = performance.now();

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    const r = canvas.getBoundingClientRect();
    const p = reduceMotion.matches ? 1 : Math.max(0, Math.min(1, (innerHeight - r.top) / r.height));
    for (const [img, shift] of layers.slice(0, 6)) ctx.drawImage(img, 0, Math.round((1 - p) * shift));

    // the chase
    const run = reduceMotion.matches ? 0 : t;
    const lead = ((run * 24) % (W + 120)) - 40;
    const frame = Math.floor(run * 8) % 2;
    const groundY = 159 - 14 + Math.round((1 - p) * 2);
    ctx.drawImage(bake(frame ? ANANT_B : ANANT_A, ANANT_PALETTE), Math.round(lead), groundY);
    const sx = Math.round(lead - 34);
    ctx.drawImage(bake(frame ? SUIT_A : SUIT_B, SUIT_LOOKS[0]), sx, groundY);
    ctx.drawImage(bake(BRIEFCASE, CASE_PALETTE), sx + 8, groundY + 8);

    // fireflies in the tree line
    for (const f of flies) {
      if (Math.sin(run * 2 + f.p) > 0.55) {
        ctx.fillStyle = '#f6f1a0';
        ctx.fillRect(Math.round(f.x + Math.sin(run + f.p) * 3), Math.round(f.y + (1 - p) * 8), 1, 1);
      }
    }
    ctx.drawImage(layers[6][0], 0, 0);
    if (visible && !reduceMotion.matches) raf = requestAnimationFrame(draw);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(draw);
  }).observe(canvas);
  draw(performance.now());
}
