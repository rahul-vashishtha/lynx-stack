import { root } from '@lynx-js/vue';

import { App } from './App.js';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
