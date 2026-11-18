# Boardly – Infinite Whiteboard

An infinite-canvas whiteboard for teaching and explaining Data Structures & Algorithms.
Vanilla JavaScript (ES modules) + HTML Canvas, bundled with Vite. No runtime dependencies.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle in dist/
```

## Project structure

```
index.html                     App shell (markup only)
src/
├── main.js                    Entry point: wires modules together
├── styles/main.css            Theme tokens, layout, components
├── config/
│   └── constants.js           Grid size, default style, tool list + shortcuts, limits
├── core/                      State and logic (no drawing, no DOM events)
│   ├── state.js               Single source of truth (board, view, tool, selection…)
│   ├── events.js              Tiny pub/sub bus (ui:refresh, view:changed, tool:changed…)
│   ├── dom.js                 $ helper, canvas reference, escapeXml
│   ├── theme.js               Light/dark colour resolution
│   ├── geometry.js            Bounds, connector endpoints, hit-testing
│   ├── selection.js           Selection helpers, resize-handle positions
│   ├── elementFactory.js      Element data model + createElement / createConnector
│   ├── elementOps.js          Move, delete, reorder, group, lock, copy/paste, style changes
│   ├── history.js             Undo / redo (JSON snapshots)
│   ├── viewport.js            World↔screen mapping, zoom, pan, fit-to-content
│   ├── storage.js             localStorage persistence
│   └── boards.js              Multiple boards: open / create / rename
├── render/                    Everything that draws pixels
│   ├── renderer.js            Render loop, dot grid, selection overlay, eraser cursor
│   ├── drawElement.js         Draw one element on any 2D context
│   ├── shapeGeometry.js       Dash patterns, diamond points, arrowheads, smooth pencil path
│   └── textLayout.js          Text measuring, wrapping, placement
├── input/                     User input → state changes
│   ├── pointerController.js   Gestures: pan, move, resize, marquee, create, connect, erase
│   ├── wheelController.js     Wheel / trackpad scroll and pinch-zoom
│   ├── keyboard.js            Shortcuts (ignored while typing in fields)
│   ├── toolManager.js         Active tool + cursor
│   └── textEditor.js          Inline text editing overlay
├── ui/                        DOM panels and menus
│   ├── toolbar.js · topbar.js · propertiesPanel.js · layersPanel.js
│   ├── popupMenu.js · contextMenu.js · dialogs.js (toast / confirm) · imageUpload.js
├── dsa/                       DSA diagram generators
│   ├── presets.js             Menu label → builder (add new diagrams here)
│   ├── insertPreset.js        Places a preset at the centre of the view
│   ├── random.js              Shuffled-bag picker (no immediate repeats)
│   ├── nodes.js · treeLayout.js
│   ├── builders/              array, linkedList (singly/doubly/circular), stackQueue,
│   │                          tree (binary, BST, heap, recursion), graph, hashMap, flowchart
│   └── library/               20–22 curated examples per structure (pure data)
└── export/                    PNG, SVG, PDF, clipboard, download helper
```

## Architecture notes

- **World coordinates.** Elements store world positions; only `state.view` (`x`, `y`, `s`) changes
  when panning or zooming. The canvas is always screen-sized, and only visible elements are drawn.
- **Dependency direction.** `config` ← `core` ← `render` / `input` / `export` / `dsa` ← `ui` ← `main`.
  Low-level modules talk to the UI through `core/events.js`, never by importing it.
- **Repaint.** Mutate `state`, then call `requestRender()` (repaint) or `commit()` (undo step + save + UI refresh).
- **Element model.** Plain JSON, documented in `core/elementFactory.js`. Property names are short
  (`sw`, `op`, `ah`…) because they are stored in saved boards.
- **Examples.** Each structure has a curated library in `dsa/library/`; `pickExample` shuffles it and
  plays through every example before repeating. Trees/heaps are built from insertion order, so they are valid by construction.

## Shortcuts

`V` select · `H` hand · `R` rectangle · `O` ellipse · `D` diamond · `A` arrow · `L` line · `P` pencil ·
`T` text · `N` sticky · `I` image · `E` eraser · `C` connector · `Space+drag` pan · arrows pan (nothing selected) ·
`Ctrl+Z` undo · `Ctrl+Y` / `Ctrl+Shift+Z` redo · `Ctrl+D` duplicate · `Ctrl+C/V` copy/paste · `Ctrl+A` select all ·
`Ctrl+G` / `Ctrl+Shift+G` group / ungroup · `Delete` delete · `Shift+Delete` clear canvas · wheel scrolls, `Ctrl+wheel` zooms.
