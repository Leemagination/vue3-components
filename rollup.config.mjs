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
    // 本地引入了一份支持css文件tree-shake的插件 https://github.com/egoist/rollup-plugin-postcss/pull/415/commits
    postcss({
      inject: true,
      minimize: true
    }),
    commonjs(),
    resolve(),
    terser()
  ]
};
