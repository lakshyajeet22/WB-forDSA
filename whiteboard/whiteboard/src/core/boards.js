import { state } from './state.js';
import { newId } from './elementFactory.js';
import { resetHistory } from './history.js';
import { fitView } from './viewport.js';
import { emit } from './events.js';
import { clearSelection } from './selection.js';
import {
  loadIndex, listBoards, readBoard, registerBoard, saveBoard, getLastBoardId, setLastBoardId,
} from './storage.js';

const DEFAULT_TITLE = 'Untitled board';

export function openBoard(id) {
  const data = readBoard(id);
  state.board = { id, title: data.title || DEFAULT_TITLE, els: data.els || [] };
  clearSelection();
  resetHistory();
  setLastBoardId(id);
  fitView();
  emit('ui:refresh');
  emit('board:opened', state.board);
}

export function createBoard() {
  const id = newId();
  registerBoard(id, DEFAULT_TITLE);
  openBoard(id);
  saveBoard();
}

export function renameBoard(title) {
  state.board.title = title || DEFAULT_TITLE;
  saveBoard();
}

/** Open the last used board, or create the first one. */
export function initBoards() {
  const boards = loadIndex();
  if (!boards.length) return createBoard();
  const last = boards.find((b) => b.id === getLastBoardId());
  openBoard((last || boards[0]).id);
}

export { listBoards };
