import { createElement, createConnector } from '../core/elementFactory.js';
import { ACCENT } from '../config/constants.js';

/** Shared element helpers for the DSA builders. */

/** A labelled node (accent-coloured outline). */
export const node = (type, x, y, w, h, text, overrides = {}) =>
  createElement(type, x, y, w, h, String(text), { stroke: ACCENT, ...overrides });

/**
 * A small caption. `cen` is the x-coordinate the caption is centred on;
 * insertPreset re-centres it once the text has been measured.
 */
export const caption = (centerX, y, text) =>
  createElement('text', centerX, y, 0, 0, text, { fs: 13, al: 'left', cen: centerX });

export const connect = createConnector;
