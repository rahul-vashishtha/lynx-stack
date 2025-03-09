// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { LoaderContext } from 'webpack';
import { parse } from '@vue/compiler-sfc';
import { compileScript } from '@vue/compiler-sfc';
import { LAYERS } from '../layer.js';
import type { VueLoaderOptions } from './options.js';

/**
 * A webpack loader that extracts the script from a Vue SFC and compiles it for the background thread
 */
export default function backgroundLoader(
  this: LoaderContext<VueLoaderOptions>,
  source: string,
): string {
  const options = this.getOptions();
  const { splitTemplate = false, scriptInBackground = false } = options;

  // Skip if not splitting or not putting script in background
  if (!splitTemplate || !scriptInBackground) {
    return '';
  }

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
// Vue script compiled for background thread
import { defineComponent } from 'vue';

// Script code
${content}

// Mark this module as being in the background layer
if (module.hot) {
  module.hot.accept();
}
`;
} 
