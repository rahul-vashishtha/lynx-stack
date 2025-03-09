// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { LoaderContext } from 'webpack';
import { parse } from '@vue/compiler-sfc';
import { compileTemplate } from '@vue/compiler-sfc';
import { LAYERS } from '../layer.js';
import type { VueLoaderOptions } from './options.js';

/**
 * A webpack loader that extracts the template from a Vue SFC and compiles it for the main thread
 */
export default function mainThreadLoader(
  this: LoaderContext<VueLoaderOptions>,
  source: string,
): string {
  const options = this.getOptions();
  const { splitTemplate = false, templateInMainThread = false } = options;

  // Skip if not splitting or not putting template in main thread
  if (!splitTemplate || !templateInMainThread) {
    return '';
  }

  // Parse the SFC
  const { descriptor } = parse(source);

  // Skip if no template
  if (!descriptor.template) {
    return '';
  }

  // Compile the template
  const { code } = compileTemplate({
    id: this.resourcePath,
    filename: this.resourcePath,
    source: descriptor.template.content,
    preprocessLang: descriptor.template.lang,
  });

  // Generate the main thread code
  return `
// Vue template compiled for main thread
import { createApp } from 'vue';

// Template code
${code}

// Export the render function
export default render;

// Mark this module as being in the main thread layer
if (module.hot) {
  module.hot.accept();
}
`;
} 
