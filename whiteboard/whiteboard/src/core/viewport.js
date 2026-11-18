import { state, requestRender } from './state.js';
import { contentBounds } from './geometry.js';
import { emit } from './events.js';
import { MIN_ZOOM, MAX_ZOOM } from '../config/constants.js';

/** Screen (client) coordinates → world coordinates. Accepts anything with clientX/clientY. */
export function eventToWorld({ clientX, clientY }) {
  const { x, y, s } = state.view;
  return [(clientX - x) / s, (clientY - y) / s];
}

export function panBy(dx, dy) {
  state.view.x += dx;
  state.view.y += dy;
  requestRender();
}

/** Zoom by `factor`, keeping the world point under screen position (px, py) fixed. */
export function zoomAt(px, py, factor) {
  const view = state.view;
  const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.s * factor));
  const applied = nextScale / view.s;
  view.x = px - (px - view.x) * applied;
  view.y = py - (py - view.y) * applied;
  view.s = nextScale;
  requestRender();
  emit('view:changed');
}

export const zoomAtCenter = (factor) => zoomAt(innerWidth / 2, innerHeight / 2, factor);

export function resetZoom() {
  state.view.s = 1;
  zoomAtCenter(1);
}

/** Centre and scale the view so all content is visible (or reset when the board is empty). */
export function fitView() {
  const box = contentBounds();
  const view = state.view;
  if (!box) {
    Object.assign(view, { x: innerWidth / 2, y: innerHeight / 2, s: 1 });
  } else {
    const scale = Math.min(2, (innerWidth - 340) / (box.w + 80), (innerHeight - 160) / (box.h + 80));
    view.s = Math.max(MIN_ZOOM, scale);
    view.x = innerWidth / 2 - (box.x + box.w / 2) * view.s;
    view.y = innerHeight / 2 - (box.y + box.h / 2) * view.s;
  }
  requestRender();
  emit('view:changed');
}
