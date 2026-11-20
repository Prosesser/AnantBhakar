// Hand-authored pixel sprites. Each string row is one pixel row; "." is transparent.

export type Palette = Record<string, string>;
export type Sprite = string[];

export const ANANT_A: Sprite = [
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hssssssh..',
  '..sesssess..',
  '..ssssssss..',
  '...ssssss...',
  '..gggggggg..',
  '.gggggggggg.',
  '.gllllllllg.',
  '.slllllllls.',
  '..gggggggg..',
  '..pppppppp..',
  '..ppp..ppp..',
  '..bbb..bbb..',
];

export const ANANT_B: Sprite = [
  ...ANANT_A.slice(0, 12),
  '...pp..pp...',
  '..bb....bb..',
];

export const ANANT_PALETTE: Palette = {
  h: '#1b1b1b', s: '#c98d62', e: '#1b1b1b', g: '#57b878',
  l: '#c4ccd3', p: '#2d3a4a', b: '#f2f2ee',
};

export const SUIT_A: Sprite = [
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hssssssh..',
  '..sesssess..',
  '..ssssssss..',
  '...ssssss...',
  '..kkwrrwkk..',
  '.kkkkrrkkkk.',
  '.kkkkrrkkkk.',
  '.skkkkkkkks.',
  '..kkkkkkkk..',
  '..kkkkkkkk..',
  '..kkk..kkk..',
  '..nnn..nnn..',
];

export const SUIT_B: Sprite = [
  ...SUIT_A.slice(0, 12),
  '...kk..kk...',
  '..nn....nn..',
];

export const BRIEFCASE: Sprite = [
  '..ddd..',
  '.d...d.',
  'ccccccc',
  'ccyyycc',
  'ccccccc',
  'ccccccc',
];

export const CODE_BIT: Sprite = [
  '.x...x.',
  'x.....x',
  '.x...x.',
];

export const COFFEE: Sprite = [
  '.z.z...',
  '..z.z..',
  'mmmmm..',
  'mwwwmmm',
  'mwwwm.m',
  'mwwwmmm',
  'mmmmm..',
];

export const SUIT_LOOKS: Palette[] = [
  { h: '#5a3a22', s: '#f0c9a4', e: '#1b1b1b', k: '#233250', w: '#f4f4f0', r: '#c0392b', n: '#2a1a10' },
  { h: '#d8b25a', s: '#f3d2b3', e: '#1b1b1b', k: '#3a3a42', w: '#f4f4f0', r: '#d4a72c', n: '#1c1c1c' },
  { h: '#2a2a2a', s: '#a8754f', e: '#1b1b1b', k: '#4a3d63', w: '#f4f4f0', r: '#3f8fbf', n: '#1c1c1c' },
];

export const PANIC_LOOK: Palette = {
  h: '#d9e7f1', s: '#eef6fb', e: '#3a5a7a', k: '#9fb8d0', w: '#eef6fb', r: '#eef6fb', n: '#6f8aa6',
};
export const PANIC_BLINK: Palette = {
  h: '#ffffff', s: '#ffffff', e: '#c0392b', k: '#ffffff', w: '#ffffff', r: '#ffffff', n: '#d0d0d0',
};

export const CASE_PALETTE: Palette = { d: '#3b2414', c: '#8a5a2e', y: '#d4a72c' };
export const BIT_PALETTE: Palette = { x: '#d8ecbf' };
export const COFFEE_PALETTE: Palette = { z: '#e8efe2', m: '#f1ece0', w: '#6b3f22' };

const cache = new Map<string, HTMLCanvasElement>();

/** Renders a sprite once to an offscreen canvas (1 canvas pixel per sprite pixel) and caches it. */
export function bake(sprite: Sprite, palette: Palette, flip = false): HTMLCanvasElement {
  const key = sprite.join('|') + JSON.stringify(palette) + flip;
  const hit = cache.get(key);
  if (hit) return hit;
  const w = sprite[0].length, h = sprite.length;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  sprite.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    });
  });
  cache.set(key, c);
  return c;
}
