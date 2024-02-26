import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  provide,
  renderSlot,
  SetupContext
} from 'vue';
import { RadioGroupProvideType } from './interface';

const radioGroupProps = {
  name: String,
  value: [String, Number],
  disabled: Boolean
};

const setup = (props: ExtractPropTypes<typeof radioGroupProps>, context: SetupContext) => {
  const disabledStatus = computed(() => props.disabled);
  const groupName = computed(() => props.name);
  function updateGroupValue(val: string | number | undefined) {
    context.emit('update:value', val);
  }

  provide<RadioGroupProvideType>('radioGroupProvideKey', {
    disabledStatus,
    groupName,
    updateGroupValue
  });
  return {};
};

const RadioGroup = defineComponent({
  name: 'RadioGroup',
  props: radioGroupProps,
  emits: ['update:value', 'change'],
  setup,
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class="lee-radio-group">{slot}</div>;
  }
});

export default RadioGroup;
