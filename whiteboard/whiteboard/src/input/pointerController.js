import { state, getEl, requestRender } from '../core/state.js';
import { canvas } from '../core/dom.js';
import { emit } from '../core/events.js';
import { commit } from '../core/history.js';
import { eventToWorld } from '../core/viewport.js';
import { bounds, isLinear, elementAt, hitTestEraser } from '../core/geometry.js';
import { clearSelection, setSelection, addWithGroup, resizeHandles } from '../core/selection.js';
import { createElement } from '../core/elementFactory.js';
import { translateElement, deleteElements } from '../core/elementOps.js';
import { setTool, applyToolCursor } from './toolManager.js';
import { beginTextEdit, endTextEdit } from './textEditor.js';
import { GRID_SIZE, STICKY_COLORS, ERASER_RADIUS_PX } from '../config/constants.js';

/**
 * Pointer interactions. `state.drag` describes the gesture in progress:
 *   pan | move | resize | marquee | create | connect | erase
 * Each kind has a start / update / finish handler below.
 */

const snapToGrid = (v) => (state.settings.snap ? Math.round(v / GRID_SIZE) * GRID_SIZE : v);
const clone = (v) => JSON.parse(JSON.stringify(v));
let stickyCounter = 0;

/* ---------- Gesture starters ---------- */

function startPan(ev) {
  const { x, y } = state.view;
  state.drag = { kind: 'pan', startX: ev.clientX, startY: ev.clientY, viewX: x, viewY: y };
  canvas.style.cursor = 'grabbing';
}

function startSelect(ev, x, y) {
  const handles = resizeHandles();
  const reach = 9 / state.view.s;
  const handle = handles ? handles.findIndex((p) => Math.abs(p[0] - x) < reach && Math.abs(p[1] - y) < reach) : -1;

  if (handle >= 0) {
    const el = getEl([...state.selection][0]);
    state.drag = { kind: 'resize', handle, el, box: { ...bounds(el) } };
    return;
  }

  const el = elementAt(x, y);
  if (el) {
    if (ev.shiftKey && state.selection.has(el.id)) {
      state.selection.delete(el.id);
    } else {
      if (!ev.shiftKey && !state.selection.has(el.id)) clearSelection();
      addWithGroup(el);
    }
    const originals = Object.fromEntries([...state.selection].map((id) => [id, clone(getEl(id))]));
    state.drag = { kind: 'move', x, y, moved: false, originals };
  } else {
    if (!ev.shiftKey) clearSelection();
    state.drag = { kind: 'marquee', x, y, x2: x, y2: y };
  }
  emit('ui:refresh');
}

function startText(x, y) {
  const el = createElement('text', x, y, 10, 10, '', { al: 'left' });
  state.board.els.push(el);
  setSelection([el.id]);
  setTool('select');
  beginTextEdit(el);
}

function startConnector(x, y) {
  const from = elementAt(x, y, true);
  if (!from) return;
  const arrow = createElement('arrow', 0, 0, 0, 0, '', { x2: x, y2: y, from: from.id, to: 0, fill: 'none' });
  state.board.els.push(arrow);
  state.drag = { kind: 'connect', el: arrow };
}

function startCreate(x, y) {
  const tool = state.tool;
  const sx = snapToGrid(x);
  const sy = snapToGrid(y);
  let el;

  if (tool === 'line' || tool === 'arrow') {
    el = createElement(tool, sx, sy, 0, 0, '', { x2: sx, y2: sy, fill: 'none', ah: tool === 'arrow' ? 'arrow' : 'none' });
  } else if (tool === 'pencil') {
    el = createElement('pencil', x, y, 0, 0, '', { pts: [[x, y]], fill: 'none' });
  } else if (tool === 'sticky') {
    el = createElement(tool, sx, sy, 0, 0, '', {
      fill: STICKY_COLORS[stickyCounter++ % STICKY_COLORS.length], sw: 0, tc: '#1f2937', al: 'left', r: 4, fs: 18,
    });
  } else {
    el = createElement(tool, sx, sy, 0, 0);
  }

  state.board.els.push(el);
  // Pencil strokes are never selected while being drawn.
  setSelection(el.pts ? [] : [el.id]);
  state.drag = { kind: 'create', el, x: sx, y: sy };
  emit('ui:refresh');
}

