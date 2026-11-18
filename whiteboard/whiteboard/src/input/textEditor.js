import { state, requestRender } from '../core/state.js';
import { $ } from '../core/dom.js';
import { resolveColor } from '../core/theme.js';
import { commit } from '../core/history.js';
import { fitTextElement } from '../render/textLayout.js';

const textarea = $('#text-editor');

/** Open the inline editor over an element (works for free text, shapes and sticky notes). */
export function beginTextEdit(el) {
  state.editingId = el.id;
  requestRender();

  const { view } = state;
  const isFreeText = el.type === 'text';
  Object.assign(textarea.style, {
    display: 'block',
    left: view.x + el.x * view.s + 'px',
    top: view.y + el.y * view.s + 'px',
    width: (isFreeText ? Math.max(220, el.w * view.s) : el.w * view.s) + 'px',
    height: (isFreeText ? el.fs * 1.4 * view.s * 2 : el.h * view.s) + 'px',
    font: `${el.fs * view.s}px ${el.ff}`,
    color: resolveColor(el.tc),
    textAlign: el.al,
    padding: (isFreeText ? 0 : 8 * view.s) + 'px',
    lineHeight: '1.3',
  });
  textarea.value = el.text;
  textarea.focus();
  textarea.onblur = () => finishTextEdit(el);
}

/** Leaving the editor (click away, Esc) commits the text; empty free-text is discarded. */
function finishTextEdit(el) {
  if (state.editingId !== el.id) return;
  state.editingId = null;
  textarea.style.display = 'none';
  el.text = textarea.value;

  if (el.type === 'text') {
    if (!el.text.trim()) {
      state.board.els = state.board.els.filter((o) => o !== el);
      state.selection.delete(el.id);
    } else {
      fitTextElement(el);
    }
  }
  commit();
}

export const endTextEdit = () => textarea.blur();

textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') textarea.blur();
  e.stopPropagation(); // typing must never trigger tool shortcuts
});
