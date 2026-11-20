// Generates the layered forest SVG used in the hero. Run: node scripts/gen-hero.mjs > src/hero-art.svg.html
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const W = 1600, BOTTOM = 1500;

function ridge(baseY, amp, roughness, step = 20, peaks = []) {
  const pts = [];
  const phase = rand() * 10, phase2 = rand() * 10;
  for (let x = -100; x <= W + 100; x += step) {
    let y = baseY
      + Math.sin(x / 260 + phase) * amp
      + Math.sin(x / 97 + phase2) * amp * 0.35
      + (rand() - 0.5) * roughness;
    for (const p of peaks) {
      const d = Math.abs(x - p.x);
      if (d < p.w) y -= p.h * Math.pow(Math.cos((d / p.w) * Math.PI / 2), 1.6);
    }
    pts.push([x, y]);
  }
  return pts;
}
const yAt = (pts, x) => {
  for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts.at(-1)[1];
};
const pathOf = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(0)},${y.toFixed(1)}`).join('L')}L${W + 100},${BOTTOM}L-100,${BOTTOM}Z`;

function pine(x, y, h) {
  const w = h * 0.36, tiers = 4;
  let d = `M${(x - w * 0.08).toFixed(1)},${(y + 2).toFixed(1)}`;
  const left = [], right = [];
  for (let t = 0; t < tiers; t++) {
    const ty = y - (h * t) / tiers * 0.9;
    const tw = w * (1 - t / tiers * 0.75);
    left.push([x - tw, ty - h * 0.06], [x - tw * 0.45, ty - h * 0.2]);
  }
  for (const [px, py] of left) d += `L${px.toFixed(1)},${py.toFixed(1)}`;
  d += `L${x.toFixed(1)},${(y - h).toFixed(1)}`;
  for (const [px, py] of left.reverse()) d += `L${(2 * x - px).toFixed(1)},${py.toFixed(1)}`;
  d += `L${(x + w * 0.08).toFixed(1)},${(y + 2).toFixed(1)}Z`;
  void right;
  return d;
}
function forest(pts, count, minH, maxH, xs) {
  let d = '';
  const positions = xs ?? Array.from({ length: count }, () => rand() * (W + 100) - 50);
  for (const x of positions) d += pine(x, yAt(pts, x) + 6, minH + rand() * (maxH - minH));
  return d;
}

const layers = [];
const L = (speed, body) => layers.push(`<g class="layer" data-speed="${speed}">${body}</g>`);

// Far hazy range
const r1 = ridge(470, 40, 14, 20, [{ x: 380, w: 260, h: 120 }, { x: 1350, w: 300, h: 90 }]);
L(0.42, `<path fill="#c3dca0" d="${pathOf(r1)}"/>`);
const r2 = ridge(545, 34, 12, 20, [{ x: 860, w: 340, h: 110 }]);
L(0.36, `<path fill="#a6c98a" d="${pathOf(r2)}"/>`);

// Tower ridge
const r3 = ridge(640, 26, 10, 20, [{ x: 1370, w: 340, h: 160 }]);
let tx = 0, ty = 1e9;
for (const [x, y] of r3) if (x > 1260 && x < 1480 && y < ty) { ty = y; tx = x; }
const tower = (() => {
  const c = '#4f8a5c', h = 120, cab = 26;
  const top = ty - h;
  return `<g fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="square">
    <path d="M${tx - 22},${ty + 4}L${tx - 14},${top + cab} M${tx + 22},${ty + 4}L${tx + 14},${top + cab}
             M${tx - 20},${ty - 20}L${tx + 16},${ty - 50}L${tx - 17},${ty - 80}L${tx + 15},${top + cab + 4}
             M${tx + 20},${ty - 20}L${tx - 16},${ty - 50}L${tx + 17},${ty - 80}L${tx - 15},${top + cab + 4}"/>
  </g>
  <rect x="${tx - 20}" y="${top}" width="40" height="${cab}" fill="${c}"/>
  <rect x="${tx - 15}" y="${top + 5}" width="30" height="9" fill="#f3f6d8" opacity=".85"/>
  <path d="M${tx - 27},${top + 1}L${tx},${top - 15}L${tx + 27},${top + 1}Z" fill="${c}"/>
  <rect x="${tx - 24}" y="${top + cab - 3}" width="48" height="4" fill="${c}"/>`;
})();
L(0.3, `<path fill="#82b273" d="${pathOf(r3)}"/>${tower}<path fill="#82b273" d="${forest(r3, 26, 14, 26)}"/>`);

