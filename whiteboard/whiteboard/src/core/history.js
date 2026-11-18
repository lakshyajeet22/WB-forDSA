import { state, getEl } from './state.js';
import { saveBoard } from './storage.js';
import { emit } from './events.js';
import { MAX_HISTORY_STEPS } from '../config/constants.js';

/** Undo/redo via JSON snapshots of the element list. */
let snapshots = [];
let index = -1;

export const canUndo = () => index > 0;
export const canRedo = () => index < snapshots.length - 1;

export function resetHistory() {
  snapshots = [JSON.stringify(state.board.els)];
  index = 0;
}

/** Record the current elements as a new undo step, persist, and refresh the UI. */
export function commit() {
  snapshots = snapshots.slice(0, index + 1);
  snapshots.push(JSON.stringify(state.board.els));
  index++;
  if (snapshots.length > MAX_HISTORY_STEPS) {
    snapshots.shift();
    index--;
  }
  saveBoard();
  emit('ui:refresh');
}

function restore() {
  state.board.els = JSON.parse(snapshots[index]);
  state.selection = new Set([...state.selection].filter(getEl));
  saveBoard();
  emit('ui:refresh');
}

export function undo() {
  if (!canUndo()) return;
  index--;
  restore();
}

export function redo() {
  if (!canRedo()) return;
  index++;
  restore();
}
