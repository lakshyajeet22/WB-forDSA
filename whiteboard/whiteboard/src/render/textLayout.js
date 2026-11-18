/** Text measuring, wrapping and placement (shared by canvas drawing and SVG export). */

const measureCtx = document.createElement('canvas').getContext('2d');

export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  text.split('\n').forEach((paragraph) => {
    let line = '';
    paragraph.split(' ').forEach((word) => {
      const candidate = line ? line + ' ' + word : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    lines.push(line);
  });
  return lines;
}

/** Wrapped lines of an element with their world positions: [{ text, x, y }]. */
export function layoutText(e, ctx = measureCtx) {
  ctx.font = `${e.fs}px ${e.ff}`;
  const isFreeText = e.type === 'text';
  const lines = wrapText(ctx, e.text, isFreeText ? Infinity : e.w - 16);
  const lineHeight = e.fs * 1.3;
  const padding = isFreeText ? 0 : 8;
  const top = isFreeText
    ? e.y
    : e.type === 'sticky'
      ? e.y + 10
      : e.y + (e.h - lines.length * lineHeight) / 2;

  return lines.map((text, i) => {
    const width = ctx.measureText(text).width;
    const x =
      e.al === 'left' ? e.x + padding
      : e.al === 'right' ? e.x + e.w - padding - width
      : e.x + (e.w - width) / 2;
    return { text, x, y: top + i * lineHeight };
  });
}

/** Resize a free-text element to fit its content. */
export function fitTextElement(e) {
  measureCtx.font = `${e.fs}px ${e.ff}`;
  const lines = e.text.split('\n');
  e.w = Math.max(10, ...lines.map((l) => measureCtx.measureText(l).width));
  e.h = lines.length * e.fs * 1.3;
}