function startErase(x, y) {
  state.drag = { kind: 'erase', erased: false, lastX: x, lastY: y };
  eraseAt(x, y);
}

/* ---------- Gesture updates ---------- */

function eraseAt(x, y) {
  const radius = ERASER_RADIUS_PX / state.view.s;
  const ids = new Set(
    state.board.els.filter((e) => !e.locked && hitTestEraser(e, x, y, radius)).map((e) => e.id),
  );
  if (!ids.size) return;
  deleteElements(ids);
  state.drag.erased = true;
  emit('ui:refresh');
}

function updateMove(x, y) {
  const d = state.drag;
  let dx = x - d.x;
  let dy = y - d.y;
  const anchor = d.originals[[...state.selection][0]];
  if (state.settings.snap && anchor) {
    dx = snapToGrid(anchor.x + dx) - anchor.x;
    dy = snapToGrid(anchor.y + dy) - anchor.y;
  }
  if (dx || dy) d.moved = true;
  state.selection.forEach((id) => translateElement(getEl(id), d.originals[id], dx, dy));
}

function updateResize(x, y) {
  const { box, handle, el } = state.drag;
  const px = snapToGrid(x);
  const py = snapToGrid(y);
  const anchorX = handle % 2 ? box.x : box.x + box.w; // corner opposite to the dragged one
  const anchorY = handle < 2 ? box.y + box.h : box.y;
  el.x = Math.min(px, anchorX);
  el.y = Math.min(py, anchorY);
  el.w = Math.max(10, Math.abs(px - anchorX));
  el.h = Math.max(10, Math.abs(py - anchorY));
}

function updateCreate(ev, x, y) {
  const d = state.drag;
  const el = d.el;

  if (el.pts) {
    // Use every coalesced pointer sample and low-pass filter it for smooth strokes.
    const samples = ev.getCoalescedEvents && ev.getCoalescedEvents();
    for (const sample of samples && samples.length ? samples : [ev]) {
      const [wx, wy] = eventToWorld(sample);
      const last = el.pts[el.pts.length - 1];
      d.raw = [wx, wy];
      if (Math.hypot(wx - last[0], wy - last[1]) * state.view.s > 1.2) {
        el.pts.push([last[0] + (wx - last[0]) * 0.6, last[1] + (wy - last[1]) * 0.6]);
      }
    }
  } else if (isLinear(el)) {
    el.x2 = snapToGrid(x);
    el.y2 = snapToGrid(y);
    if (ev.shiftKey) {
      // Constrain to 45° steps
      const angle = Math.round(Math.atan2(el.y2 - el.y, el.x2 - el.x) / (Math.PI / 4)) * (Math.PI / 4);
      const length = Math.hypot(el.x2 - el.x, el.y2 - el.y);
      el.x2 = el.x + length * Math.cos(angle);
      el.y2 = el.y + length * Math.sin(angle);
    }
  } else {
    const px = snapToGrid(x);
    const py = snapToGrid(y);
    el.x = Math.min(d.x, px);
    el.y = Math.min(d.y, py);
    el.w = Math.abs(px - d.x);
    el.h = Math.abs(py - d.y);
  }
}

function updateErase(x, y) {
  const d = state.drag;
  // Interpolate between samples so fast strokes do not skip over elements.
  const steps = Math.max(1, Math.ceil((Math.hypot(x - d.lastX, y - d.lastY) * state.view.s) / 6));
  for (let i = 1; i <= steps; i++) {
    eraseAt(d.lastX + ((x - d.lastX) * i) / steps, d.lastY + ((y - d.lastY) * i) / steps);
  }
  d.lastX = x;
  d.lastY = y;
}

/* ---------- Gesture finishers ---------- */

