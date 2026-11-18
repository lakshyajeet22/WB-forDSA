import { node, caption } from '../nodes.js';
import { pickExample } from '../random.js';
import { STACKS } from '../library/stacks.js';
import { QUEUES } from '../library/queues.js';

/** Vertical stack with the top element first. */
export function stack(x, y) {
  const values = [...pickExample('stack', STACKS)].reverse(); // library lists bottom → top
  const cells = values.map((v, i) => node('rect', x, y + i * 46, 120, 46, v, { r: 0 }));
  return [
    ...cells,
    caption(x + 165, y + 14, '← top'),
    caption(x + 60, y + cells.length * 46 + 14, 'bottom'),
  ];
}

/** Horizontal queue, front on the left. */
export function queue(x, y) {
  const values = pickExample('queue', QUEUES);
  return [
    ...values.map((v, i) => node('rect', x + i * 60, y, 60, 50, v, { r: 0 })),
    caption(x + 30, y + 64, 'front'),
    caption(x + (values.length - 1) * 60 + 30, y + 64, 'rear'),
  ];
}
