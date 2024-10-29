export default function DemoPlugin() {
  return {
    name: 'transform-components',
    transform(src) {
      if (src.includes('import style from')) {
        src = src.replace(/style from|__STYLE__: style,/g, '');
      }
      return {
        code: src,
        map: null // 如果可行将提供 source map
      };
    }
  };
}
