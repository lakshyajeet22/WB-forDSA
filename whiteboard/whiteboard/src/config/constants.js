/** Static configuration shared across the app. */

export const GRID_SIZE = 20;
export const ACCENT = '#6366f1';
export const FONT_STACK = 'system-ui, sans-serif';
export const MAX_HISTORY_STEPS = 100;
export const ERASER_RADIUS_PX = 14; // screen pixels, so the eraser feels the same at any zoom
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

export const STICKY_COLORS = ['#fde68a', '#fbcfe8', '#bbf7d0', '#bfdbfe', '#ddd6fe'];

/** Element types that occupy a rectangle (x, y, w, h). */
export const BOX_TYPES = new Set(['rect', 'ellipse', 'diamond', 'sticky', 'image', 'text']);
/** Box types that show corner resize handles. */
export const RESIZABLE_TYPES = new Set(['rect', 'ellipse', 'diamond', 'sticky', 'image']);

/** Style applied to newly created elements (user can change it from the properties panel). */
export const DEFAULT_STYLE = Object.freeze({
  fill: 'none',
  stroke: 'auto', // 'auto' resolves to a theme-aware colour at draw time
  sw: 2, // stroke width
  dash: 'solid', // 'solid' | 'dashed' | 'dotted'
  op: 1, // opacity
  fs: 18, // font size
  r: 8, // corner radius
  ff: FONT_STACK, // font family
  tc: 'auto', // text colour
  ah: 'arrow', // arrowhead: 'arrow' | 'dot' | 'none'
  al: 'center', // text alignment
});

/** Toolbar definition. `key` is the keyboard shortcut; `icon` is a 24x24 SVG path. */
export const TOOLS = [
  { id: 'select', key: 'v', label: 'Select', icon: 'M4 4l7 17 2.5-7.5L21 11z' },
  { id: 'hand', key: 'h', label: 'Hand (pan)', icon: 'M8 13V5a2 2 0 0 1 4 0v6 M12 11V4a2 2 0 0 1 4 0v8 M16 12V7a2 2 0 0 1 4 0v7a8 8 0 0 1-8 8c-3 0-5-1-6.5-3L3 14a2 2 0 0 1 3-2l2 2' },
  { id: 'rect', key: 'r', label: 'Rectangle', icon: 'M3 5h18v14H3z' },
  { id: 'ellipse', key: 'o', label: 'Circle / ellipse', icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z' },
  { id: 'diamond', key: 'd', label: 'Diamond', icon: 'M12 2l10 10-10 10L2 12z' },
  { id: 'arrow', key: 'a', label: 'Arrow', icon: 'M5 19L19 5 M9 5h10v10' },
  { id: 'line', key: 'l', label: 'Line', icon: 'M5 19L19 5' },
  { id: 'pencil', key: 'p', label: 'Pencil', icon: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' },
  { id: 'text', key: 't', label: 'Text', icon: 'M5 6V4h14v2 M12 4v16 M9 20h6' },
  { id: 'sticky', key: 'n', label: 'Sticky note', icon: 'M4 4h16v10l-6 6H4z M14 20v-6h6' },
  { id: 'image', key: 'i', label: 'Image', icon: 'M3 4h18v16H3z M3 16l5-5 4 4 3-3 6 6 M8.5 8.5h.01' },
  { id: 'eraser', key: 'e', label: 'Eraser', icon: 'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21 M22 21H7 M5 11l9 9' },
  { id: 'connector', key: 'c', label: 'Connector (drag shape → shape)', icon: 'M3 7h6v10h6 M15 14l3 3-3 3' },
];

export const KEY_TO_TOOL = Object.fromEntries(TOOLS.map((t) => [t.key, t.id]));
