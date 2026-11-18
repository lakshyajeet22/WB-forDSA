/**
 * Pick examples from a library without immediate repeats: each library is shuffled
 * and played through completely before reshuffling (and the first pick of a new
 * round is never the last pick of the previous one).
 */
const bags = {};
const lastPicked = {};

export function pickExample(key, library) {
  let bag = bags[key];
  if (!bag || !bag.length) {
    bag = bags[key] = library.map((_, i) => i).sort(() => Math.random() - 0.5);
    const end = bag.length - 1;
    if (library.length > 1 && bag[end] === lastPicked[key]) [bag[0], bag[end]] = [bag[end], bag[0]];
  }
  const index = bag.pop();
  lastPicked[key] = index;
  return library[index];
}
