import { node } from '../nodes.js';

export const startEnd = (x, y) => [node('rect', x, y, 140, 50, 'Start', { r: 25 })];
export const process = (x, y) => [node('rect', x, y, 140, 60, 'Process', { r: 6 })];
export const decision = (x, y) => [node('diamond', x, y, 160, 100, 'Yes / No?')];
