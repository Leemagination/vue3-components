// 根据定义好的组件参数数组设置默认props值
export function getPropsValue<P>(prop: P, validArray: P[]): P {
  if (validArray.includes(prop)) {
    return prop;
  }
  return validArray[0];
}
