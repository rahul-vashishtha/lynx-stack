// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Vue 3 runtime for Lynx
 * 
 * This package provides a custom Vue 3 renderer for Lynx, allowing Vue components
 * to be rendered using Lynx's Element PAPI.
 */

import { createRenderer } from 'vue';
import { nodeOps } from './nodeOps.js';
import { patchProp } from './patchProp.js';

// Re-export Vue APIs
export * from 'vue';

// Create the custom renderer
const renderer = createRenderer({
  ...nodeOps,
  patchProp,
});

// Export the createApp function
export const createApp = (...args: Parameters<typeof renderer.createApp>) => {
  const app = renderer.createApp(...args);
  
  // Override the mount method to integrate with Lynx
  const originalMount = app.mount;
  app.mount = (rootContainer) => {
    // If rootContainer is a string, find the element
    const container = typeof rootContainer === 'string'
      ? document.querySelector(rootContainer)
      : rootContainer;
    
    if (!container) {
      console.error(`Failed to mount app: container ${rootContainer} not found`);
      return null;
    }
    
    // Call the original mount method
    return originalMount(container);
  };
  
  return app;
};

// Export the renderer
export { renderer }; 
