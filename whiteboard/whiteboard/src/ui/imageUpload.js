import { $ } from '../core/dom.js';
import { state } from '../core/state.js';
import { on } from '../core/events.js';
import { eventToWorld } from '../core/viewport.js';
import { createElement } from '../core/elementFactory.js';
import { setSelection } from '../core/selection.js';
import { commit } from '../core/history.js';
import { setTool } from '../input/toolManager.js';

const MAX_IMAGE_SIZE = 400; // world units
const input = $('#image-input');

/** The image tool opens a file picker; the chosen image is placed at the centre of the view. */
export function initImageUpload() {
  on('image:pick', () => input.click());

  input.onchange = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, MAX_IMAGE_SIZE / Math.max(img.width, img.height));
        const [w, h] = [img.width * k, img.height * k];
        const [cx, cy] = eventToWorld({ clientX: innerWidth / 2, clientY: innerHeight / 2 });
        const el = createElement('image', cx - w / 2, cy - h / 2, w, h, '', { src: reader.result, sw: 0, fill: 'none' });
        state.board.els.push(el);
        setSelection([el.id]);
        setTool('select');
        commit();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
}
