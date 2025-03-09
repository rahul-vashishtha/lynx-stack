// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { LoaderContext } from 'webpack';
import { parse } from '@vue/compiler-sfc';
import { LAYERS } from '../layer.js';
import type { VueLoaderOptions } from './options.js';

/**
 * A webpack loader that extracts the <script main> from a Vue SFC and compiles it for the main thread
 */
export default function mainScriptLoader(
  this: LoaderContext<VueLoaderOptions>,
  source: string,
): string {
  const options = this.getOptions();
  const { supportScriptMain = true } = options;

  // Skip if not supporting <script main>
  if (!supportScriptMain) {
    return '';
  }

  // Parse the SFC
  const { descriptor } = parse(source);

  // Find the <script main> block
  const mainScript = descriptor.customBlocks.find(block => 
    block.type === 'script' && block.attrs.main !== undefined
  );

  // Skip if no <script main> block
  if (!mainScript) {
    return '';
  }

  // Generate the main thread script code
  return `
// Vue <script main> compiled for main thread
import { defineComponent } from 'vue';

// Main thread script code
${mainScript.content}

// Mark this module as being in the main thread layer
if (module.hot) {
  module.hot.accept();
}
`;
} 
