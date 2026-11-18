import { node, connect } from './nodes.js';

/**
 * Lay out a tree of { v, l, r, m } nodes (left, right, middle child) and return its elements.
 * Leaves get consecutive columns; a parent sits above the average of its children.
 * An only-child is offset half a column so left/right placement stays visible.
 *
 * @param opts { type, dx, dy, w, h, style, arrowhead } – node shape, spacing, size
 */
export function layoutTree(root, x, y, opts) {
  let nextColumn = 0;
  const nodes = [];

  (function place(n, depth) {
    const children = [n.l, n.m, n.r].filter(Boolean);
    children.forEach((child) => place(child, depth + 1));
    n.depth = depth;
    if (!children.length) n.col = nextColumn++;
    else if (n.l && n.r) n.col = (n.l.col + n.r.col) / 2;
    else if (n.l) n.col = n.l.col + 0.5;
    else if (n.r) n.col = n.r.col - 0.5;
    else n.col = n.m.col;
    nodes.push(n);
  })(root, 0);

  nodes.forEach((n) => {
    n.el = node(opts.type, x + n.col * opts.dx, y + n.depth * opts.dy, opts.w, opts.h, n.v, opts.style || {});
  });
  const edges = [];
  nodes.forEach((n) =>
    [n.l, n.m, n.r].filter(Boolean).forEach((child) => edges.push(connect(n.el, child.el, opts.arrowhead))),
  );
  return [...nodes.map((n) => n.el), ...edges];
}
