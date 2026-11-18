import { state } from './state.js';

/**
 * Element data model (plain JSON so boards can be stored and exported):
 *   id, type  – 'rect' | 'ellipse' | 'diamond' | 'sticky' | 'text' | 'image' | 'pencil' | 'line' | 'arrow'
 *   x, y, w, h – world-space box (boxes, text, images)
 *   x2, y2     – second endpoint (line/arrow); `from`/`to` bind it to shape ids
 *   pts        – [[x, y], ...] (pencil)
 *   text       – label / content
 *   fill, stroke, sw, dash, op, r, fs, ff, tc, ah, al – style (see config/constants.js)
 *   g          – group id,  locked – boolean,  src – image data URL
 */
export const newId = () => Math.random().toString(36).slice(2, 9);

/** Create an element using the user's current default style, with optional overrides. */
export function createElement(type, x, y, w, h, text = '', overrides = {}) {
  return { id: newId(), type, x, y, w, h, text, ...state.style, ...overrides };
}

/** Arrow/line glued to two shapes; it follows them when they move. */
export function createConnector(fromEl, toEl, arrowhead = 'arrow') {
  return createElement('arrow', 0, 0, 0, 0, '', {
    x2: 0, y2: 0, from: fromEl.id, to: toEl.id, ah: arrowhead, fill: 'none',
  });
}
