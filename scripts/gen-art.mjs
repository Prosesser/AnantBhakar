// Generates pixel-art SVGs for project previews and achievement badges into public/art/.
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
function sprite(rows, pal, ox = 0, oy = 0, s = 1) {
  let out = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (pal[ch]) out += rect(ox + x * s, oy + y * s, s, s, pal[ch]);
  }));
  return out;
}
const BG = '#e3eedb', LIGHT = '#9cc283', DARK = '#16382a', CREAM = '#fefffc', MID = '#5f9a63';

// ── Project previews (160×160) ───────────────────────────────────────────────
const chess = execFileSync(process.execPath, ['scripts/gen-chess.mjs'], { encoding: 'utf8' });
writeFileSync('public/art/chesscircuit.svg', chess.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

{ // IntegraLearn: graph paper, a curve, the area under it shaded
  let b = rect(0, 0, 160, 160, BG);
  for (let i = 0; i <= 160; i += 20) b += rect(i, 0, 1, 160, '#cfe0c3') + rect(0, i, 160, 1, '#cfe0c3');
  const f = (x) => 92 - Math.sin((x - 20) / 22) * 34 - (x - 20) * 0.12;
  for (let x = 40; x < 124; x += 4) b += rect(x, Math.round(f(x) / 4) * 4 + 4, 4, 128 - (Math.round(f(x) / 4) * 4 + 4), LIGHT);
  for (let x = 20; x < 148; x += 4) b += rect(x, Math.round(f(x) / 4) * 4, 4, 4, DARK);
  b += rect(16, 128, 132, 4, DARK) + rect(16, 20, 4, 112, DARK);
  b += rect(40, 112, 2, 16, DARK) + rect(122, 112, 2, 16, DARK);
  b += sprite(['..xx', '.x..', '.x..', '.x..', '.x..', '.x..', '.x..', 'xx..'], { x: DARK }, 128, 24, 4); // ∫
  writeFileSync('public/art/integralearn.svg', svg(160, 160, b));
}

{ // UniSign: a waving hand and a speech bubble
  const hand = [
    '......xx........',
    '...xxxooxxx.....',
    '..xooxooxoox....',
    '..xooxooxooxxx..',
    '..xooxooxooxoox.',
    '..xooxooxooxoox.',
    '..xooxooxooxoox.',
    'xxxooooooooooox.',
    'xooooooooooooox.',
    '.xoooooooooooox.',
    '..xooooooooooox.',
    '...xoooooooooox.',
    '....xoooooooox..',
    '....xoooooooox..',
    '....xxxxxxxxxx..',
  ];
  let b = rect(0, 0, 160, 160, BG);
  b += sprite(hand, { x: DARK, o: CREAM }, 24, 46, 6);
  b += rect(104, 20, 44, 28, CREAM) + rect(104, 20, 44, 2, DARK) + rect(104, 46, 44, 2, DARK) + rect(104, 20, 2, 28, DARK) + rect(146, 20, 2, 28, DARK);
  b += rect(110, 48, 6, 4, DARK) + rect(106, 52, 6, 4, DARK);
  b += sprite(['x.x.x', 'x.x.x', 'xxx.x', 'x.x.x', 'x.x.x'], { x: MID }, 116, 26, 3);
  b += rect(98, 66, 4, 4, MID) + rect(104, 60, 4, 4, MID) + rect(104, 72, 4, 4, MID);
  writeFileSync('public/art/unisign.svg', svg(160, 160, b));
}

{ // MP4 compressor: a film strip squeezed between two arrows
  let b = rect(0, 0, 160, 160, BG);
  b += rect(36, 44, 88, 72, DARK);
  for (let x = 40; x < 124; x += 12) b += rect(x, 48, 6, 6, BG) + rect(x, 106, 6, 6, BG);
  b += rect(44, 60, 34, 40, LIGHT) + rect(82, 60, 34, 40, LIGHT);
  b += sprite(['x...', 'xx..', 'xxx.', 'xxxx', 'xxx.', 'xx..', 'x...'], { x: CREAM }, 88, 66, 4);
  const arrow = ['....x..', '....xx.', 'xxxxxxx', '....xx.', '....x..'];
  b += sprite(arrow, { x: MID }, 4, 70, 4);
  b += sprite(arrow.map((r) => [...r].reverse().join('')), { x: MID }, 128, 70, 4);
  writeFileSync('public/art/mp4.svg', svg(160, 160, b));
}

// ── Achievement badges (12×14 grids) ─────────────────────────────────────────
const gold = { d: '#7a5a12', y: '#d4a72c', w: '#fbf0bf', g: '#7fd197', k: '#eef5d6' };
const badges = {
  medal: ['..gg....gg..', '...gg..gg...', '....gggg....', '...dddddd...', '..dyyyyyyd..', '.dyywyyyyyd.', '.dywyyyyyyd.', '.dyyyyyyyyd.', '.dyyyyyyyyd.', '..dyyyyyyd..', '...dddddd...'],
  trophy: ['..dddddddd..', 'ddyyyyyyyydd', 'dydywyyyydyd', 'dydywyyyydyd', '.ddyyyyyydd.', '...dyyyyd...', '....dyyd....', '.....dd.....', '.....yy.....', '....dyyd....', '...dyyyyd...', '..dddddddd..'],
  king: ['.....kk.....', '....kkkk....', '.....kk.....', '...kkkkkk...', '..kkkkkkkk..', '...kkkkkk...', '....kkkk....', '....kkkk....', '...kkkkkk...', '..kkkkkkkk..', '.kkkkkkkkkk.', '.kkkkkkkkkk.'],
  star: ['.....yy.....', '.....yy.....', '....yyyy....', 'yyyyywyyyyyy', '.yyyywyyyyy.', '..yyyyyyyy..', '...yyyyyy...', '...yyyyyy...', '..yyy..yyy..', '..yy....yy..', '.yy......yy.'],
  runner: ['...hhhhhh...', '..hhhhhhhh..', '..hssssssh..', '..sesssess..', '..ssssssss..', '...ssssss...', '..gggggggg..', '.gggggggggg.', '.gllllllllg.', '.slllllllls.', '..gggggggg..', '..pppppppp..', '...pp..pp...', '..bb....bb..'],
  locked: ['....xxxx....', '...x....x...', '..x......x..', '.......x....', '......x.....', '.....x......', '.....x......', '............', '.....x......', '.....x......'],
};
const runnerPal = { h: '#1b1b1b', s: '#c98d62', e: '#1b1b1b', g: '#57b878', l: '#c4ccd3', p: '#2d3a4a', b: '#f2f2ee' };
for (const [name, rows] of Object.entries(badges)) {
  const w = rows[0].length, h = 14, oy = Math.floor((h - rows.length) / 2);
  const pal = name === 'runner' ? runnerPal : name === 'locked' ? { x: '#b4b8b4' } : gold;
  writeFileSync(`public/art/badge-${name}.svg`, svg(w, h, sprite(rows, pal, 0, oy)));
}
console.log('ok');
