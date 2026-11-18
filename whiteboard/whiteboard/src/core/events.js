/**
 * Minimal publish/subscribe bus. Lets low-level modules (history, tools)
 * notify the UI without importing it, which keeps the dependency graph acyclic.
 *
 * Events:
 *   ui:refresh    – elements/selection changed; refresh panels and re-render
 *   view:changed  – zoom or pan changed
 *   tool:changed  – active tool changed (payload: tool id)
 *   image:pick    – the image tool wants the file picker opened
 */
const listeners = {};

export function on(event, handler) {
  (listeners[event] ||= []).push(handler);
}

export function emit(event, payload) {
  (listeners[event] || []).forEach((handler) => handler(payload));
}
