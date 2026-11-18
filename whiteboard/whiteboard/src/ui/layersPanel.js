import { $, escapeXml } from '../core/dom.js';
import { state } from '../core/state.js';
import { setSelection } from '../core/selection.js';
import { emit } from '../core/events.js';

/** List of all elements, topmost first. Click to select (Shift to add). */
export function refreshLayersPanel() {
  const list = $('#layers-list');
  list.innerHTML = '';

  [...state.board.els].reverse().forEach((el) => {
    const row = document.createElement('div');
    row.className = 'layer' + (state.selection.has(el.id) ? ' selected' : '');
    const label = el.type + (el.text ? ' · ' + escapeXml(el.text.slice(0, 16)) : '');
    row.innerHTML = `<span class="layer-name">${label}</span><span>${el.locked ? '🔒' : ''}</span>`;
    row.onclick = (ev) => {
      if (ev.shiftKey) state.selection.add(el.id);
      else setSelection([el.id]);
      emit('ui:refresh');
    };
    list.append(row);
  });
}
