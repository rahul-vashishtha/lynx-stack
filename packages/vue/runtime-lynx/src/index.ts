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
import type { App } from 'vue';
import { nodeOps } from './nodeOps.js';
import { patchProp } from './patchProp.js';
import type { LynxElement, LynxNode } from './nodeOps.js';

// Re-export Vue APIs
export * from 'vue';

// Create the custom renderer
// Note: We're ignoring type errors here because Vue's renderer types don't match our Lynx types exactly
// This is a common issue when creating custom renderers for non-DOM environments
// @ts-ignore
const renderer = createRenderer<LynxNode, LynxElement>({
  ...nodeOps,
  patchProp,
});

// Export the createApp function
export const createApp = (...args: Parameters<typeof renderer.createApp>): App<LynxElement> => {
  const app = renderer.createApp(...args);
  
  // Override the mount method to integrate with Lynx
  const originalMount = app.mount;
  app.mount = (rootContainer: string | LynxElement): any => {
    // If rootContainer is a string, try to find the element
    // In a real Lynx environment, this would use Lynx's API to find elements
    const container = typeof rootContainer === 'string'
      ? { tagName: 'div', id: rootContainer } as LynxElement // Mock implementation
      : rootContainer;
    
    if (!container) {
      console.error(`Failed to mount app: container not found`);
      throw new Error(`Failed to mount app: container not found`);
    }
    
    // Call the original mount method
    return originalMount(container);
  };
  
  return app;
};

// Export the renderer
export { renderer }; 
