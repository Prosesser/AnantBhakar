// Pixel chess art for the ChessCircuit feature card. Prints an <svg> to stdout.
const knight = [
  '....xx.x....',
  '...xooxox...',
  '..xoooooox..',
  '.xooeooooox.',
  'xoooooooooox',
  'xooxxxooooox',
  '.xx..xoooox.',
  '....xooooox.',
  '...xoooooox.',
  '...xooooox..',
  '..xxxxxxxxx.',
  '.xooooooooox',
  '.xxxxxxxxxxx',
];
const pawn = [
  '...xxxx...',
  '..xddddx..',
  '..xddddx..',
  '...xddx...',
  '..xddddx..',
  '...xddx...',
  '...xddx...',
  '..xddddx..',
  '.xddddddx.',
  'xxxxxxxxxx',
];
const pal = { x: '#16382a', o: '#fefffc', e: '#16382a', d: '#16382a' };
const sq = 20, px = 5;
let out = `<svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">`;
for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++)
  out += `<rect x="${x * sq}" y="${y * sq}" width="${sq}" height="${sq}" fill="${(x + y) % 2 ? '#9cc283' : '#e3eedb'}"/>`;
const draw = (sprite, ox, oy, s) => sprite.forEach((row, y) => [...row].forEach((c, x) => {
  if (pal[c]) out += `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${pal[c]}"/>`;
}));
draw(pawn, 24, 64, 3.2);
draw(knight, 88, 70, 4);
out += '</svg>';
process.stdout.write(out);
