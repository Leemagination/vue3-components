import { Ref } from 'vue';

export interface RadioGroupProvideType {
  radioValue: Ref<string | number | undefined>;
  disabledStatus: Ref<boolean>;
  groupName: Ref<string | undefined>;
  updateGroupValue: (p: string | number | undefined) => void;
}