const r4 = ridge(730, 30, 10, 20, [{ x: 260, w: 260, h: 70 }]);
L(0.22, `<path fill="#5c9763" d="${pathOf(r4)}"/><path fill="#5c9763" d="${forest(r4, 46, 22, 44)}"/>`);
const r5 = ridge(815, 24, 8, 20);
L(0.15, `<path fill="#3c7550" d="${pathOf(r5)}"/><path fill="#3c7550" d="${forest(r5, 40, 40, 78)}"/>`);
const r6 = ridge(895, 18, 8, 20);
L(0.08, `<path fill="#25553c" d="${pathOf(r6)}"/><path fill="#25553c" d="${forest(r6, 30, 70, 130)}"/>`);
const r7 = ridge(965, 10, 6, 20);
const edges = [1470, 1530, 1585, 1640];
// Cliff on the left with a hiker looking out over the valley
const cliffTop = [[-100, 532], [-40, 528], [20, 536], [80, 533], [140, 541], [200, 538], [250, 546], [300, 549], [322, 556]];
const cliffEdge = [[330, 574], [318, 600], [334, 628], [326, 662], [346, 700], [340, 742], [366, 790], [360, 840], [392, 900], [420, 1000]];
const cliff = `M-100,1500L${[...cliffTop, ...cliffEdge].map(([x, y]) => `${x},${y}`).join('L')}L460,1500Z`;
const rim = `<path d="M-100,537L60,540L170,546L300,553L322,558L300,557L170,550L60,545L-100,542Z M150,600L250,612L300,630L240,618Z M40,680L130,690L60,688Z" fill="#24503b"/>`;
// Hiker, feet at (0,0), facing right, shading eyes with one hand
const hiker = `<g transform="translate(262 548) scale(1.3)">
    <g fill="#16382a">
      <path d="M-14,0H-2V-5Q-3,-9 -8,-9H-13Z M2,0H16Q16,-5 11,-7H3Z"/>
      <path d="M-12,-8L-4,-8L-3,-20Q-2,-30 -4,-36L-12,-36Q-13,-24 -12,-8Z M4,-8L11,-8Q12,-22 10,-36L2,-36Q1,-22 4,-8Z"/>
      <path d="M-14,-33L-2,-31L0,-35L3,-31L13,-33L12,-50L-12,-50Z"/>
      <path d="M-11,-48L12,-48Q14,-62 13,-78Q6,-84 -2,-84L-8,-82Q-10,-66 -11,-48Z"/>
      <path d="M-9,-46Q-24,-44 -27,-56Q-30,-70 -26,-86Q-18,-90 -8,-86Z"/>
      <path d="M-26.5,-60Q-30.5,-58 -30,-52Q-29,-48 -25,-49Z"/>
      <path d="M-29,-86H-6Q-3,-89 -6,-93H-29Q-32,-89 -29,-86Z"/>
      <path d="M-10,-93L-9,-100L-7,-100L-8,-93Z"/>
      <path d="M0,-84h5v6h-5z"/>
      <circle cx="3" cy="-90" r="7.5"/>
      <path d="M10,-92L12.6,-88.5L10,-87Z"/>
      <path d="M-4.5,-92Q-4,-100 3,-99.5Q9,-99.5 11,-95L9,-93Q4,-96 -4.5,-92Z M-3,-97L-5.5,-99.5L-1,-99Z M1,-99L1,-101.5L4.5,-100Z M6,-99L8,-101L9,-98Z"/>
      <path d="M5,-80L10,-76L22,-90Q23.5,-94 20,-96L12,-99L9.5,-96L17,-91.5L7,-82Z"/>
      <path d="M7.5,-99.5L15,-102L16,-97.5L9,-95.5Z"/>
      <path d="M-6,-80Q-9.5,-68 -6.5,-55L-2.5,-55Q-4.5,-68 -2,-79Z"/>
    </g>
    <path d="M11.4,-50Q13.2,-62 12.3,-76 M10.4,-10Q11.3,-22 9.4,-34 M8.9,-94.2A7 7 0 0 1 8.8,-86 M10.6,-78L21.2,-90.6 M-28,-91.8H-7.5 M14.9,-101.2L15.4,-98.2" fill="none" stroke="#3f7a52" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
L(0, `<path fill="#16382a" d="${pathOf(r7)}"/><path fill="#16382a" d="${forest(r7, 0, 260, 420, edges)}${forest(r7, 10, 60, 120)}"/><path fill="#16382a" d="${cliff}"/>${rim}${hiker}`);

const svg = `<svg class="hero__art" viewBox="0 0 ${W} 1000" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef5d6"/><stop offset=".55" stop-color="#dcebbb"/><stop offset="1" stop-color="#c7dfa3"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#fbf8de" stop-opacity=".95"/><stop offset="1" stop-color="#fbf8de" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="1000" fill="url(#sky)"/>
  <g class="layer" data-speed="0.5">
    <circle cx="800" cy="440" r="320" fill="url(#glow)"/>
    <circle cx="800" cy="440" r="100" fill="#faf7dc"/>
    <path d="M930,470q8,-7 16,0q8,-7 16,0 M976,446q6,-5 12,0q6,-5 12,0 M890,500q5,-4 10,0q5,-4 10,0" fill="none" stroke="#6d9a66" stroke-width="2"/>
  </g>
  ${layers.join('\n  ')}
</svg>`;
process.stdout.write(svg);
