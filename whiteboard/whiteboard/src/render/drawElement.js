import { state, requestRender } from '../core/state.js';
import { resolveColor } from '../core/theme.js';
import { endpoints, isLinear } from '../core/geometry.js';
import { layoutText } from './textLayout.js';
import { dashPattern, diamondPoints, arrowheadShape, isDot, smoothPathData } from './shapeGeometry.js';

/* ---------- Caches ---------- */

const imageCache = {}; // element id → HTMLImageElement
const pencilPathCache = new WeakMap(); // element → { points, length, path }

function getImage(e) {
  if (!imageCache[e.id]) {
    const img = new Image();
    img.onload = requestRender;
    img.src = e.src;
    imageCache[e.id] = img;
  }
  return imageCache[e.id];
}

/** Path2D for a pencil stroke; rebuilt only when its points change. */
function getPencilPath(e) {
  const cached = pencilPathCache.get(e);
  if (cached && cached.points === e.pts && cached.length === e.pts.length) return cached.path;
  const path = new Path2D(smoothPathData(e.pts));
  pencilPathCache.set(e, { points: e.pts, length: e.pts.length, path });
  return path;
}

/* ---------- Per-type drawing ---------- */

function drawImage(ctx, e) {
  const img = getImage(e);
  if (img.complete && img.naturalWidth) ctx.drawImage(img, e.x, e.y, e.w, e.h);
}

function drawLinear(ctx, e, strokeColor) {
  const [x1, y1, x2, y2] = endpoints(e);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const head = arrowheadShape(e, x1, y1, x2, y2);
  if (!head) return;
  ctx.setLineDash([]);
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  if (isDot(head)) {
    ctx.arc(head[0], head[1], head[2], 0, Math.PI * 2);
  } else {
    ctx.moveTo(...head[0]);
    ctx.lineTo(...head[1]);
    ctx.lineTo(...head[2]);
  }
  ctx.closePath();
  ctx.fill();
}

function drawBoxShape(ctx, e, fillColor) {
  ctx.beginPath();
  if (e.type === 'ellipse') {
    ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, Math.abs(e.w / 2), Math.abs(e.h / 2), 0, 0, Math.PI * 2);
  } else if (e.type === 'diamond') {
    diamondPoints(e).forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.closePath();
  } else {
    ctx.roundRect(e.x, e.y, e.w, e.h, Math.max(0, Math.min(e.r, e.w / 2, e.h / 2)));
  }

  if (fillColor) {
    ctx.fillStyle = fillColor;
    if (e.type === 'sticky') {
      ctx.shadowColor = 'rgba(0,0,0,.22)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
    }
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  if (e.sw) ctx.stroke();
}

function drawLabel(ctx, e) {
  ctx.setLineDash([]);
  ctx.fillStyle = resolveColor(e.tc);
  ctx.textBaseline = 'top';
  layoutText(e, ctx).forEach((line) => ctx.fillText(line.text, line.x, line.y));
}

/* ---------- Public API ---------- */

/** Draw one element onto any 2D context (screen canvas or export canvas). */
export function drawElement(ctx, e) {
  ctx.save();
  ctx.globalAlpha = e.op;
  const strokeColor = resolveColor(e.stroke);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = e.sw;
  ctx.setLineDash(dashPattern(e));
  ctx.lineCap = ctx.lineJoin = 'round';

  if (e.type === 'image') drawImage(ctx, e);
  else if (e.type === 'pencil') ctx.stroke(getPencilPath(e));
  else if (isLinear(e)) drawLinear(ctx, e, strokeColor);
  else if (e.type !== 'text') drawBoxShape(ctx, e, e.fill === 'none' ? null : resolveColor(e.fill));

  const hasLabel = e.text && !isLinear(e) && !e.pts;
  if (hasLabel && e.id !== state.editingId) drawLabel(ctx, e);
  ctx.restore();
}