function finishCreate(d) {
  const el = d.el;
  if (el.pts && d.raw) el.pts.push(d.raw); // end exactly where the pen was lifted

  let valid;
  if (el.pts) valid = el.pts.length > 1;
  else if (isLinear(el)) valid = Math.hypot(el.x2 - el.x, el.y2 - el.y) > 4;
  else valid = el.w > 3 || el.h > 3;

  if (!valid && !el.pts && !isLinear(el)) {
    // A plain click creates a default-sized shape.
    el.w = state.tool === 'sticky' ? 170 : 130;
    el.h = state.tool === 'sticky' ? 130 : 80;
    valid = true;
  }
  if (!valid) {
    state.board.els = state.board.els.filter((e) => e !== el);
    clearSelection();
    emit('ui:refresh');
    return;
  }

  if (el.type === 'diamond' && el.w < 40) el.w = 40;
  if (state.tool !== 'pencil') setTool('select');

  if (el.type === 'sticky') {
    emit('ui:refresh');
    beginTextEdit(el);
  } else {
    commit();
  }
}

function finishConnect(d, x, y) {
  const target = elementAt(x, y, true);
  if (target && target.id !== d.el.from) {
    d.el.to = target.id;
    commit();
  } else {
    state.board.els = state.board.els.filter((e) => e !== d.el);
    requestRender();
  }
}

function finishMarquee(d) {
  const [x1, x2] = [Math.min(d.x, d.x2), Math.max(d.x, d.x2)];
  const [y1, y2] = [Math.min(d.y, d.y2), Math.max(d.y, d.y2)];
  state.board.els.forEach((e) => {
    const b = bounds(e);
    if (!e.locked && b.x < x2 && b.x + b.w > x1 && b.y < y2 && b.y + b.h > y1) addWithGroup(e);
  });
  emit('ui:refresh');
}

/* ---------- Event wiring ---------- */

function onPointerDown(ev) {
  state.mouse = [ev.clientX, ev.clientY];
  if (state.editingId) endTextEdit();
  if (ev.button === 2) return; // right-click is handled by the context menu
  canvas.setPointerCapture(ev.pointerId);
  const [x, y] = eventToWorld(ev);

  if (state.tool === 'hand' || state.spaceHeld || ev.button === 1) return startPan(ev);
  switch (state.tool) {
    case 'select': return startSelect(ev, x, y);
    case 'eraser': return startErase(x, y);
    case 'text': return startText(x, y);
    case 'connector': return startConnector(x, y);
    default: return startCreate(x, y);
  }
}

function onPointerMove(ev) {
  state.mouse = [ev.clientX, ev.clientY];
  if (state.tool === 'eraser') requestRender();
  const d = state.drag;
  if (!d) return;
  const [x, y] = eventToWorld(ev);

  switch (d.kind) {
    case 'pan': state.view.x = d.viewX + ev.clientX - d.startX; state.view.y = d.viewY + ev.clientY - d.startY; break;
    case 'move': updateMove(x, y); break;
    case 'resize': updateResize(x, y); break;
    case 'create': updateCreate(ev, x, y); break;
    case 'connect': d.el.x2 = x; d.el.y2 = y; break;
    case 'marquee': d.x2 = x; d.y2 = y; break;
    case 'erase': updateErase(x, y); break;
  }
  requestRender();
}

function onPointerUp(ev) {
  const d = state.drag;
  state.drag = null;
  if (!d) return;
  const [x, y] = eventToWorld(ev);

  switch (d.kind) {
    case 'pan': applyToolCursor(); break;
    case 'move': if (d.moved) commit(); break;
    case 'resize': commit(); break;
    case 'erase': if (d.erased) commit(); break;
    case 'connect': finishConnect(d, x, y); break;
    case 'marquee': finishMarquee(d); break;
    case 'create': finishCreate(d); break;
  }
}

export function attachPointerInput() {
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', () => {
    state.mouse = null;
    if (state.tool === 'eraser') requestRender();
  });
}
