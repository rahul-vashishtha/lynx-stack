// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

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
