import { state } from '../core/state.js';
import { eventToWorld } from '../core/viewport.js';
import { setSelection } from '../core/selection.js';
import { commit } from '../core/history.js';
import { fitTextElement } from '../render/textLayout.js';
import { setTool } from '../input/toolManager.js';
import { GRID_SIZE } from '../config/constants.js';
import { PRESETS } from './presets.js';

/** Insert a preset near the centre of the view as individually editable elements. */
export function insertPreset(name) {
  const [cx, cy] = eventToWorld({ clientX: innerWidth / 2 - 150, clientY: innerHeight / 2 - 100 });
  const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE;
  const elements = PRESETS[name](snap(cx), snap(cy));

  elements.forEach((e) => {
    if (e.type !== 'text') return;
    fitTextElement(e);
    if (e.cen != null) e.x = e.cen - e.w / 2; // centre captions on their anchor
  });

  state.board.els.push(...elements);
  setSelection(elements.map((e) => e.id));
  setTool('select');
  commit();
}
