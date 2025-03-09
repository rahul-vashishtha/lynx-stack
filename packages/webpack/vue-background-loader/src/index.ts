// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @packageDocumentation
 *
 * A webpack loader for Vue background-only components in Lynx.
 */

import type { LoaderContext } from 'webpack';
import { parse, compileScript } from '@vue/compiler-sfc';

/**
 * Options for the Vue background loader
 *
 * @public
 */
export interface VueBackgroundLoaderOptions {
  /**
   * Whether to only include script code
   *
   * @defaultValue `false`
   */
  scriptOnly?: boolean;
}

/**
 * A webpack loader that extracts the script from a Vue SFC for background-only usage
 *
 * @public
 */
export default function vueBackgroundLoader(
  this: LoaderContext<VueBackgroundLoaderOptions>,
  source: string,
): string {
  const options = this.getOptions();
  const { scriptOnly = false } = options;

  // Parse the SFC
  const { descriptor } = parse(source);

  // Skip if no script
  if (!descriptor.script && !descriptor.scriptSetup) {
    return '';
  }

  // Compile the script
  const { content } = compileScript(descriptor, {
    id: this.resourcePath,
    inlineTemplate: false,
  });

  // Generate the background code
  return `
// Vue script compiled for background-only usage
import { defineComponent } from 'vue';

// Script code
${content}

// Mark this module as being in the background layer
if (module.hot) {
  module.hot.accept();
}
`;
} 
