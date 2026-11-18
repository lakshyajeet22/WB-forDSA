import { state } from '../core/state.js';
import { canvas } from '../core/dom.js';
import { panBy, zoomAt } from '../core/viewport.js';

/**
 * Wheel / trackpad:
 *   scroll          → pan (Shift+wheel pans horizontally)
 *   Ctrl/Cmd+wheel  → zoom at cursor (also pinch on trackpads)
 * "Mouse wheel zooms" in Settings flips plain scrolling to zoom.
 */
export function attachWheelInput() {
  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const unit = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? innerHeight : 1;
    const dx = ev.deltaX * unit;
    const dy = ev.deltaY * unit;

    if (ev.ctrlKey || ev.metaKey || state.settings.wheelZoom) {
      zoomAt(ev.clientX, ev.clientY, Math.exp(-dy * (ev.ctrlKey ? 0.01 : 0.0015)));
    } else {
      const horizontal = ev.shiftKey && !dx;
      panBy(horizontal ? -dy : -dx, horizontal ? 0 : -dy);
    }
  }, { passive: false });
}
