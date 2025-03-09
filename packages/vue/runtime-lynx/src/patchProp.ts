// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Property patching for the Vue custom renderer
 * 
 * This file provides the implementation of property patching using Lynx's Element PAPI.
 */

import type { LynxElement } from './nodeOps.js';

// Event handler cache to properly remove event listeners
const eventHandlerCache = new WeakMap<LynxElement, Record<string, Function>>();

// Patch a class
function patchClass(el: LynxElement, value: string | null) {
  if (value == null) {
    el.removeAttribute('class');
  } else {
    el.setAttribute('class', value);
  }
}

// Patch a style
function patchStyle(el: LynxElement, _prev: any, next: any) {
  if (!next) {
    el.removeAttribute('style');
    return;
  }
  
  if (typeof next === 'string') {
    el.setAttribute('style', next);
    return;
  }
  
  // Handle object style
  const style: Record<string, string> = {};
  
  for (const key in next) {
    style[key] = next[key];
  }
  
  el.setAttribute('style', style);
}

// Patch an event listener
function patchEvent(
  el: LynxElement,
  name: string,
  prevValue: Function | null,
  nextValue: Function | null
) {
  // Get the event name (remove the 'on' prefix)
  const eventName = name.slice(2).toLowerCase();
  
  // Get or create the event handler cache for this element
  let handlers = eventHandlerCache.get(el);
  if (!handlers) {
    handlers = {};
    eventHandlerCache.set(el, handlers);
  }
  
  // Remove the previous handler if it exists
  if (prevValue) {
    if (handlers[eventName]) {
      el.removeEventListener(eventName, handlers[eventName] as any);
      delete handlers[eventName];
    }
  }
  
  // Add the new handler if it exists
  if (nextValue) {
    handlers[eventName] = nextValue;
    el.addEventListener(eventName, nextValue as any);
  }
}

// Patch an attribute
function patchAttr(el: LynxElement, key: string, value: any) {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}

// Main patchProp function
export function patchProp(
  el: LynxElement,
  key: string,
  prevValue: any,
  nextValue: any
): void {
  // Handle special cases
  if (key === 'class') {
    patchClass(el, nextValue);
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue);
  } else if (key.startsWith('on')) {
    patchEvent(el, key, prevValue, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
} 
