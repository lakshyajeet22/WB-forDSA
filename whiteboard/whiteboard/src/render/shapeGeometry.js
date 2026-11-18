/** Small pure helpers that describe how shapes are drawn (used by canvas and SVG export). */

export const dashPattern = (e) =>
  e.dash === 'dashed' ? [e.sw * 4, e.sw * 3] : e.dash === 'dotted' ? [e.sw, e.sw * 2.5] : [];

export const diamondPoints = (e) => [
  [e.x + e.w / 2, e.y],
  [e.x + e.w, e.y + e.h / 2],
  [e.x + e.w / 2, e.y + e.h],
  [e.x, e.y + e.h / 2],
];

/**
 * Arrowhead at (x2, y2) for a segment from (x1, y1).
 * Returns null, a dot `[cx, cy, radius]`, or a triangle `[[tip], [wing], [wing]]`.
 */
export function arrowheadShape(e, x1, y1, x2, y2) {
  if (!e.ah || e.ah === 'none') return null;
  const size = 6 + e.sw * 2.5;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  if (e.ah === 'dot') return [x2, y2, size / 2 + 1];
  const wing = (delta) => [x2 - size * Math.cos(angle + delta), y2 - size * Math.sin(angle + delta)];
  return [[x2, y2], wing(-0.45), wing(0.45)];
}

export const isDot = (head) => typeof head[0] === 'number';

/**
 * Smooth freehand path (SVG path syntax): quadratic curves through the midpoints
 * between recorded points, so strokes look like one continuous line.
 */
export function smoothPathData(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  if (pts.length < 3) {
    pts.slice(1).forEach((p) => (d += `L${p[0]} ${p[1]}`));
    return d;
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i][0] + pts[i + 1][0]) / 2;
    const midY = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${pts[i][0]} ${pts[i][1]} ${midX} ${midY}`;
  }
  return d + `L${pts[pts.length - 1].join(' ')}`;
}
