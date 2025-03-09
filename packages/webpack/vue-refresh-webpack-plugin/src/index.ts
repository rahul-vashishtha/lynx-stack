// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @packageDocumentation
 *
 * A webpack plugin for Vue hot module replacement in Lynx.
 */

import type { Compiler } from '@rspack/core';
import { RuntimeGlobals } from '@lynx-js/webpack-runtime-globals';

/**
 * Options for the VueRefreshWebpackPlugin
 *
 * @public
 */
export interface VueRefreshWebpackPluginOptions {
  /**
   * Files to include in HMR
   *
   * @defaultValue `[/\.vue$/, /\.vue\?vue/, /\.tsx?$/, /\.jsx?$/]`
   */
  include?: RegExp[];

  /**
   * Files to exclude from HMR
   *
   * @defaultValue `[/node_modules/]`
   */
  exclude?: RegExp[];
}

/**
 * A webpack plugin for Vue hot module replacement in Lynx
 *
 * @example
 * ```js
 * // webpack.config.js
 * import { VueRefreshWebpackPlugin } from '@lynx-js/vue-refresh-webpack-plugin'
 * export default {
 *   plugins: [new VueRefreshWebpackPlugin()],
 * }
 * ```
 *
 * @public
 */
export class VueRefreshWebpackPlugin {
  /**
   * The default options
   */
  static defaultOptions: Required<VueRefreshWebpackPluginOptions> = {
    include: [/\.vue$/, /\.vue\?vue/, /\.tsx?$/, /\.jsx?$/],
    exclude: [/node_modules/],
  };

  /**
   * Create a new VueRefreshWebpackPlugin
   */
  constructor(
    private readonly options?: VueRefreshWebpackPluginOptions,
  ) {}

  /**
   * Apply the plugin to the compiler
   */
  apply(compiler: Compiler): void {
    // Get the options
    const options = {
      ...VueRefreshWebpackPlugin.defaultOptions,
      ...this.options,
    };

    // Add the HMR runtime module
    compiler.hooks.thisCompilation.tap('VueRefreshWebpackPlugin', (compilation) => {
      // Add the runtime module
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.hmrDownloadManifest)
        .tap('VueRefreshWebpackPlugin', (chunk, set) => {
          // Add the Vue HMR runtime
          set.add(RuntimeGlobals.hmrDownloadUpdateHandlers);
          set.add(RuntimeGlobals.hmrModuleData);
          set.add(RuntimeGlobals.moduleCache);
          set.add(RuntimeGlobals.moduleFactories);
          return true;
        });

      // Add the HMR update handlers
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
        .tap('VueRefreshWebpackPlugin', (chunk, set) => {
          // Add the Vue HMR update handlers
          set.add(RuntimeGlobals.moduleCache);
          set.add(RuntimeGlobals.moduleFactories);
          return true;
        });
    });

    // Add the HMR plugin
    const { HotModuleReplacementPlugin } = compiler.webpack;
    if (!compiler.options.plugins?.some(plugin => plugin instanceof HotModuleReplacementPlugin)) {
      new HotModuleReplacementPlugin().apply(compiler);
    }
  }
} 
