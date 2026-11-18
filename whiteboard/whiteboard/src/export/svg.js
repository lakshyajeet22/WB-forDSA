import { state } from '../core/state.js';
import { escapeXml } from '../core/dom.js';
import { resolveColor, canvasBackground } from '../core/theme.js';
import { contentBounds, endpoints, isLinear } from '../core/geometry.js';
import { layoutText } from '../render/textLayout.js';
import { dashPattern, diamondPoints, arrowheadShape, isDot, smoothPathData } from '../render/shapeGeometry.js';
import { toast } from '../ui/dialogs.js';
import { downloadBlob } from './download.js';

const EXPORT_PADDING = 40;

function elementToSvg(e) {
  const stroke = resolveColor(e.stroke);
  const fill = e.fill === 'none' ? 'none' : resolveColor(e.fill);
  const attrs = (fillValue) =>
    `fill="${fillValue}" stroke="${e.sw ? stroke : 'none'}" stroke-width="${e.sw}" ` +
    `stroke-dasharray="${dashPattern(e).join(' ')}" opacity="${e.op}" stroke-linecap="round" stroke-linejoin="round"`;

  let out = '';
  switch (e.type) {
    case 'rect':
    case 'sticky':
      out = `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${Math.min(e.r, e.w / 2, e.h / 2)}" ${attrs(fill)}/>`;
      break;
    case 'ellipse':
      out = `<ellipse cx="${e.x + e.w / 2}" cy="${e.y + e.h / 2}" rx="${e.w / 2}" ry="${e.h / 2}" ${attrs(fill)}/>`;
      break;
    case 'diamond':
      out = `<polygon points="${diamondPoints(e).join(' ')}" ${attrs(fill)}/>`;
      break;
    case 'pencil':
      out = `<path d="${smoothPathData(e.pts)}" ${attrs('none')}/>`;
      break;
    case 'image':
      out = `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" href="${e.src}" opacity="${e.op}"/>`;
      break;
    default:
      if (isLinear(e)) out = linearToSvg(e, stroke, attrs('none'));
  }

  if (e.text && !isLinear(e) && !e.pts) {
    layoutText(e).forEach((line) => {
      out += `<text x="${line.x}" y="${line.y}" dominant-baseline="hanging" font-size="${e.fs}" ` +
        `font-family="${escapeXml(e.ff)}" fill="${resolveColor(e.tc)}" opacity="${e.op}" xml:space="preserve">` +
        `${escapeXml(line.text)}</text>`;
    });
  }
  return out;
}

function linearToSvg(e, stroke, attrs) {
  const [x1, y1, x2, y2] = endpoints(e);
  let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
  const head = arrowheadShape(e, x1, y1, x2, y2);
  if (!head) return out;
  out += isDot(head)
    ? `<circle cx="${head[0]}" cy="${head[1]}" r="${head[2]}" fill="${stroke}" opacity="${e.op}"/>`
    : `<polygon points="${head.join(' ')}" fill="${stroke}" opacity="${e.op}"/>`;
  return out;
}

export function boardToSvg() {
  const box = contentBounds();
  if (!box) {
    toast('The canvas is empty.');
    return null;
  }
  const p = EXPORT_PADDING;
  const [x, y, w, h] = [box.x - p, box.y - p, box.w + 2 * p, box.h + 2 * p];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${canvasBackground()}"/>` +
    state.board.els.map(elementToSvg).join('') +
    '</svg>'
  );
}

export function exportSvg() {
  const svg = boardToSvg();
  if (svg) downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), state.board.title + '.svg');
}
