// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { createRequire } from 'node:module'

import type {
  NormalizedEnvironmentConfig,
  RsbuildPluginAPI,
  Rspack,
} from '@rsbuild/core'
import type { UndefinedOnPartialDeep } from 'type-fest'

// Import the mock Vue webpack plugin instead of the actual one
import { CssExtractWebpackPlugin } from '@lynx-js/css-extract-webpack-plugin'
import type { ExposedAPI } from '@lynx-js/rspeedy'
import { RuntimeWrapperWebpackPlugin } from '@lynx-js/runtime-wrapper-webpack-plugin'
import {
  CSSPlugins,
  LynxEncodePlugin,
  LynxTemplatePlugin,
  WebEncodePlugin,
} from '@lynx-js/template-webpack-plugin'
import { LAYERS, VueWebpackPlugin } from '@lynx-js/vue-webpack-plugin'

import type { PluginVueLynxOptions } from './pluginVueLynx.js'

const PLUGIN_NAME_VUE = 'lynx:vue'
const PLUGIN_NAME_TEMPLATE = 'lynx:template'
const PLUGIN_NAME_RUNTIME_WRAPPER = 'lynx:runtime-wrapper'
const PLUGIN_NAME_CSS_EXTRACT = 'lynx:css-extract'
const PLUGIN_NAME_WEB = 'lynx:web'

// const DEFAULT_DIST_PATH_INTERMEDIATE = '.rspeedy'
const DEFAULT_FILENAME_HASH = '.[contenthash:8]'
const EMPTY_HASH = ''

