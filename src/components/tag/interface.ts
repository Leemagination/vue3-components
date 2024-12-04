import { CSSProperties } from '@vue/runtime-dom';

export const tagType = ['default', 'primary', 'success', 'danger', 'warning'];
export type TagType = 'default' | 'primary' | 'success' | 'danger' | 'warning';
export interface CustomColor extends CSSProperties {
  backgroundColor: string;
  borderColor: string;
  color: string;
}
