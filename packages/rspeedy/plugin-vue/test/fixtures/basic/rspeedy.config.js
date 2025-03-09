import { defineConfig } from '@lynx-js/rspeedy'
import { pluginVueLynx } from '@lynx-js/vue-rsbuild-plugin'

export default defineConfig({
  plugins: [
    pluginVueLynx({
      // Enable CSS inheritance
      enableCSSInheritance: true,
      // Place debug info outside the template
      debugInfoOutside: true,
      // Configure thread separation
      firstScreenSyncTiming: 'immediately',
    }),
  ],
  source: {
    entry: {
      index: './src/main.js',
    },
  },
  output: {
    distPath: {
      root: './dist',
    },
  },
}) 
