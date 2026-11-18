/** 20 hash-map examples: [bucket count, keys]. Keys hash by (sum of char codes) % buckets, so collisions chain. */
export const HASH_MAPS = [
  [5, ['cat', 'dog', 'bird', 'fish']], [7, ['apple', 'banana', 'cherry', 'date', 'fig']],
  [4, ['a', 'b', 'c', 'd', 'e']], [5, ['red', 'green', 'blue', 'pink']],
  [6, ['one', 'two', 'three', 'four', 'five']], [7, ['mon', 'tue', 'wed', 'thu', 'fri']],
  [5, ['x', 'y', 'z', 'xy']], [8, ['java', 'c', 'go', 'rust', 'python']], [5, ['sun', 'moon', 'star']],
  [6, ['ann', 'bob', 'cy', 'dee', 'eve', 'fay']], [7, ['uno', 'dos', 'tres', 'four']],
  [4, ['A1', 'B2', 'C3', 'D4']], [5, ['tea', 'coffee', 'milk', 'juice']],
  [6, ['car', 'bus', 'bike', 'train', 'boat']], [7, ['jan', 'feb', 'mar', 'apr', 'may', 'jun']],
  [5, ['ab', 'ba', 'cd', 'dc']], [8, ['north', 'south', 'east', 'west']],
  [6, ['pen', 'ink', 'pad', 'cap', 'map']], [5, ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']],
  [7, ['lion', 'tiger', 'bear', 'wolf', 'fox']],
];
