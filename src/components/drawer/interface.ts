import { Component, StyleValue, VNode } from 'vue';

export type DrawerEmitType = 'closed' | 'update:visible' | 'maskClick';

export const drawerEmits = ['closed', 'update:visible', 'maskClick'];

export type PlacementType = 'right' | 'top' | 'bottom' | 'left';
export const placementList: PlacementType[] = ['right', 'top', 'bottom', 'left'];

export type DrawerConfigType = {
  placement: PlacementType;
  size: number | string;
  visible: boolean;
  showClose: boolean;
  drawerStyle: StyleValue;
  zIndex: number;
  title: string | VNode | Component;
  content: string | VNode | Component;
  maskClosable: boolean;
  handleClosed: (...arg: any[]) => any;
};
