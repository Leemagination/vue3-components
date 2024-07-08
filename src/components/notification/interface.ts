export type NotificationItemEmitType = 'close';

export const NotificationItemEmits = ['close'];

export interface NotificationConfig {
  title?: string;
  description?: string;
  content?: string;
  meta?: string;
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
