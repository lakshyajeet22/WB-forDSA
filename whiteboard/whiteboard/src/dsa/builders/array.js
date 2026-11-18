import { node, caption } from '../nodes.js';
import { pickExample } from '../random.js';
import { ARRAYS } from '../library/arrays.js';

/** Indexed array: one box per value with its index underneath. */
export const array = (x, y) =>
  pickExample('array', ARRAYS).flatMap((value, i) => [
    node('rect', x + i * 60, y, 60, 60, value, { r: 0 }),
    caption(x + i * 60 + 30, y + 66, String(i)),
  ]);
