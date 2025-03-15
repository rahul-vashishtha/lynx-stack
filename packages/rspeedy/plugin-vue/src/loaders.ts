// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { RsbuildPluginAPI } from '@rsbuild/core'

import type { PluginVueLynxOptions } from './pluginVueLynx.js'

/**
 * Apply Vue-specific loaders
 */
export function applyLoaders(
  api: RsbuildPluginAPI,
  options: Required<PluginVueLynxOptions>,
): void {
  // Configure Vue loader
  api.modifyBundlerChain((chain) => {
    // Add Vue loader for .vue files
    chain.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('@lynx-js/vue-webpack-loader')
      .options({
        // Configure which parts go to which threads
        splitTemplate: true,
        // Enable HMR for development
        hotReload: api.context.command === 'dev',
        // Configure thread separation for Vue components
        templateInMainThread: true,
        scriptInBackground: true,
        // Vue-specific optimizations
        optimizeSSR: false,
        disableCompatibilityWarnings: options.compat?.disableCompatibilityWarnings ?? false,
      })

    return chain
  })
} 
