import { node, caption, connect } from '../nodes.js';
import { pickExample } from '../random.js';
import { HASH_MAPS } from '../library/hashMaps.js';

const hashKey = (key, buckets) => [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % buckets;

/** Bucket column on the left; colliding keys chain to the right (separate chaining). */
export function hashMap(x, y) {
  const [bucketCount, keys] = pickExample('hash-map', HASH_MAPS);
  const buckets = Array.from({ length: bucketCount }, (_, i) => node('rect', x, y + i * 52, 56, 40, i, { r: 0 }));
  const chains = buckets.map(() => []);
  const els = [...buckets];

  keys.forEach((key) => {
    const i = hashKey(key, bucketCount);
    const chain = chains[i];
    const entry = node('rect', x + 100 + chain.length * 100, y + i * 52 + 3, 80, 34, key, { r: 6 });
    const previous = chain.length ? chain[chain.length - 1] : buckets[i];
    els.push(entry, connect(previous, entry));
    chain.push(entry);
  });
  els.push(caption(x + 120, y - 18, `index = sum(char codes) % ${bucketCount}`));
  return els;
}
