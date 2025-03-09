// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, it, expect } from 'vitest';
import { VueWebpackPlugin } from '../src/VueWebpackPlugin.js';
import { LAYERS } from '../src/layer.js';

describe('VueWebpackPlugin', () => {
  it('should have the correct loaders', () => {
    expect(VueWebpackPlugin.loaders.BACKGROUND).toContain('background.js');
    expect(VueWebpackPlugin.loaders.MAIN_THREAD).toContain('main-thread.js');
  });

  it('should have the correct default options', () => {
    expect(VueWebpackPlugin.defaultOptions.disableCompatibilityWarnings).toBe(false);
    expect(VueWebpackPlugin.defaultOptions.firstScreenSyncTiming).toBe('immediately');
    expect(VueWebpackPlugin.defaultOptions.mainThreadChunks).toEqual([]);
    expect(VueWebpackPlugin.defaultOptions.splitTemplate).toBe(false);
    expect(VueWebpackPlugin.defaultOptions.templateInMainThread).toBe(false);
    expect(VueWebpackPlugin.defaultOptions.scriptInBackground).toBe(false);
    expect(VueWebpackPlugin.defaultOptions.styleToLayer).toBe(LAYERS.MAIN_THREAD);
    expect(VueWebpackPlugin.defaultOptions.templateToLayer).toBe(LAYERS.MAIN_THREAD);
    expect(VueWebpackPlugin.defaultOptions.scriptToLayer).toBe(LAYERS.BACKGROUND);
    expect(VueWebpackPlugin.defaultOptions.hotReload).toBe(false);
    expect(VueWebpackPlugin.defaultOptions.optimizeSSR).toBe(false);
  });
}); 
