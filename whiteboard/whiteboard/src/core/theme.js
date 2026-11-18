import { state, requestRender } from './state.js';
import { emit } from './events.js';

/** Resolve the special 'auto' colour to something readable on the current theme. */
export const resolveColor = (color) =>
  color === 'auto' ? (state.settings.dark ? '#e5e7eb' : '#1f2937') : color;

export const canvasBackground = () => (state.settings.dark ? '#14161a' : '#ffffff');

export function applyTheme() {
  document.documentElement.dataset.theme = state.settings.dark ? 'dark' : 'light';
  requestRender();
}

export function toggleTheme() {
  state.settings.dark = !state.settings.dark;
  applyTheme();
  emit('ui:refresh');
}
