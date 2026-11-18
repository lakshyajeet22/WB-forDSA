import { state } from './state.js';

/** Boards are stored in localStorage: an index of {id, title} plus one record per board. */
const INDEX_KEY = 'wb:idx';
const LAST_KEY = 'wb:last';
const boardKey = (id) => 'wb:' + id;

let boardIndex = [];

const safely = (fn, fallback) => {
  try {
    return fn();
  } catch (err) {
    console.warn('[storage]', err);
    return fallback;
  }
};

export const listBoards = () => boardIndex;

export function loadIndex() {
  boardIndex = safely(() => JSON.parse(localStorage.getItem(INDEX_KEY) || '[]'), []);
  return boardIndex;
}

export const getLastBoardId = () => safely(() => localStorage.getItem(LAST_KEY), null);
export const setLastBoardId = (id) => safely(() => localStorage.setItem(LAST_KEY, id));

export function readBoard(id) {
  return safely(() => JSON.parse(localStorage.getItem(boardKey(id)) || '{}'), {});
}

export function registerBoard(id, title) {
  boardIndex.push({ id, title });
  safely(() => localStorage.setItem(boardKey(id), JSON.stringify({ title, els: [] })));
}

/** Persist the active board (called after every committed change). */
export function saveBoard() {
  const { id, title, els } = state.board;
  safely(() => {
    localStorage.setItem(boardKey(id), JSON.stringify({ title, els }));
    const entry = boardIndex.find((b) => b.id === id);
    if (entry) entry.title = title;
    localStorage.setItem(INDEX_KEY, JSON.stringify(boardIndex));
  });
}
