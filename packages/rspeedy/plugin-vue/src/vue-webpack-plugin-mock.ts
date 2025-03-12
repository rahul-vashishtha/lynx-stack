// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Mock implementation of Vue webpack plugin for build purposes
 */

// Define the layers enum
export const LAYERS = {
  MAIN_THREAD: 'main-thread',
  BACKGROUND: 'background',
};

// Define a mock Vue webpack plugin
export class VueWebpackPlugin {
  constructor(options: any) {
    console.warn('Using mock VueWebpackPlugin. For full functionality, please install @lynx-js/vue-webpack-plugin');
    this.options = options;
  }

  options: any;

  apply(compiler: any) {
    // Minimal implementation to allow the build to succeed
    console.warn('Mock VueWebpackPlugin applied');
  }
}
