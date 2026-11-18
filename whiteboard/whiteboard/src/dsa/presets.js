import { startEnd, process, decision } from './builders/flowchart.js';
import { array } from './builders/array.js';
import { singlyLinkedList, doublyLinkedList, circularLinkedList } from './builders/linkedList.js';
import { stack, queue } from './builders/stackQueue.js';
import { binaryTree, binarySearchTree, heap, recursionTree } from './builders/tree.js';
import { graph } from './builders/graph.js';
import { hashMap } from './builders/hashMap.js';

/** Menu label → builder(x, y) returning the elements to insert. Add new diagrams here. */
export const PRESETS = {
  'Start / End': startEnd,
  'Process': process,
  'Decision': decision,
  'Array': array,
  'Singly linked list': singlyLinkedList,
  'Doubly linked list': doublyLinkedList,
  'Circular linked list': circularLinkedList,
  'Stack': stack,
  'Queue': queue,
  'Binary tree': binaryTree,
  'BST': binarySearchTree,
  'Heap': heap,
  'Graph': graph,
  'Hash map': hashMap,
  'Recursion tree': recursionTree,
};
