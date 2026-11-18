import { state, getEl, requestRender } from './state.js';
import { commit } from './history.js';
import { endpoints, isLinear } from './geometry.js';
import { clearSelection, setSelection, selectedElements } from './selection.js';
import { newId } from './elementFactory.js';
import { fitTextElement } from '../render/textLayout.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

/* ---------- Moving ---------- */

/** Position `el` at its `original` snapshot shifted by (dx, dy). */
export function translateElement(el, original, dx, dy) {
  if (el.locked) return;
  el.x = original.x + dx;
  el.y = original.y + dy;
  if (original.x2 !== undefined) {
    el.x2 = original.x2 + dx;
    el.y2 = original.y2 + dy;
  }
  if (original.pts) el.pts = original.pts.map((p) => [p[0] + dx, p[1] + dy]);
}

/* ---------- Deleting ---------- */

/** Remove elements by id. Connectors attached to them keep their last position. */
export function deleteElements(ids) {
  state.board.els.forEach((e) => {
    const attached = (e.from || e.to) && (ids.has(e.from) || ids.has(e.to));
    if (!attached) return;
    [e.x, e.y, e.x2, e.y2] = endpoints(e);
    if (ids.has(e.from)) e.from = 0;
    if (ids.has(e.to)) e.to = 0;
  });
  state.board.els = state.board.els.filter((e) => !ids.has(e.id));
  ids.forEach((id) => state.selection.delete(id));
  requestRender();
}

export function deleteSelection() {
  const ids = new Set(selectedElements().filter((e) => !e.locked).map((e) => e.id));
  if (!ids.size) return;
  deleteElements(ids);
  commit();
}

export function clearCanvas() {
  state.board.els = [];
  clearSelection();
  commit();
}

/* ---------- Layer order ---------- */

/** @param {'front'|'forward'|'backward'|'back'} mode */
export function reorderSelection(mode) {
  const list = state.board.els;
  const isSelected = (e) => state.selection.has(e.id);

  if (mode === 'front') {
    state.board.els = [...list.filter((e) => !isSelected(e)), ...list.filter(isSelected)];
  } else if (mode === 'back') {
    state.board.els = [...list.filter(isSelected), ...list.filter((e) => !isSelected(e))];
  } else if (mode === 'forward') {
    for (let i = list.length - 2; i >= 0; i--) {
      if (isSelected(list[i]) && !isSelected(list[i + 1])) [list[i], list[i + 1]] = [list[i + 1], list[i]];
    }
  } else {
    for (let i = 1; i < list.length; i++) {
      if (isSelected(list[i]) && !isSelected(list[i - 1])) [list[i], list[i - 1]] = [list[i - 1], list[i]];
    }
  }
  commit();
}

/* ---------- Grouping & locking ---------- */

export function groupSelection() {
  if (state.selection.size < 2) return;
  const groupId = newId();
  selectedElements().forEach((e) => (e.g = groupId));
  commit();
}

export function ungroupSelection() {
  selectedElements().forEach((e) => delete e.g);
  commit();
}

export function toggleLockSelection() {
  const els = selectedElements();
  if (!els.length) return;
  const lock = !els.every((e) => e.locked);
  els.forEach((e) => (e.locked = lock));
  if (lock) clearSelection();
  commit();
}

export function selectAll() {
  setSelection(state.board.els.filter((e) => !e.locked).map((e) => e.id));
}

/* ---------- Clipboard ---------- */

let clipboard = [];

export function copySelection() {
  clipboard = selectedElements().map((original) => {
    const copy = clone(original);
    // Bake the live connector endpoints so pasted arrows keep their shape even when unbound.
    if (isLinear(original)) [copy.x, copy.y, copy.x2, copy.y2] = endpoints(original);
    return copy;
  });
}

export function pasteClipboard() {
  if (!clipboard.length) return;
  const OFFSET = 20;
  const idMap = {};
  clipboard.forEach((e) => (idMap[e.id] = newId()));

  const pasted = clipboard.map((e) => {
    const c = clone(e);
    c.id = idMap[e.id];
    c.x += OFFSET;
    c.y += OFFSET;
    if (c.x2 !== undefined) {
      c.x2 += OFFSET;
      c.y2 += OFFSET;
    }
    if (c.pts) c.pts = c.pts.map((p) => [p[0] + OFFSET, p[1] + OFFSET]);
    if (c.from !== undefined) {
      c.from = idMap[c.from] || 0; // keep bindings only to elements that were copied too
      c.to = idMap[c.to] || 0;
    }
    if (c.g) c.g = 'c' + c.g;
    c.locked = false;
    return c;
  });

  clipboard = clone(pasted); // next paste lands another step further
  state.board.els.push(...pasted);
  setSelection(pasted.map((e) => e.id));
  commit();
}

export function duplicateSelection() {
  copySelection();
  pasteClipboard();
}

/* ---------- Styling ---------- */

const NUMERIC_PROPS = new Set(['sw', 'op', 'r', 'fs']);

/** Apply a style property to the default style and every selected (unlocked) element. */
export function applyStyleProperty(key, value) {
  if (NUMERIC_PROPS.has(key)) value = parseFloat(value) || 0;
  state.style[key] = value;
  state.selection.forEach((id) => {
    const el = getEl(id);
    if (!el || el.locked) return;
    el[key] = value;
    if (key === 'fs' && el.type === 'text') fitTextElement(el);
  });
  requestRender();
}
