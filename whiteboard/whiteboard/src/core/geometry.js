import { state, getEl } from './state.js';
import { BOX_TYPES } from '../config/constants.js';

/* ---------- Basic helpers ---------- */

export const center = (e) => [e.x + e.w / 2, e.y + e.h / 2];
/** Lines and arrows are stored as two endpoints (x,y)→(x2,y2). */
export const isLinear = (e) => e.x2 !== undefined;

export function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq ? ((px - ax) * dx + (py - ay) * dy) / lengthSq : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/* ---------- Connectors ---------- */

/** Point where the line from a shape's centre towards (tx, ty) leaves the shape's bounding box. */
export function edgePoint(shape, tx, ty) {
  const [cx, cy] = center(shape);
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  const t = Math.min(shape.w / 2 / Math.abs(dx || 1e-9), shape.h / 2 / Math.abs(dy || 1e-9));
  return [cx + dx * t, cy + dy * t];
}

/** Actual [x1, y1, x2, y2] of a line/arrow, following the shapes it is bound to. */
export function endpoints(e) {
  const fromShape = e.from && getEl(e.from);
  const toShape = e.to && getEl(e.to);
  let start = [e.x, e.y];
  let end = [e.x2, e.y2];
  const startRef = fromShape ? center(fromShape) : start;
  const endRef = toShape ? center(toShape) : end;
  if (fromShape) start = edgePoint(fromShape, ...endRef);
  if (toShape) end = edgePoint(toShape, ...startRef);
  return [...start, ...end];
}

/* ---------- Bounds ---------- */

export function bounds(e) {
  if (e.pts) {
    const xs = e.pts.map((p) => p[0]);
    const ys = e.pts.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  if (isLinear(e)) {
    const [x1, y1, x2, y2] = endpoints(e);
    return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
  }
  return { x: e.x, y: e.y, w: e.w, h: e.h };
}

/** Bounding box of everything on the board, or null when empty. */
export function contentBounds() {
  const { els } = state.board;
  if (!els.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  els.forEach((e) => {
    const b = bounds(e);
    const pad = e.sw / 2;
    minX = Math.min(minX, b.x - pad);
    minY = Math.min(minY, b.y - pad);
    maxX = Math.max(maxX, b.x + b.w + pad);
    maxY = Math.max(maxY, b.y + b.h + pad);
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/* ---------- Hit testing (world coordinates) ---------- */

/** Does (x, y) touch element e? `tolerance` defaults to ~6 screen pixels. */
export function hitTest(e, x, y, tolerance) {
  const t = tolerance || 6 / state.view.s;
  if (e.pts) {
    for (let i = 0; i < e.pts.length - 1; i++) {
      if (distToSegment(x, y, ...e.pts[i], ...e.pts[i + 1]) < t + e.sw) return true;
    }
    return false;
  }
  if (isLinear(e)) {
    const [x1, y1, x2, y2] = endpoints(e);
    return distToSegment(x, y, x1, y1, x2, y2) < t + e.sw;
  }
  return x >= e.x - t && x <= e.x + e.w + t && y >= e.y - t && y <= e.y + e.h + t;
}

/**
 * Eraser variant: unfilled shapes are only erased near their border,
 * so wiping across the inside of a box does not delete it.
 */
export function hitTestEraser(e, x, y, radius) {
  if (e.pts || isLinear(e)) return hitTest(e, x, y, radius);
  const inside = x >= e.x - radius && x <= e.x + e.w + radius && y >= e.y - radius && y <= e.y + e.h + radius;
  if (!inside) return false;
  if (e.fill !== 'none' || ['text', 'image', 'sticky'].includes(e.type)) return true;
  const deepInside = x > e.x + radius && x < e.x + e.w - radius && y > e.y + radius && y < e.y + e.h - radius;
  return !deepInside;
}

/** Topmost unlocked element at (x, y). With boxOnly, lines/pencil strokes are ignored. */
export function elementAt(x, y, boxOnly = false) {
  const { els } = state.board;
  for (let i = els.length - 1; i >= 0; i--) {
    const e = els[i];
    if (e.locked) continue;
    if (boxOnly && !BOX_TYPES.has(e.type)) continue;
    if (hitTest(e, x, y)) return e;
  }
  return undefined;
}
