import { Component, isVNode, VNode } from 'vue';

// 根据定义好的组件参数数组设置默认props值
export function getPropsValue<P>(prop: P, validArray: P[]): P {
  if (validArray.includes(prop)) {
    return prop;
  }
  return validArray[0];
}

export function isComponent(val: unknown): val is Component | VNode {
  if (typeof val === 'function' || (typeof val === 'object' && val !== null)) {
    if ('render' in val || 'setup' in val || isVNode(val)) {
      return true;
    }
  }
  return false;
}
