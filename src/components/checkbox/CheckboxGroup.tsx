import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  provide,
  ref,
  renderSlot,
  SetupContext,
  watch
} from 'vue';
import { CheckboxGroupProvideType } from './interface';

const checkboxGroupProps = {
  value: Array as PropType<Array<number | string>>,
  disabled: Boolean
};

const setup = (props: ExtractPropTypes<typeof checkboxGroupProps>, context: SetupContext) => {
  const disabledStatus = computed(() => props.disabled);
  const checkGroupValue = ref<Array<string | number>>([]);

  watch(
    () => props.value,
    (val) => {
      if (Array.isArray(val)) {
        checkGroupValue.value = [...val];
      }
    },
    {
      immediate: true
    }
  );
  function updateGroupValue(data: { val: string | number | undefined; checked: boolean }) {
    if (data.val !== undefined) {
      const targetIndex = checkGroupValue.value.findIndex((item) => item === data.val);
      if (targetIndex === -1 && data.checked) {
        checkGroupValue.value.push(data.val);
      }
      if (targetIndex !== -1 && !data.checked) {
        checkGroupValue.value.splice(targetIndex, 1);
      }
    }
    context.emit('update:value', checkGroupValue.value);
  }

  provide<CheckboxGroupProvideType>('checkboxGroupProvideKey', {
    disabledStatus,
    updateGroupValue,
    checkGroupValue
  });
  return {};
};

const CheckboxGroup = defineComponent({
  name: 'CheckboxGroup',
  props: checkboxGroupProps,
  emits: ['update:value', 'change'],
  setup,
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return <div class="lee-checkbox-group">{slot}</div>;
  }
});

export default CheckboxGroup;
