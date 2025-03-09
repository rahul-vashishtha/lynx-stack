// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Node operations for the Vue custom renderer
 * 
 * This file provides the implementation of DOM-like operations using Lynx's Element PAPI.
 */

import { lynxApi } from './lynxApi.js';

// Type definitions for Lynx elements
export interface LynxElement {
  tagName: string;
  id: string;
  children: LynxElement[];
  parentElement: LynxElement | null;
  setAttribute: (name: string, value: any) => void;
  removeAttribute: (name: string) => void;
  addEventListener: (event: string, handler: (event: any) => void) => void;
  removeEventListener: (event: string, handler: (event: any) => void) => void;
  textContent: string;
}

export interface LynxText {
  nodeType: 3;
  textContent: string;
  parentElement: LynxElement | null;
}

export interface LynxComment {
  nodeType: 8;
  textContent: string;
  parentElement: LynxElement | null;
}

export type LynxNode = LynxElement | LynxText | LynxComment;

// Node operations for the Vue custom renderer
export const nodeOps = {
  // Create element
  createElement(tag: string, isSVG?: boolean, is?: string): LynxElement {
    return lynxApi.createElement(tag) as LynxElement;
  },

  // Create text node
  createText(text: string): LynxText {
    const textNode = {
      nodeType: 3,
      textContent: text,
      parentElement: null,
    } as LynxText;
    return textNode;
  },

  // Create comment
  createComment(text: string): LynxComment {
    const commentNode = {
      nodeType: 8,
      textContent: text,
      parentElement: null,
    } as LynxComment;
    return commentNode;
  },

  // Set text content
  setText(node: LynxText, text: string) {
    node.textContent = text;
  },

  // Set comment content
  setComment(node: LynxComment, text: string) {
    node.textContent = text;
  },

  // Set static content
  setStaticContent(container: LynxElement, content: string, anchor: LynxNode | null) {
    // In Lynx, we can't directly set innerHTML, so we need to parse and create elements
    console.warn('setStaticContent is not fully supported in Lynx');
    container.textContent = content;
    return container.children[0] || null;
  },

  // Insert element before another element
  insertBefore(parent: LynxElement, child: LynxNode, anchor: LynxNode | null) {
    if (anchor) {
      lynxApi.insertBefore(parent, child as LynxElement, anchor as LynxElement);
    } else {
      lynxApi.appendChild(parent, child as LynxElement);
    }
    return child;
  },

  // Insert element into parent
  insert(child: LynxNode, parent: LynxElement, anchor?: LynxNode | null) {
    if (anchor) {
      lynxApi.insertBefore(parent, child as LynxElement, anchor as LynxElement);
    } else {
      lynxApi.appendChild(parent, child as LynxElement);
    }
  },

  // Remove element
  remove(child: LynxNode) {
    const parent = child.parentElement;
    if (parent) {
      lynxApi.removeChild(parent, child as LynxElement);
    }
  },

  // Append child
  appendChild(parent: LynxElement, child: LynxNode) {
    lynxApi.appendChild(parent, child as LynxElement);
  },

  // Get parent node
  parentNode(node: LynxNode): LynxElement | null {
    return node.parentElement;
  },

  // Get next sibling
  nextSibling(node: LynxNode): LynxNode | null {
    const parent = node.parentElement;
    if (!parent) return null;
    
    const index = parent.children.indexOf(node as LynxElement);
    if (index === -1 || index === parent.children.length - 1) return null;
    
    return parent.children[index + 1];
  },

  // Set scope ID
  setScopeId(el: LynxElement, id: string) {
    el.setAttribute('data-scope-id', id);
  },

  // Clone node (not fully supported in Lynx)
  cloneNode(node: LynxNode): LynxNode {
    console.warn('cloneNode is not fully supported in Lynx');
    return node;
  },
}; 
