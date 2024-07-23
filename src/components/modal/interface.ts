import { Component, StyleValue, VNode } from 'vue';

export type ModalEmitType =
  | 'closed'
  | 'update:visible'
  | 'maskClick'
  | 'cancelClick'
  | 'confirmClick';
export const modalEmits = ['closed', 'update:visible', 'maskClick', 'cancelClick', 'confirmClick'];

export type ModalConfigType = {
  showClose: boolean;
  modalStyle: StyleValue;
  zIndex: number;
  title: string | Component | VNode;
  content: string | Component | VNode;
  showCancel: boolean;
  showConfirm: boolean;
  cancelText: string;
  confirmText: string;
  maskClosable: boolean;
  handleClosed: (...arg: any[]) => any;
  handleConfirm: (...arg: any[]) => any;
  handleCancel: (...arg: any[]) => any;
};
