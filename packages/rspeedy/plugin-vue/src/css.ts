// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { RsbuildPluginAPI } from '@rsbuild/core'
import type { PluginVueLynxOptions } from './pluginVueLynx.js'

/**
 * Apply CSS configuration for Vue components
 */
export function applyCSS(
  api: RsbuildPluginAPI,
  options: Required<PluginVueLynxOptions>,
): void {
  const { enableRemoveCSSScope } = options

  // Configure CSS modules
  api.modifyBundlerChain((chain) => {
    // Configure the chain
    // Get all CSS rules
    const cssRules = [
      chain.module.rules.get('css'),
      chain.module.rules.get('less'),
      chain.module.rules.get('sass'),
      chain.module.rules.get('scss'),
    ].filter(Boolean)

    // Configure each CSS rule
    for (const rule of cssRules) {
      // Get the CSS modules rule
      const modulesRule = rule.oneOf?.('modules')

      // Skip if there's no modules rule
      if (!modulesRule) {
        continue
      }

      // Configure the CSS modules options
      const cssLoaderIdx = modulesRule.uses.findIndex(
        (use) => use.name === 'css-loader',
      )

      // Skip if there's no CSS loader
      if (cssLoaderIdx === -1) {
        continue
      }

      // Get the CSS loader options
      const cssLoader = modulesRule.uses.get(cssLoaderIdx)
      const cssLoaderOptions = cssLoader.get('options') || {}

      // Configure the CSS modules options
      cssLoader.options({
        ...cssLoaderOptions,
        modules: {
          ...(cssLoaderOptions.modules || {}),
          // Configure the local identity name
          localIdentName: '[local]_[hash:base64:5]',
          // Configure whether to use scoped CSS
          exportGlobals: enableRemoveCSSScope !== false,
        },
      })
    }

    // Return void instead of the chain to match the expected type
    return
  })
} 
