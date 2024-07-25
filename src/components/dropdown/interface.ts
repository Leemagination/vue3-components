import { Placement } from '@floating-ui/vue';

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

export type TriggerType = 'click' | 'hover';

export const triggerPropList: TriggerType[] = ['click', 'hover'];

export type OptionItem = {
  text?: string;
  key?: number | string;
  disabled?: boolean;
  children?: Array<OptionItem>;
  [p: string]: any;
};

export type DropdownEmitsType = 'select';

export const dropdownEmitsList = ['select'];
