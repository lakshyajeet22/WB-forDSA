import { state } from '../core/state.js';
import { downloadBlob } from './download.js';
import { renderBoardToCanvas } from './raster.js';

/**
 * Minimal single-page PDF writer: embeds the rendered board as a JPEG.
 * Object layout: 1 catalog, 2 pages, 3 page, 4 image, 5 content stream.
 */
export function exportPdf() {
  const canvas = renderBoardToCanvas(1.5);
  if (!canvas) return;
  const { width, height } = canvas;
  const jpeg = atob(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]); // binary string

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  const addObject = (body) => {
    offsets.push(pdf.length);
    pdf += body;
  };

  const content = `q ${width} 0 0 ${height} 0 0 cm /I Do Q`;
  addObject('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n');
  addObject('2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n');
  addObject(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${width} ${height}]/Resources<</XObject<</I 4 0 R>>>>/Contents 5 0 R>>endobj\n`);
  addObject(`4 0 obj<</Type/XObject/Subtype/Image/Width ${width}/Height ${height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpeg.length}>>stream\n${jpeg}\nendstream endobj\n`);
  addObject(`5 0 obj<</Length ${content.length}>>stream\n${content}\nendstream endobj\n`);

  const xrefOffset = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  pdf += offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += `trailer<</Size 6/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = Uint8Array.from(pdf, (c) => c.charCodeAt(0));
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), state.board.title + '.pdf');
}
