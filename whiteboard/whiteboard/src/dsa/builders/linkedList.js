import { node, connect } from '../nodes.js';
import { pickExample } from '../random.js';
import { LINKED_LISTS } from '../library/linkedLists.js';

const NODE_W = 70;
const NODE_H = 44;
const nullBox = (x, y) => node('rect', x, y, NODE_W, NODE_H, 'null', { r: 6, dash: 'dashed' });

/** Singly: node → node → … → null */
function buildSingly(values, x, y, spacing) {
  const nodes = values.map((v, i) => node('rect', x + i * spacing, y, NODE_W, NODE_H, v, { r: 6 }));
  const end = nullBox(x + values.length * spacing, y);
  const chain = [...nodes, end];
  return [...chain, ...nodes.map((n, i) => connect(n, chain[i + 1]))];
}

/** Doubly: next + prev links (the overlapping arrows read as one double-headed arrow) between null ends. */
function buildDoubly(values, x, y, spacing) {
  const els = buildSingly(values, x, y, spacing);
  const nodes = els.filter((e) => e.type === 'rect' && e.text !== 'null');
  const backLinks = nodes.slice(1).map((n, i) => connect(n, nodes[i]));
  const headNull = nullBox(x - spacing, y);
  return [...els, ...backLinks, headNull, connect(nodes[0], headNull)];
}

/** Circular: the tail loops back to `loopTo` using two invisible anchor points below the nodes. */
function buildCircular(values, loopTo, x, y, spacing) {
  const nodes = values.map((v, i) => node('rect', x + i * spacing, y, NODE_W, NODE_H, v, { r: 6 }));
  const last = nodes.length - 1;
  const links = nodes.slice(0, last).map((n, i) => connect(n, nodes[i + 1]));
  const anchor = (i) => node('rect', x + i * spacing + NODE_W / 2 - 1, y + 90, 2, 2, '', { sw: 0 });
  const [fromAnchor, toAnchor] = [anchor(last), anchor(loopTo)];
  return [
    ...nodes, ...links, fromAnchor, toAnchor,
    connect(nodes[last], fromAnchor, 'none'),
    connect(fromAnchor, toAnchor, 'none'),
    connect(toAnchor, nodes[loopTo]),
  ];
}

export const singlyLinkedList = (x, y) => {
  const [values] = pickExample('ll-singly', LINKED_LISTS);
  return buildSingly(values, x, y, 105);
};
export const doublyLinkedList = (x, y) => {
  const [values] = pickExample('ll-doubly', LINKED_LISTS);
  return buildDoubly(values, x, y, 130);
};
export const circularLinkedList = (x, y) => {
  const [values, loopTo] = pickExample('ll-circular', LINKED_LISTS);
  return buildCircular(values, loopTo, x, y, 105);
};
