import { $ } from '../core/dom.js';

const popup = $('#popup');

/** Show a floating menu at screen position (x, y). items: [[label, handler], ...] */
export function showMenu(x, y, items) {
  popup.innerHTML = '';
  items.forEach(([label, handler]) => {
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = label;
    button.onclick = () => {
      popup.style.display = 'none';
      handler();
    };
    popup.append(button);
  });
  popup.style.display = 'block';
  popup.style.left = Math.max(4, Math.min(x, innerWidth - 200)) + 'px';
  popup.style.top = Math.max(4, Math.min(y, innerHeight - popup.offsetHeight - 8)) + 'px';
}

/** Show a menu directly under a button. */
export function showMenuBelow(button, items) {
  const rect = button.getBoundingClientRect();
  showMenu(rect.left, rect.bottom + 6, items);
}

// Close when clicking anywhere else (buttons marked data-menu toggle their own menu).
addEventListener('pointerdown', (e) => {
  if (!popup.contains(e.target) && !e.target.closest('[data-menu]')) popup.style.display = 'none';
}, true);
