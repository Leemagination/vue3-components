export type MessageItemEmitType= 'close'

export const MessageItemEmits = ['close']

export interface MessageConfig {
    content: string;
    duration: number;
    type: 'error'|'info'|'success'|'warning'|null;
    closable?: boolean;
}

export interface MessageGlobalConfig {
    maxItem: number;
    duration: number;
    placement: 'top'|'top-left'|'top-right'|'bottom'|'bottom-left'|'bottom-right';
}

export interface MessageItemType extends MessageConfig{
    key: number;
}
