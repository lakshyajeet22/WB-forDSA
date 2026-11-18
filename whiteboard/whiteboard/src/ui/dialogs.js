import { clearCanvas } from '../core/elementOps.js';
import { state } from '../core/state.js';

/** In-page replacements for alert()/confirm(), which are blocked in sandboxed frames. */
export function toast(message) {
  const el = document.createElement('div');
  el.className = 'floating toast';
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 2500);
}

export function confirmClearCanvas() {
  if (!state.board.els.length) return toast('The canvas is already empty.');

  const dialog = document.createElement('div');
  dialog.className = 'floating dialog';
  dialog.innerHTML = `
    <b>Clear the whole canvas?</b>
    <p>You can undo this afterwards.</p>
    <div class="dialog-actions">
      <button class="btn" data-action="cancel">Cancel</button>
      <button class="btn active" data-action="confirm">Clear</button>
    </div>`;
  document.body.append(dialog);

  dialog.querySelector('[data-action="cancel"]').onclick = () => dialog.remove();
  const confirmButton = dialog.querySelector('[data-action="confirm"]');
  confirmButton.onclick = () => {
    dialog.remove();
    clearCanvas();
  };
  confirmButton.focus();
}
