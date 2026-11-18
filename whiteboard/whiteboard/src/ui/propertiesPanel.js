import { $ } from '../core/dom.js';
import { state, getEl, requestRender } from '../core/state.js';
import { resolveColor } from '../core/theme.js';
import { commit } from '../core/history.js';
import {
  applyStyleProperty, reorderSelection, toggleLockSelection, groupSelection, ungroupSelection,
  duplicateSelection, deleteSelection,
} from '../core/elementOps.js';

/** style property key → input element id */
const PROPERTY_INPUTS = {
  fill: 'prop-fill', stroke: 'prop-stroke', sw: 'prop-sw', dash: 'prop-dash', op: 'prop-op', r: 'prop-r',
  fs: 'prop-fs', ff: 'prop-ff', al: 'prop-al', tc: 'prop-tc', ah: 'prop-ah',
};
const COLOR_PROPS = ['fill', 'stroke', 'tc'];

const ARRANGE_BUTTONS = [
  ['⤒', 'Bring to front', () => reorderSelection('front')],
  ['↑', 'Bring forward', () => reorderSelection('forward')],
  ['↓', 'Send backward', () => reorderSelection('backward')],
  ['⤓', 'Send to back', () => reorderSelection('back')],
  ['Lock', 'Lock / unlock', toggleLockSelection],
  ['Group', 'Group (Ctrl+G)', groupSelection],
  ['Ungroup', 'Ungroup (Ctrl+Shift+G)', ungroupSelection],
  ['Copy', 'Duplicate (Ctrl+D)', duplicateSelection],
  ['Delete', 'Delete', deleteSelection],
];

/** Show the first selected element's style (or the default style when nothing is selected). */
export function refreshPropertiesPanel() {
  const source = state.selection.size ? getEl([...state.selection][0]) : state.style;
  if (!source) return;
  Object.entries(PROPERTY_INPUTS).forEach(([key, id]) => {
    let value = source[key];
    if (COLOR_PROPS.includes(key)) value = value === 'none' ? '#ffffff' : resolveColor(value);
    $('#' + id).value = value;
  });
}

function applyAndCommit(key, value) {
  applyStyleProperty(key, value);
  if (state.selection.size) commit();
}

export function initPropertiesPanel() {
  Object.entries(PROPERTY_INPUTS).forEach(([key, id]) => {
    const input = $('#' + id);
    input.oninput = () => applyStyleProperty(key, input.value); // live preview
    input.onchange = () => state.selection.size && commit(); // one undo step per edit
  });
  $('#btn-no-fill').onclick = () => applyAndCommit('fill', 'none');
  $('#btn-auto-stroke').onclick = () => applyAndCommit('stroke', 'auto');

  ARRANGE_BUTTONS.forEach(([label, title, handler]) => {
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = label;
    button.title = title;
    button.onclick = handler;
    $('#arrange-buttons').append(button);
  });
}
