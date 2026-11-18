import { node, connect } from '../nodes.js';
import { pickExample } from '../random.js';
import { GRAPHS } from '../library/graphs.js';

/** Vertices on a circle, edges as bound connectors (arrows when directed). */
export function graph(x, y) {
  const [count, edgeList, directed] = pickExample('graph', GRAPHS);
  const radius = 50 + count * 20;

  const vertices = Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return node('ellipse', x + radius + radius * Math.cos(angle) - 23, y + radius + radius * Math.sin(angle) - 23, 46, 46, 'ABCDEFGHI'[i]);
  });
  const edges = edgeList.split(' ').map((pair) => connect(vertices[+pair[0]], vertices[+pair[1]], directed ? 'arrow' : 'none'));
  return [...vertices, ...edges];
}
