import './styles/main.css';

import { requestRender } from './core/state.js';
import { on } from './core/events.js';
import { applyTheme } from './core/theme.js';
import { initBoards } from './core/boards.js';
import { startRenderLoop } from './render/renderer.js';

import { attachPointerInput } from './input/pointerController.js';
import { attachWheelInput } from './input/wheelController.js';
import { attachKeyboard } from './input/keyboard.js';
import { setTool } from './input/toolManager.js';

import { initToolbar } from './ui/toolbar.js';
import { initTopbar } from './ui/topbar.js';
import { initPropertiesPanel, refreshPropertiesPanel } from './ui/propertiesPanel.js';
import { refreshLayersPanel } from './ui/layersPanel.js';
import { initContextMenu } from './ui/contextMenu.js';
import { initImageUpload } from './ui/imageUpload.js';

/** Anything that changes elements or selection fires 'ui:refresh'; repaint and sync the panels. */
on('ui:refresh', () => {
  requestRender();
  refreshPropertiesPanel();
  refreshLayersPanel();
});

applyTheme();
initToolbar();
initTopbar();
initPropertiesPanel();
initContextMenu();
initImageUpload();

attachPointerInput();
attachWheelInput();
attachKeyboard();

setTool('select');
startRenderLoop();
initBoards(); // loads (or creates) a board, which triggers the first UI refresh
