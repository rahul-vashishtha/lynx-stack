// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Lynx API for Vue integration
 * 
 * This file provides the integration with Lynx's Element PAPI.
 */

// Import types from nodeOps
import type { LynxElement } from './nodeOps.js';

// Interface for Lynx API
export interface LynxAPI {
  // Create a Lynx element
  createElement: (type: string, props?: Record<string, any>) => LynxElement;
  
  // Update a Lynx element
  updateElement: (element: LynxElement, props: Record<string, any>) => void;
  
  // Remove a Lynx element
  removeElement: (element: LynxElement) => void;
  
  // Append a child to a Lynx element
  appendChild: (parent: LynxElement, child: LynxElement) => void;
  
  // Insert a child before another child
  insertBefore: (parent: LynxElement, child: LynxElement, beforeChild: LynxElement) => void;
  
  // Remove a child from a Lynx element
  removeChild: (parent: LynxElement, child: LynxElement) => void;
}

// Check if we're in a Lynx environment
const isLynxEnvironment = typeof window !== 'undefined' && (window as any).__LYNX_ELEMENT_API__;

// Get the Lynx Element API
const getLynxElementApi = () => {
  if (!isLynxEnvironment) {
    return null;
  }
  
  return (window as any).__LYNX_ELEMENT_API__;
};

// Create a real Lynx API implementation
const createRealLynxAPI = (): LynxAPI => {
  const api = getLynxElementApi();
  
  if (!api) {
    throw new Error('Lynx Element API not found');
  }
  
  return {
    createElement: (type, props = {}) => {
      return api.__createElement(type, props);
    },
    updateElement: (element, props) => {
      return api.__updateElement(element, props);
    },
    removeElement: (element) => {
      return api.__removeElement(element);
    },
    appendChild: (parent, child) => {
      return api.__appendChild(parent, child);
    },
    insertBefore: (parent, child, beforeChild) => {
      return api.__insertBefore(parent, child, beforeChild);
    },
    removeChild: (parent, child) => {
      return api.__removeChild(parent, child);
    },
  };
};

// Create a mock Lynx API for development
const createMockLynxAPI = (): LynxAPI => {
  console.warn('Using mock Lynx API for development');
  
  // Mock element counter for generating IDs
  let elementCounter = 0;
  
  return {
    createElement: (type, props = {}) => {
      const element = {
        tagName: type,
        id: `lynx-element-${elementCounter++}`,
        children: [],
        parentElement: null,
        setAttribute: (name, value) => {
          (element as any)[name] = value;
        },
        removeAttribute: (name) => {
          delete (element as any)[name];
        },
        addEventListener: (event, handler) => {
          // Mock implementation
        },
        removeEventListener: (event, handler) => {
          // Mock implementation
        },
        textContent: '',
      } as LynxElement;
      
      // Apply props
      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      return element;
    },
    updateElement: (element, props) => {
      Object.entries(props).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    },
    removeElement: (element) => {
      const parent = element.parentElement;
      if (parent) {
        this.removeChild(parent, element);
      }
    },
    appendChild: (parent, child) => {
      parent.children.push(child);
      child.parentElement = parent;
    },
    insertBefore: (parent, child, beforeChild) => {
      const index = parent.children.indexOf(beforeChild);
      if (index !== -1) {
        parent.children.splice(index, 0, child);
        child.parentElement = parent;
      } else {
        this.appendChild(parent, child);
      }
    },
    removeChild: (parent, child) => {
      const index = parent.children.indexOf(child);
      if (index !== -1) {
        parent.children.splice(index, 1);
        child.parentElement = null;
      }
    },
  };
};

// Export the Lynx API
export const lynxApi: LynxAPI = isLynxEnvironment
  ? createRealLynxAPI()
  : createMockLynxAPI(); 
