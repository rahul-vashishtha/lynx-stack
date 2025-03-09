// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * @packageDocumentation
 *
 * A webpack loader for Vue Single File Components in Lynx.
 */

import type { LoaderContext } from 'webpack';
import { parse, compileTemplate, compileScript, compileStyle } from '@vue/compiler-sfc';
import hashSum from 'hash-sum';

/**
 * Options for the Vue loader
 *
 * @public
 */
export interface VueLoaderOptions {
  /**
   * Whether to split the template and script into separate files
   *
   * @defaultValue `false`
   */
  splitTemplate?: boolean;

  /**
   * Whether to put the template in the main thread
   *
   * @defaultValue `false`
   */
  templateInMainThread?: boolean;

  /**
   * Whether to put the script in the background thread
   *
   * @defaultValue `false`
   */
  scriptInBackground?: boolean;

  /**
   * Whether to put the style in the main thread
   *
   * @defaultValue `false`
   */
  styleToLayer?: string;

  /**
   * Whether to put the template in the main thread
   *
   * @defaultValue `false`
   */
  templateToLayer?: string;

  /**
   * Whether to put the script in the background thread
   *
   * @defaultValue `false`
   */
  scriptToLayer?: string;

  /**
   * Whether to enable hot reload
   *
   * @defaultValue `false`
   */
  hotReload?: boolean;

  /**
   * Whether to optimize for SSR
   *
   * @defaultValue `false`
   */
  optimizeSSR?: boolean;

  /**
   * Whether to disable compatibility warnings
   *
   * @defaultValue `false`
   */
  disableCompatibilityWarnings?: boolean;
}

/**
 * A webpack loader for Vue Single File Components in Lynx
 *
 * @public
 */
export default function vueLoader(
  this: LoaderContext<VueLoaderOptions>,
  source: string,
): string {
  const options = this.getOptions();
  const {
    splitTemplate = false,
    templateInMainThread = false,
    scriptInBackground = false,
    hotReload = false,
    optimizeSSR = false,
    disableCompatibilityWarnings = false,
  } = options;

  // Parse the SFC
  const { descriptor } = parse(source);
  const filename = this.resourcePath;
  const id = hashSum(filename);

  // Process the template
  let templateCode = '';
  if (descriptor.template) {
    const { code } = compileTemplate({
      id,
      filename,
      source: descriptor.template.content,
      preprocessLang: descriptor.template.lang,
    });
    templateCode = code;
  }

  // Process the script
  let scriptCode = '';
  if (descriptor.script || descriptor.scriptSetup) {
    const { content } = compileScript(descriptor, {
      id,
      inlineTemplate: !splitTemplate,
    });
    scriptCode = content;
  }

  // Process the styles
  let styleCode = '';
  if (descriptor.styles.length > 0) {
    for (const style of descriptor.styles) {
      const { code } = compileStyle({
        id,
        filename,
        source: style.content,
        preprocessLang: style.lang,
        scoped: style.scoped,
      });
      styleCode += code;
    }
  }

  // Generate the output code
  let code = '';

  // If splitting, only include the necessary parts
  if (splitTemplate) {
    if (this.resourceQuery === '?main-thread' && templateInMainThread) {
      // Main thread code (template)
      code = `
// Vue template compiled for main thread
import { createApp } from 'vue';

// Template code
${templateCode}

// Export the render function
export default render;

// Mark this module as being in the main thread layer
if (module.hot) {
  module.hot.accept();
}
`;
    } else if (this.resourceQuery === '?background' && scriptInBackground) {
      // Background code (script)
      code = `
// Vue script compiled for background thread
import { defineComponent } from 'vue';

// Script code
${scriptCode}

// Mark this module as being in the background layer
if (module.hot) {
  module.hot.accept();
}
`;
    } else {
      // Default code (both template and script)
      code = `
// Vue component
import { defineComponent } from 'vue';

// Template code
${templateCode}

// Script code
${scriptCode}

// Style code
${styleCode ? `
// <style>
${styleCode}
// </style>
` : ''}

// Export the component
export default {};

// Enable HMR
if (module.hot) {
  module.hot.accept();
}
`;
    }
  } else {
    // No splitting, include everything
    code = `
// Vue component
import { defineComponent } from 'vue';

// Template code
${templateCode}

// Script code
${scriptCode}

// Style code
${styleCode ? `
// <style>
${styleCode}
// </style>
` : ''}

// Export the component
export default {};

// Enable HMR
if (module.hot) {
  module.hot.accept();
}
`;
  }

  return code;
} 
