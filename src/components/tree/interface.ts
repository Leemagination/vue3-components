import { Ref } from 'vue';

export interface TreeDataItem {
  label: string;
  key: string | number;
  children: TreeDataItem[] | null | undefined;
}

export interface TreeNodeDataItem extends TreeDataItem {
  expanded: Ref<boolean>;
  checkStatus: Ref<CheckboxType>;
  __TREE_LEVEL__: number;
  __PARENT_EXPANDED__?: Ref<boolean>;
}

export const enum CheckboxType {
  uncheck = 0,
  allCheck = 1,
  halfCheck = 2
}
