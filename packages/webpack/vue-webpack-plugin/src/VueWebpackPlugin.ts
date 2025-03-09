// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import * as fs from 'node:fs';
import { createRequire } from 'node:module';

import type { Chunk, Compilation, Compiler } from '@rspack/core';
import invariant from 'tiny-invariant';

import { LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';
import { RuntimeGlobals } from '@lynx-js/webpack-runtime-globals';

import { LAYERS } from './layer.js';
import { createLynxProcessEvalResultRuntimeModule } from './LynxProcessEvalResultRuntimeModule.js';

// Use a different variable name to avoid the duplicate identifier issue
const nodeRequire = createRequire(import.meta.url);

/**
 * The options for VueWebpackPlugin
 *
 * @public
 */
export interface VueWebpackPluginOptions {
  /**
   * Whether to disable compatibility warnings
   */
  disableCompatibilityWarnings?: boolean | undefined;

  /**
   * When to transfer control to the background thread after the first screen
   */
  firstScreenSyncTiming?: 'immediately' | 'jsReady';

  /**
   * The chunk names to be considered as main thread chunks
   */
  mainThreadChunks?: string[] | undefined;

  /**
   * Whether to split the template and script into separate files
   */
  splitTemplate?: boolean;

  /**
   * Whether to put the template in the main thread
   */
  templateInMainThread?: boolean;

  /**
   * Whether to put the script in the background thread
   */
  scriptInBackground?: boolean;

  /**
   * Whether to support <script main> tag for main thread code
   */
  supportScriptMain?: boolean;

  /**
   * Whether to put the style in the main thread
   */
  styleToLayer?: string;

  /**
   * Whether to put the template in the main thread
   */
  templateToLayer?: string;

  /**
   * Whether to put the script in the background thread
   */
  scriptToLayer?: string;

  /**
   * Whether to enable hot reload
   */
  hotReload?: boolean;

  /**
   * Whether to optimize for SSR
   */
  optimizeSSR?: boolean;
}

/**
 * VueWebpackPlugin allows using VueLynx with webpack
 *
 * @example
 * ```js
 * // webpack.config.js
 * import { VueWebpackPlugin } from '@lynx-js/vue-webpack-plugin'
 * export default {
 *   plugins: [new VueWebpackPlugin()],
 * }
 * ```
 *
 * @public
 */
export class VueWebpackPlugin {
  /**
   * The loaders for each layer
   */
  static loaders: Record<keyof typeof LAYERS, string> = {
    BACKGROUND: nodeRequire.resolve('./loaders/background.js'),
    MAIN_THREAD: nodeRequire.resolve('./loaders/main-thread.js'),
  };

  /**
   * The main script loader for <script main> tag
   */
  static mainScriptLoader: string = nodeRequire.resolve('./loaders/main-script.js');

  /**
   * Create a new VueWebpackPlugin
   */
  constructor(
    private readonly options?: VueWebpackPluginOptions | undefined,
  ) {}

  /**
   * The default options
   */
  static defaultOptions: Readonly<Required<VueWebpackPluginOptions>> = Object.freeze({
    disableCompatibilityWarnings: false,
    firstScreenSyncTiming: 'immediately',
    mainThreadChunks: [],
    splitTemplate: false,
    templateInMainThread: false,
    scriptInBackground: false,
    supportScriptMain: true,
    styleToLayer: LAYERS.MAIN_THREAD,
    templateToLayer: LAYERS.MAIN_THREAD,
    scriptToLayer: LAYERS.BACKGROUND,
    hotReload: false,
    optimizeSSR: false,
  });

  /**
   * Apply the plugin to the compiler
   */
  apply(compiler: Compiler): void {
    // Get the options
    const options = {
      ...VueWebpackPlugin.defaultOptions,
      ...this.options,
    };

    // Add the Vue loader
    this.addVueLoader(compiler, options);

    // Add the runtime module
    compiler.hooks.thisCompilation.tap('VueWebpackPlugin', (compilation) => {
      // Add the runtime module
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.lynxProcessEvalResult)
        .tap('VueWebpackPlugin', (chunk, set) => {
          compilation.addRuntimeModule(
            chunk,
            createLynxProcessEvalResultRuntimeModule(compilation),
          );
          return true;
        });

      // Add the runtime globals
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.lynxRegisterComponent)
        .tap('VueWebpackPlugin', (chunk, set) => {
          set.add(RuntimeGlobals.lynxProcessEvalResult);
          return true;
        });
    });
  }

  /**
   * Add the Vue loader to the compiler
   */
  private addVueLoader(
    compiler: Compiler,
    options: Required<VueWebpackPluginOptions>,
  ): void {
    // Get the webpack module rules
    const { rules } = compiler.options.module!;

    // Add the Vue loader
    rules.push({
      test: /\.vue$/,
      oneOf: [
        // Background loader
        {
          resourceQuery: /background/,
          use: [
            {
              loader: VueWebpackPlugin.loaders.BACKGROUND,
              options,
            },
          ],
        },
        // Main thread loader
        {
          resourceQuery: /main-thread/,
          use: [
            {
              loader: VueWebpackPlugin.loaders.MAIN_THREAD,
              options,
            },
          ],
        },
        // Main script loader for <script main> tag
        {
          resourceQuery: /main-script/,
          use: [
            {
              loader: VueWebpackPlugin.mainScriptLoader,
              options,
            },
          ],
        },
        // Default loader
        {
          use: [
            // Background loader
            {
              loader: VueWebpackPlugin.loaders.BACKGROUND,
              options,
            },
            // Main thread loader
            {
              loader: VueWebpackPlugin.loaders.MAIN_THREAD,
              options,
            },
            // Main script loader
            {
              loader: VueWebpackPlugin.mainScriptLoader,
              options,
            },
          ],
        },
      ],
    });
  }
} 
