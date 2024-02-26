import { Ref } from 'vue';

export interface RadioGroupProvideType {
  disabledStatus: Ref<boolean>;
  groupName: Ref<string | undefined>;
  updateGroupValue: (p: string | number | undefined) => void;
}
