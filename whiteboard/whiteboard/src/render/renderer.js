import { state, getEl } from '../core/state.js';
import { canvas } from '../core/dom.js';
import { bounds } from '../core/geometry.js';
import { resizeHandles } from '../core/selection.js';
import { drawElement } from './drawElement.js';
import { ACCENT, GRID_SIZE, ERASER_RADIUS_PX } from '../config/constants.js';

const ctx = canvas.getContext('2d');

/** Repaint only when something changed (state.dirty), once per animation frame. */
export function startRenderLoop() {
  const frame = () => {
    if (state.dirty) render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function syncCanvasSize(width, height, dpr) {
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

/** Dot grid aligned to world coordinates, so it scrolls and zooms with the content. */
function drawGrid(width, height) {
  const { view, settings } = state;
  if (!settings.grid) return;
  const base = GRID_SIZE * view.s;
  const spacing = base < 8 ? base * 5 : base; // thin out the grid when zoomed far out
  ctx.fillStyle = settings.dark ? '#3a3f4b' : '#cfd4dc';
  ctx.beginPath();
  for (let x = ((view.x % spacing) + spacing) % spacing; x < width; x += spacing) {
    for (let y = ((view.y % spacing) + spacing) % spacing; y < height; y += spacing) {
      ctx.rect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
  }
  ctx.fill();
}

function drawVisibleElements(width, height) {
  const { view, board } = state;
  const left = -view.x / view.s;
  const top = -view.y / view.s;
  const right = left + width / view.s;
  const bottom = top + height / view.s;

  board.els.forEach((e) => {
    const b = bounds(e);
    const pad = e.sw + 20;
    const offscreen = b.x + b.w + pad < left || b.x - pad > right || b.y + b.h + pad < top || b.y - pad > bottom;
    if (!offscreen) drawElement(ctx, e);
  });
}

function drawSelectionOverlay() {
  const px = 1 / state.view.s; // one screen pixel in world units
  ctx.lineWidth = 1.5 * px;
  ctx.strokeStyle = ACCENT;
  ctx.setLineDash([5 * px, 4 * px]);

  if (state.tool === 'select') {
    state.selection.forEach((id) => {
      const el = getEl(id);
      if (!el) return;
      const b = bounds(el);
      const pad = 4 * px;
      ctx.strokeRect(b.x - pad, b.y - pad, b.w + 2 * pad, b.h + 2 * pad);
    });
  }
  ctx.setLineDash([]);

  const handles = resizeHandles();
  if (handles) {
    ctx.fillStyle = '#fff';
    handles.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.rect(x - 4 * px, y - 4 * px, 8 * px, 8 * px);
      ctx.fill();
      ctx.stroke();
    });
  }
}

function drawMarquee() {
  const d = state.drag;
  if (!d || d.kind !== 'marquee') return;
  ctx.fillStyle = 'rgba(99,102,241,.12)';
  ctx.fillRect(d.x, d.y, d.x2 - d.x, d.y2 - d.y);
  ctx.strokeRect(d.x, d.y, d.x2 - d.x, d.y2 - d.y);
}

/** Ring showing the eraser's size; drawn in screen space with a halo so it is visible on any background. */
function drawEraserCursor(dpr) {
  if (state.tool !== 'eraser' || !state.mouse) return;
  const [mx, my] = state.mouse;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 4;
  ctx.strokeStyle = state.settings.dark ? '#000' : '#fff';
  ctx.beginPath();
  ctx.arc(mx, my, ERASER_RADIUS_PX, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ef4444';
  ctx.fillStyle = 'rgba(239,68,68,.14)';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(mx - 1, my - 1, 2, 2);
}

function render() {
  state.dirty = false;
  const dpr = devicePixelRatio || 1;
  const width = innerWidth;
  const height = innerHeight;
  syncCanvasSize(width, height, dpr);

  // Screen space: background grid
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height);

  // World space: elements and overlays
  const { x, y, s } = state.view;
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * x, dpr * y);
  drawVisibleElements(width, height);
  drawSelectionOverlay();
  drawMarquee();

  // Screen space again: eraser cursor
  drawEraserCursor(dpr);
}
