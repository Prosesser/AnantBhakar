// Pixelated serif titles that work in every browser.
// Each title's real text stays in the page (selectable, readable by screen readers) but is made transparent;
// a canvas behind it redraws the same characters at half resolution with hard edges, then scales back up
// with nearest-neighbour sampling. Character positions come from the browser's own layout, so wrapping,
// kerning and letter-spacing match exactly.
const SELECTOR = '.hero__logo, h2, .footer__line, .contact__big';
const BLOCK = 2; // CSS px per "pixel"

// Titles use static font files (see @font-face in styles.css) so the canvas draws exactly the glyphs the page laid out.
// They're loaded here explicitly too: on first load Safari may not have registered the stylesheet's faces yet,
// and asking for them by name would come back empty.
async function loadFonts() {
  const faces = [
    new FontFace('Fraunces Titles', "url('/fonts/fraunces-titles.woff2') format('woff2')", { weight: '400' }),
    new FontFace('Fraunces Display', "url('/fonts/fraunces-display.woff2') format('woff2')", { weight: '400' }),
  ];
  await Promise.all(faces.map(async (f) => document.fonts.add(await f.load())));
}

function draw(el: HTMLElement) {
  const style = getComputedStyle(el);
  const color = el.dataset.pxColor ?? style.color;
  el.dataset.pxColor = color;
  const box = el.getBoundingClientRect();
  if (!box.width || !box.height) return;

  let canvas = el.querySelector<HTMLCanvasElement>(':scope > canvas.px-title');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'px-title';
    canvas.setAttribute('aria-hidden', 'true');
    el.prepend(canvas);
  }
  const pad = 8; // room for glyph overhang
  const w = Math.ceil((box.width + pad * 2) / BLOCK), h = Math.ceil((box.height + pad * 2) / BLOCK);
  canvas.width = w; canvas.height = h;
  canvas.style.cssText = `left:${-pad}px;top:${-pad}px;width:${w * BLOCK}px;height:${h * BLOCK}px`;

  // Draw the text at full resolution offscreen, then turn each BLOCK×BLOCK square into one hard pixel.
  // The font is drawn a weight lighter (400) so thick stems come out slim; a block lights up at 20% coverage
  // so hairlines (like the thin leg of an A) still survive.
  const ss = BLOCK * Math.max(2, Math.round(devicePixelRatio || 1)); // sub-samples per block side (screen resolution)
  const k = ss / BLOCK;
  const hi = document.createElement('canvas');
  hi.width = w * ss; hi.height = h * ss;
  const hctx = hi.getContext('2d', { willReadFrequently: true })!;
  hctx.scale(k, k);
  hctx.translate(pad, pad);
  hctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  hctx.fillStyle = '#000';
  hctx.textBaseline = 'alphabetic';
  const m = hctx.measureText('Hg');
  const ascent = m.fontBoundingBoxAscent, glyphH = ascent + m.fontBoundingBoxDescent;

  // One range per character, positioned exactly where the browser laid it out.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.data;
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i])) continue;
      range.setStart(node, i); range.setEnd(node, i + 1);
      const r = range.getClientRects()[0];
      if (!r) continue;
      hctx.fillText(text[i], r.left - box.left, r.top - box.top + (r.height - glyphH) / 2 + ascent);
    }
  }

  const src = hctx.getImageData(0, 0, hi.width, hi.height).data;
  const ctx = canvas.getContext('2d')!;
  const out = ctx.createImageData(w, h);
  const d = out.data;
  const [cr, cg, cb] = (color.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).map(Number);
  const rowW = hi.width * 4;
  const need = Math.ceil(ss * ss * 0.2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let covered = 0;
    for (let dy = 0; dy < ss; dy++) for (let dx = 0; dx < ss; dx++) {
      if (src[(y * ss + dy) * rowW + (x * ss + dx) * 4 + 3] >= 128) covered++;
    }
    const o = (y * w + x) * 4;
    d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = covered >= need ? 255 : 0;
  }
  ctx.putImageData(out, 0, 0);
  el.classList.add('px-on');
}

export async function initPixelTitles() {
  if (!document.documentElement.classList.contains('px-canvas')) return; // Chromium uses the CSS filter instead
  try {
    await Promise.all([loadFonts(), document.fonts.ready]);
  } catch {
    return; // font failed: titles simply stay as smooth serif
  }
  const els = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
  const redraw = () => els.forEach(draw);
  redraw();
  let t = 0, lastW = innerWidth;
  window.addEventListener('resize', () => {
    if (innerWidth === lastW) return; // ignore mobile URL-bar height changes
    lastW = innerWidth;
    clearTimeout(t); t = window.setTimeout(redraw, 120);
  });
  // Re-measure if a title's size changes for another reason (e.g. late layout shifts)
  const ro = new ResizeObserver((entries) => entries.forEach((e) => draw(e.target as HTMLElement)));
  els.forEach((el) => ro.observe(el));
}
