import { defineConfig } from '@rsbuild/core'
import { pluginTypescript } from '@rsbuild/plugin-typescript'
import { pluginNode } from '@rsbuild/plugin-node'

export default defineConfig({
  plugins: [
    pluginTypescript({
      tsconfig: './tsconfig.build.json',
    }),
    pluginNode({
      format: 'esm',
      target: 'node18',
      externalAllNodeModules: true,
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
    alias: {
      '@': './src',
    },
  },
  output: {
    distPath: {
      root: './lib',
    },
    filename: {
      js: '[name].js',
    },
    cleanDistPath: true,
  },
}) 
