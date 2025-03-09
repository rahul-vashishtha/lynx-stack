// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { RsbuildPluginAPI } from '@rsbuild/core'
import type { PluginVueLynxOptions } from './pluginVueLynx.js'

/**
 * Apply lazy loading configuration for Vue components
 */
export function applyLazy(
  api: RsbuildPluginAPI,
  options: Required<PluginVueLynxOptions>,
): void {
  // Skip if lazy loading is not enabled
  if (!options.experimental_isLazyBundle) {
    return
  }

  // Configure lazy loading
  api.modifyBundlerChain((chain) => {
    // Add lazy loading plugin
    chain
      .plugin('lazy-loading')
      .use(require('@lynx-js/vue-lazy-webpack-plugin'), [{
        // Configure which files to include
        include: [
          /\.vue$/,
          /\.vue\?vue/,
        ],
        // Configure which files to exclude
        exclude: [
          /node_modules/,
        ],
      }])

    return chain
  })
} 
