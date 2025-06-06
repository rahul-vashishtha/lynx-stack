// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export const enum AnimationOperation {
  START = 0,
  PLAY,
  PAUSE,
  CANCEL,
  FINISH,
}

export interface ElementAnimationOptions {
  operation: AnimationOperation;
  id: string;
  keyframes?: any;
  timingOptions?: Record<string, any>;
}
