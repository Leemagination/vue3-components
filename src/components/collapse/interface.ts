import { Ref } from 'vue';

export interface CollapseItem {
  name: string | symbol;
  status: Ref<boolean>;
}
export interface CollapseProvideType {
  changeItemStatus: (p: string | symbol) => void;
  addItemRef: (p: CollapseItem) => void;
}
