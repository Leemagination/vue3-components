import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// https://vitejs.dev/config/
import DemoPlugins from './plugins/demoPlugin.js';
export default defineConfig({
  server: {
    port: 8888
  },
  plugins: [DemoPlugins(), vue(), vueJsx()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
