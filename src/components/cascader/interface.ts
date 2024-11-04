import { Placement } from '@floating-ui/vue';
import { Ref } from 'vue';

export const placementPropList: Placement[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end'
];

export type OptionItem = {
  text?: string;
  key?: number | string;
  disabled?: boolean;
  children?: Array<OptionItem>;
  [p: string]: any;
};

export type CascaderEmitsType = 'select' | 'update:value';

export const cascaderEmitsList = ['select', 'update:value'];

export type CascaderProvideType = { selectPath: Ref<OptionItem[]> };
