import { DEFAULT_STYLE } from '../config/constants.js';

/**
 * Single source of truth for runtime state.
 * Elements live in `board.els` in *world* coordinates; `view` maps world → screen.
 */
export const state = {
  board: { id: '', title: 'Untitled board', els: [] },
  view: { x: 0, y: 0, s: 1 }, // screen = world * s + (x, y)
  tool: 'select',
  selection: new Set(), // ids of selected elements
  drag: null, // active pointer interaction (see input/pointerController.js)
  spaceHeld: false,
  editingId: null, // id of the element whose text is being edited
  mouse: null, // last pointer position in screen px (for the eraser cursor)
  style: { ...DEFAULT_STYLE }, // style for new elements
  settings: {
    snap: true,
    grid: true,
    wheelZoom: false, // false: wheel scrolls, true: wheel zooms
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
  },
  dirty: true, // true when the canvas needs a repaint
};

export const requestRender = () => {
  state.dirty = true;
};

export const getEl = (id) => state.board.els.find((e) => e.id === id);
