import { state, requestRender } from '../core/state.js';
import { canvas } from '../core/dom.js';
import { clearSelection } from '../core/selection.js';
import { emit } from '../core/events.js';

const CURSORS = { select: 'default', hand: 'grab', eraser: 'none', text: 'text' };

/** Cursor for the active tool (the eraser draws its own ring, so the system cursor is hidden). */
export function applyToolCursor() {
  canvas.style.cursor = state.spaceHeld ? 'grab' : CURSORS[state.tool] || 'crosshair';
}

export function setTool(tool) {
  if (tool === 'image') {
    emit('image:pick');
    return;
  }
  state.tool = tool;
  // Drawing tools never keep a selection, so no selection box can appear while drawing.
  if (tool !== 'select' && tool !== 'hand' && state.selection.size) {
    clearSelection();
    emit('ui:refresh');
  }
  applyToolCursor();
  requestRender();
  emit('tool:changed', tool);
}
