import { Ref } from 'vue';

export interface CheckboxGroupProvideType {
  disabledStatus: Ref<boolean>;
  updateGroupValue: (p: { val: string | number | undefined; checked: boolean }) => void;
  checkGroupValue: Ref<Array<string | number>>;
}
