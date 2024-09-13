import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue-jsx"
import postcss from "./plugins/rollup-plugin-postcss.js";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  external: ['vue'],
  input: 'src/components/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    globals: {
      vue: 'Vue'
    }
  },
  plugins: [
    typescript(),
    vue(),
    postcss({
      inject: true,
      minimize: true
    }),
    commonjs(),
    resolve(),
    terser()
  ]
};
