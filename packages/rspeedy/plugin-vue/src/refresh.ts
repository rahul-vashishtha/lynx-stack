// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { RsbuildPluginAPI } from '@rsbuild/core'

/**
 * Apply hot module reloading for Vue components
 */
export function applyRefresh(api: RsbuildPluginAPI): void {
  // Only apply in development mode
  if (api.context.command !== 'dev') {
    return
  }

  // Configure HMR
  api.modifyBundlerChain((chain) => {
    // Add HMR plugin
    chain
      .plugin('hmr')
      .use(require('@lynx-js/vue-refresh-webpack-plugin'), [{
        // Configure which files to refresh
        include: [
          /\.vue$/,
          /\.vue\?vue/,
          /\.tsx?$/,
          /\.jsx?$/,
        ],
        // Configure which files to exclude
        exclude: [
          /node_modules/,
        ],
      }])

    return chain
  })
} 