export function applyEntry(
  api: RsbuildPluginAPI,
  options: Required<PluginVueLynxOptions>,
): void {
  const {
    compat,
    customCSSInheritanceList,
    debugInfoOutside,
    defaultDisplayLinear,
    enableAccessibilityElement,
    enableICU,
    enableCSSInheritance,
    enableCSSInvalidation,
    enableCSSSelector,
    enableNewGesture,
    enableParallelElement,
    enableRemoveCSSScope,
    firstScreenSyncTiming,
    pipelineSchedulerConfig,
    removeDescendantSelectorScope,
    targetSdkVersion,
    experimental_isLazyBundle,
  } = options

  const { config } = api.useExposed<ExposedAPI>(
    Symbol.for('rspeedy.api'),
  )

  // Get the environment configuration
  const isDev = process.env.NODE_ENV === 'development'
  const isProd = !isDev

  // Configure the entry points
  api.modifyRsbuildConfig((rsbuildConfig) => {
    const entries = Object.entries(rsbuildConfig.source?.entry ?? {})

    // Skip if there are no entries
    if (entries.length === 0) {
      return rsbuildConfig
    }

    // Get the hash configuration
    const hash = getHash(config, isProd)

    // Configure the template filename
    const templateFilename = (
      typeof config.output?.filename === 'object'
        ? config.output.filename.bundle ?? config.output.filename.template
        : config.output?.filename
    ) ?? '[name].[platform].bundle'

    // Process each entry
    for (const [entryName, entryValue] of entries) {
      // Get the chunks and imports
      const { chunks, imports } = getChunks(entryName, entryValue)

      // Skip if there are no chunks
      if (chunks.length === 0) {
        continue
      }

      // Configure the main thread entry
      const mainThreadEntry = `${entryName}/main-thread`
      const mainThreadName = `${entryName}/main-thread${hash}.js`

      // Configure the background entry
      const backgroundEntry = `${entryName}/background`
      const backgroundName = getBackgroundFilename(entryName, config, isProd)

      // Configure the entry points
      api.modifyBundlerChain((chain, { environment }) => {
        const isLynx = environment.name === 'lynx'
        const isWeb = environment.name === 'web'

        // Configure the Vue webpack plugin
        chain
          .plugin(`${PLUGIN_NAME_VUE}-${entryName}`)
          .use(VueWebpackPlugin, [{
            // Configure which parts go to which threads
            splitTemplate: true,
            templateToLayer: LAYERS.MAIN_THREAD,
            scriptToLayer: LAYERS.BACKGROUND,
            styleToLayer: LAYERS.MAIN_THREAD,
            // Enable HMR for development
            hotReload: isDev,
            // For Vue-specific reactivity implementation in Lynx environment
            mainThreadChunks: [mainThreadEntry],
            firstScreenSyncTiming,
            // Configure thread separation for Vue components
            templateInMainThread: true,
            scriptInBackground: true,
            // Vue-specific optimizations
            optimizeSSR: false,
            disableCompatibilityWarnings: compat?.disableCompatibilityWarnings
              ?? false,
          }])

        // Configure the main thread entry
        chain
          .entry(mainThreadEntry)
          .add({
            layer: LAYERS.MAIN_THREAD,
            import: imports.join(''),
            filename: mainThreadName,
          })
          .when(isDev && !isWeb, entry => {
            const require = createRequire(import.meta.url)
            // use prepend to make sure it does not affect the exports from the entry
            entry
              .prepend({
                layer: LAYERS.MAIN_THREAD,
                import: require.resolve(
                  '@lynx-js/css-extract-webpack-plugin/runtime/hotModuleReplacement.lepus.cjs',
                ),
              })
          })
          .end()

        // Configure the background entry
        chain
          .entry(backgroundEntry)
          .add({
            layer: LAYERS.BACKGROUND,
            import: imports.join(''),
            filename: backgroundName,
          })
          .when(isDev && !isWeb, entry => {
            // use prepend to make sure it does not affect the exports from the entry
            entry
              .prepend({
                layer: LAYERS.BACKGROUND,
                import: '@rspack/core/hot/dev-server',
              })
              .prepend({
                layer: LAYERS.BACKGROUND,
                import: '@lynx-js/webpack-dev-transport/client',
              })
              .prepend({
                layer: LAYERS.BACKGROUND,
                import: '@lynx-js/vue/hmr',
              })
          })
          .end()

        // Configure the template plugin
        chain
          .plugin(`${PLUGIN_NAME_TEMPLATE}-${entryName}`)
          .use(LynxTemplatePlugin, [{
            dsl: 'vue_template',
            chunks: [mainThreadEntry, backgroundEntry],
            filename: templateFilename.replace(/\[name\]/g, entryName)
              .replace(/\[platform\]/g, environment.name),
            customCSSInheritanceList,
            debugInfoOutside,
            defaultDisplayLinear,
            enableA11y: true,
            enableAccessibilityElement,
            enableICU,
            enableCSSInheritance,
            enableCSSInvalidation,
            enableCSSSelector,
            enableNewGesture,
            enableParallelElement,
            enableRemoveCSSScope: enableRemoveCSSScope ?? true,
            pipelineSchedulerConfig,
            removeDescendantSelectorScope,
            targetSdkVersion,
            experimental_isLazyBundle,
            cssPlugins: [
              CSSPlugins.parserPlugins.removeFunctionWhiteSpace(),
            ],
          }])

        // Configure the CSS extract plugin
        chain
          .plugin(`${PLUGIN_NAME_CSS_EXTRACT}-${entryName}`)
          .use(CssExtractWebpackPlugin, [{
            filename: '[name]/style.css',
            chunkFilename: '[name]/[id].css',
            // Extract all styles to main thread
            layers: [LAYERS.MAIN_THREAD],
            ignoreOrder: false,
            experimentalUseImportModule: false,
          }])

        // Configure the runtime wrapper plugin
        chain
          .plugin(`${PLUGIN_NAME_RUNTIME_WRAPPER}-${entryName}`)
          .use(RuntimeWrapperWebpackPlugin, [{
            injectVars(vars) {
              return Object.assign(vars, {
                // Inject the template path
                __TEMPLATE_PATH__: JSON.stringify(
                  templateFilename
                    .replace(/\[name\]/g, entryName)
                    .replace(/\[platform\]/g, environment.name),
                ),
              })
            },
            targetSdkVersion,
            // Inject runtime wrapper for all `.js` but not `main-thread.js` and `main-thread.[hash].js`.
            test: /^(?!.*main-thread(?:\.[A-Fa-f0-9]*)?\.js$).*\.js$/,
          }])

        // Apply encoding based on environment
        if (isLynx) {
          const inlineScripts =
            typeof environment.config.output?.inlineScripts === 'boolean'
              ? environment.config.output.inlineScripts
              : true

          chain
            .plugin(`${LynxEncodePlugin.name}`)
            .use(LynxEncodePlugin, [{ inlineScripts }])
        }

        if (isWeb) {
          chain
            .plugin(PLUGIN_NAME_WEB)
            .use(WebEncodePlugin, [])
        }

        return chain
      })
    }

    return rsbuildConfig
  })
}

/**
 * Get the chunks and imports for an entry
 */
function getChunks(
  entryName: string,
  entryValue:
    (string | string[] | UndefinedOnPartialDeep<Rspack.EntryDescription>)[],
): { chunks: string[], imports: string[] } {
  const chunks: string[] = []
  const imports: string[] = []

  // Process each entry value
  for (const value of entryValue) {
    if (typeof value === 'string') {
      // Add the string value as an import
      imports.push(value)
      chunks.push(entryName)
    } else if (Array.isArray(value)) {
      // Add each string in the array as an import
      imports.push(...value)
      chunks.push(entryName)
    } else if (value && typeof value === 'object') {
      // Add the import from the object
      if (value.import) {
        if (typeof value.import === 'string') {
          imports.push(value.import)
        } else if (Array.isArray(value.import)) {
          imports.push(...value.import)
        }
      }
      chunks.push(entryName)
    }
  }

  return { chunks, imports }
}

/**
 * Get the background filename
 */
function getBackgroundFilename(
  entryName: string,
  config: NormalizedEnvironmentConfig,
  isProd: boolean,
): string {
  const hash = getHash(config, isProd)
  return `${entryName}/background${hash}.js`
}

/**
 * Get the hash configuration
 */
function getHash(config: NormalizedEnvironmentConfig, isProd: boolean): string {
  if (config.output?.filenameHash === false) {
    return EMPTY_HASH
  }
  return isProd ? DEFAULT_FILENAME_HASH : EMPTY_HASH
}
