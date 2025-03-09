// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { Compilation } from '@rspack/core';
import { RuntimeGlobals } from '@lynx-js/webpack-runtime-globals';

/**
 * A runtime module that processes eval results for Vue components
 */
export function createLynxProcessEvalResultRuntimeModule(
  compilation: Compilation,
): any {
  const { RuntimeModule } = compilation.compiler.webpack;

  return class LynxProcessEvalResultRuntimeModule extends RuntimeModule {
    constructor() {
      super('lynx process eval result', 10);
    }

    generate(): string {
      const { runtimeTemplate } = compilation;
      const content = `
// This module is used to process eval results for Vue components
${RuntimeGlobals.lynxProcessEvalResult} = function(moduleId, result) {
  // If the result is a Vue component, register it
  if (result && typeof result === 'object' && result.__file) {
    // Get the component name
    var name = result.name || result.__file.split('/').pop().split('.')[0];
    
    // Register the component
    if (${RuntimeGlobals.lynxRegisterComponent}) {
      ${RuntimeGlobals.lynxRegisterComponent}(name, result);
    }
  }
  
  return result;
};`;

      return content;
    }
  };
} 
