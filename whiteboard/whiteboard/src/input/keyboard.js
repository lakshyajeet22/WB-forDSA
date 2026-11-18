import { state, requestRender } from '../core/state.js';
import { canvas } from '../core/dom.js';
import { undo, redo } from '../core/history.js';
import { clearSelection } from '../core/selection.js';
import { panBy } from '../core/viewport.js';
import {
  deleteSelection, duplicateSelection, selectAll, copySelection, pasteClipboard,
  groupSelection, ungroupSelection,
} from '../core/elementOps.js';
import { emit } from '../core/events.js';
import { setTool, applyToolCursor } from './toolManager.js';
import { confirmClearCanvas } from '../ui/dialogs.js';
import { KEY_TO_TOOL } from '../config/constants.js';

/** Typing in fields must never trigger shortcuts (range sliders are fine). */
const isTypingTarget = (el) => /INPUT|TEXTAREA|SELECT/.test(el.tagName) && el.type !== 'range';

const ARROW_PAN = { arrowleft: [1, 0], arrowright: [-1, 0], arrowup: [0, 1], arrowdown: [0, -1] };

function handleModifierShortcut(ev, key) {
  const actions = {
    z: () => (ev.shiftKey ? redo() : undo()),
    y: redo,
    d: duplicateSelection,
    a: selectAll,
    c: copySelection,
    v: pasteClipboard,
    g: () => (ev.shiftKey ? ungroupSelection() : groupSelection()),
  };
  const action = actions[key];
  if (!action) return;
  if (key !== 'c') ev.preventDefault(); // let the browser keep its own copy behaviour
  action();
  if (key === 'a') emit('ui:refresh');
}

function onKeyDown(ev) {
  if (isTypingTarget(ev.target)) return;
  const key = ev.key.toLowerCase();

  if (key === ' ') {
    ev.preventDefault();
    state.spaceHeld = true;
    applyToolCursor();
    return;
  }
  if (ev.ctrlKey || ev.metaKey) return handleModifierShortcut(ev, key);

  if (key in ARROW_PAN) {
    if (state.selection.size) return;
    ev.preventDefault();
    const step = ev.shiftKey ? 200 : 60;
    panBy(ARROW_PAN[key][0] * step, ARROW_PAN[key][1] * step);
  } else if (key === 'delete' && ev.shiftKey) {
    ev.preventDefault();
    confirmClearCanvas();
  } else if (key === 'delete' || key === 'backspace') {
    ev.preventDefault();
    deleteSelection();
  } else if (key === 'escape') {
    clearSelection();
    setTool('select');
    emit('ui:refresh');
  } else if (KEY_TO_TOOL[key]) {
    setTool(KEY_TO_TOOL[key]);
  }
}

export function attachKeyboard() {
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', (ev) => {
    if (ev.key !== ' ') return;
    state.spaceHeld = false;
    applyToolCursor();
  });
  // Clicking a toolbar button must not keep focus, or Space/letters would re-trigger it.
  document.addEventListener('click', (e) => {
    const button = e.target.closest('#toolbar .btn, #topbar .btn');
    if (button) button.blur();
  });
}
