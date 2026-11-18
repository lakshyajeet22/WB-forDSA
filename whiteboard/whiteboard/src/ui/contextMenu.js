import { canvas } from '../core/dom.js';
import { emit } from '../core/events.js';
import { eventToWorld } from '../core/viewport.js';
import { elementAt } from '../core/geometry.js';
import { clearSelection, addWithGroup } from '../core/selection.js';
import { state } from '../core/state.js';
import {
  duplicateSelection, copySelection, pasteClipboard, reorderSelection, toggleLockSelection, deleteSelection,
} from '../core/elementOps.js';
import { showMenu } from './popupMenu.js';

export function initContextMenu() {
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    const [x, y] = eventToWorld(ev);
    const el = elementAt(x, y);
    if (el && !state.selection.has(el.id)) {
      clearSelection();
      addWithGroup(el);
      emit('ui:refresh');
    }
    showMenu(ev.clientX, ev.clientY, [
      ['Duplicate', duplicateSelection],
      ['Copy', copySelection],
      ['Paste', pasteClipboard],
      ['Bring to front', () => reorderSelection('front')],
      ['Send to back', () => reorderSelection('back')],
      ['Lock / unlock', toggleLockSelection],
      ['Delete', deleteSelection],
    ]);
  });
}
