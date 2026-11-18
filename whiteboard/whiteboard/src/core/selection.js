import { state, getEl } from './state.js';
import { bounds } from './geometry.js';
import { RESIZABLE_TYPES } from '../config/constants.js';

export const clearSelection = () => {
  state.selection = new Set();
};

export const setSelection = (ids) => {
  state.selection = new Set(ids);
};

/** Add an element to the selection, together with the rest of its group. */
export function addWithGroup(el) {
  state.board.els.forEach((o) => {
    if (o.id === el.id || (el.g && o.g === el.g)) state.selection.add(o.id);
  });
}

export const selectedElements = () => [...state.selection].map(getEl).filter(Boolean);

/** Corner handle positions [nw, ne, sw, se] when exactly one resizable element is selected. */
export function resizeHandles() {
  if (state.tool !== 'select' || state.selection.size !== 1) return null;
  const el = getEl([...state.selection][0]);
  if (!el || el.locked || !RESIZABLE_TYPES.has(el.type)) return null;
  const b = bounds(el);
  return [
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x, b.y + b.h],
    [b.x + b.w, b.y + b.h],
  ];
}
