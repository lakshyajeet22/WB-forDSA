import { $ } from '../core/dom.js';
import { state, requestRender } from '../core/state.js';
import { on } from '../core/events.js';
import { undo, redo, canUndo, canRedo } from '../core/history.js';
import { zoomAtCenter, resetZoom, fitView } from '../core/viewport.js';
import { toggleTheme } from '../core/theme.js';
import { listBoards, openBoard, createBoard, renameBoard } from '../core/boards.js';
import { PRESETS } from '../dsa/presets.js';
import { insertPreset } from '../dsa/insertPreset.js';
import { exportPng, copyImageToClipboard } from '../export/raster.js';
import { exportSvg } from '../export/svg.js';
import { exportPdf } from '../export/pdf.js';
import { downloadBlob } from '../export/download.js';
import { showMenuBelow } from './popupMenu.js';
import { confirmClearCanvas } from './dialogs.js';

const checked = (on, label) => (on ? '✓ ' : '   ') + label;

function settingsMenu() {
  const s = state.settings;
  return [
    [checked(s.snap, 'Snap to grid'), () => (s.snap = !s.snap)],
    [checked(s.grid, 'Show grid'), () => { s.grid = !s.grid; requestRender(); }],
    [checked(s.wheelZoom, 'Mouse wheel zooms (off: scrolls)'), () => (s.wheelZoom = !s.wheelZoom)],
    ['Clear canvas… (Shift+Del)', confirmClearCanvas],
  ];
}

const boardsMenu = () => [
  ...listBoards().map((b) => [(b.id === state.board.id ? '✓ ' : '   ') + b.title, () => openBoard(b.id)]),
  ['＋ New board', createBoard],
];

const shareBoardFile = () =>
  downloadBlob(
    new Blob([JSON.stringify({ title: state.board.title, els: state.board.els })], { type: 'application/json' }),
    state.board.title + '.board.json',
  );

export function initTopbar() {
  const title = $('#board-title');
  title.oninput = () => renameBoard(title.value);
  on('board:opened', (board) => (title.value = board.title));

  $('#btn-undo').onclick = undo;
  $('#btn-redo').onclick = redo;
  on('ui:refresh', () => {
    $('#btn-undo').disabled = !canUndo();
    $('#btn-redo').disabled = !canRedo();
  });

  $('#btn-zoom-in').onclick = () => zoomAtCenter(1.25);
  $('#btn-zoom-out').onclick = () => zoomAtCenter(0.8);
  $('#zoom-label').onclick = resetZoom;
  $('#btn-fit').onclick = fitView;
  on('view:changed', () => ($('#zoom-label').textContent = Math.round(state.view.s * 100) + '%'));

  $('#btn-boards').onclick = (e) => showMenuBelow(e.currentTarget, boardsMenu());
  $('#btn-dsa').onclick = (e) =>
    showMenuBelow(e.currentTarget, Object.keys(PRESETS).map((name) => [name, () => insertPreset(name)]));
  $('#btn-export').onclick = (e) =>
    showMenuBelow(e.currentTarget, [
      ['Export PNG', exportPng], ['Export SVG', exportSvg], ['Export PDF', exportPdf], ['Copy as image', copyImageToClipboard],
    ]);
  $('#btn-share').onclick = shareBoardFile;
  $('#btn-settings').onclick = (e) => showMenuBelow(e.currentTarget, settingsMenu());
  $('#btn-theme').onclick = toggleTheme;
  $('#btn-panels').onclick = () => $('#sidebar').classList.toggle('open');
}
