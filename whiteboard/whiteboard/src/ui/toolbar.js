import { $ } from '../core/dom.js';
import { on } from '../core/events.js';
import { state } from '../core/state.js';
import { setTool } from '../input/toolManager.js';
import { TOOLS } from '../config/constants.js';

/** Build the left toolbar and keep the active tool highlighted. */
export function initToolbar() {
  const toolbar = $('#toolbar');
  TOOLS.forEach((tool) => {
    const button = document.createElement('button');
    button.className = 'btn';
    button.dataset.tool = tool.id;
    button.title = `${tool.label} (${tool.key.toUpperCase()})`;
    button.innerHTML = `<svg viewBox="0 0 24 24"><path d="${tool.icon}"/></svg>`;
    button.onclick = () => setTool(tool.id);
    toolbar.append(button);
  });

  const highlight = () =>
    toolbar.querySelectorAll('.btn').forEach((b) => b.classList.toggle('active', b.dataset.tool === state.tool));
  on('tool:changed', highlight);
  highlight();
}
