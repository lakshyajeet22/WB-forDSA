import { node, caption } from '../nodes.js';
import { layoutTree } from '../treeLayout.js';
import { pickExample } from '../random.js';
import { BINARY_TREES, BST_INSERTIONS, RECURSION_TREES } from '../library/trees.js';
import { HEAP_INSERTIONS } from '../library/heaps.js';

const CIRCLE_NODES = { type: 'ellipse', dx: 56, dy: 70, w: 44, h: 44, arrowhead: 'none' };

/** Level-order array (0 = missing) → linked node objects. */
function treeFromLevelOrder(values) {
  const root = { v: values[0] };
  const queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const current = queue.shift();
    if (values[i]) {
      current.l = { v: values[i] };
      queue.push(current.l);
    }
    i++;
    if (i < values.length && values[i]) {
      current.r = { v: values[i] };
      queue.push(current.r);
    }
    i++;
  }
  return root;
}

export const binaryTree = (x, y) =>
  layoutTree(treeFromLevelOrder(pickExample('binary-tree', BINARY_TREES)), x, y, CIRCLE_NODES);

export function binarySearchTree(x, y) {
  const insertions = pickExample('bst', BST_INSERTIONS);
  let root;
  const insert = (n, value) => {
    const side = value < n.v ? 'l' : 'r';
    if (n[side]) insert(n[side], value);
    else n[side] = { v: value };
  };
  insertions.forEach((value) => (root ? insert(root, value) : (root = { v: value })));
  return [...layoutTree(root, x, y + 26, CIRCLE_NODES), caption(x + 40, y, 'Binary Search Tree')];
}

/** Build a heap array by repeated insertion with sift-up. */
function buildHeap(values, isMin) {
  const heap = [];
  values.forEach((value) => {
    heap.push(value);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      const ordered = isMin ? heap[parent] <= heap[i] : heap[parent] >= heap[i];
      if (ordered) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  });
  return heap;
}

/** Heap drawn as a tree with its array representation underneath. */
export function heap(x, y) {
  const values = pickExample('heap', HEAP_INSERTIONS);
  const isMin = values.reduce((a, b) => a + b) % 2 === 0;
  const array = buildHeap(values, isMin);

  const nodes = array.map((v) => ({ v }));
  nodes.forEach((n, i) => {
    n.l = nodes[2 * i + 1];
    n.r = nodes[2 * i + 2];
  });

  const depth = Math.floor(Math.log2(array.length));
  const arrayTop = y + 26 + depth * 70 + 90;
  return [
    ...layoutTree(nodes[0], x, y + 26, { ...CIRCLE_NODES, dx: 60, w: 46, h: 46 }),
    caption(x + 40, y, isMin ? 'Min-Heap' : 'Max-Heap'),
    ...array.flatMap((v, i) => [
      node('rect', x + i * 54, arrayTop, 54, 40, v, { r: 0 }),
      caption(x + i * 54 + 27, arrayTop + 46, String(i)),
    ]),
  ];
}

/** Call tree of a recursive function (fib, factorial, sum, merge-sort splits). */
export function recursionTree(x, y) {
  const [kind, n] = pickExample('recursion', RECURSION_TREES);
  const build = (k) => {
    if (kind === 'fib') return { v: `fib(${k})`, l: k > 1 && build(k - 1), r: k > 1 && build(k - 2) };
    if (kind === 'ms') return { v: `size ${k}`, l: k > 1 && build(k >> 1), r: k > 1 && build(k - (k >> 1)) };
    return { v: `${kind}(${k})`, m: k > 1 && build(k - 1) };
  };
  return layoutTree(build(n), x, y, {
    type: 'rect', dx: 92, dy: 70, w: 76, h: 36, style: { r: 18 }, arrowhead: 'arrow',
  });
}
