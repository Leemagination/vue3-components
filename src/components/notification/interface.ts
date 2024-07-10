import { Component, VNode } from 'vue';

export type NotificationItemEmitType = 'close' | 'hide';

export const NotificationItemEmits = ['close', 'hide'];

export interface NotificationConfig {
  title?: string | Component | VNode;
  description?: string | Component | VNode;
  content?: string | Component | VNode;
  meta?: string | Component | VNode;
  duration: number;
  closable?: boolean;
}

export interface NotificationGlobalConfig {
  maxItem: number;
  duration: number;
  placement: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
}

export interface NotificationItemType extends NotificationConfig {
  key: number;
}

export enum ItemRefStatus {
  Hiding = 'hiding',
  Show = 'show'
}
