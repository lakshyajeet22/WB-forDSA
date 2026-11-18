import { state } from '../core/state.js';
import { contentBounds } from '../core/geometry.js';
import { canvasBackground } from '../core/theme.js';
import { drawElement } from '../render/drawElement.js';
import { toast } from '../ui/dialogs.js';
import { downloadBlob } from './download.js';

const EXPORT_PADDING = 40;

/** Render every element (regardless of the current view) to an offscreen canvas. */
export function renderBoardToCanvas(scale) {
  const box = contentBounds();
  if (!box) {
    toast('The canvas is empty.');
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((box.w + 2 * EXPORT_PADDING) * scale);
  canvas.height = Math.ceil((box.h + 2 * EXPORT_PADDING) * scale);

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = canvasBackground();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(EXPORT_PADDING - box.x, EXPORT_PADDING - box.y);
  state.board.els.forEach((e) => drawElement(ctx, e));
  return canvas;
}

export const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export async function exportPng() {
  const canvas = renderBoardToCanvas(2);
  if (canvas) downloadBlob(await canvasToBlob(canvas, 'image/png'), state.board.title + '.png');
}

export async function copyImageToClipboard() {
  const canvas = renderBoardToCanvas(2);
  if (!canvas) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': await canvasToBlob(canvas, 'image/png') })]);
    toast('Copied to clipboard.');
  } catch {
    toast('Clipboard image copy is not available here; use Export PNG.');
  }
}
