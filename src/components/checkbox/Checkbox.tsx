import {
  defineComponent,
  ExtractPropTypes,
  SetupContext,
  h,
  ref,
  renderSlot,
  onBeforeMount,
  watch,
  inject,
  computed
} from 'vue';

import style from './checkbox.scss';
import { CheckboxGroupProvideType } from './interface';

const checkboxProps = {
  checked: Boolean,
  value: [String, Number],
  disabled: Boolean
};

const setup = (props: ExtractPropTypes<typeof checkboxProps>, context: SetupContext) => {
  const config = inject<CheckboxGroupProvideType>('checkboxGroupProvideKey');

  const checkStatus = ref(false);

  onBeforeMount(() => {
    if (props.checked) {
      checkStatus.value = true;
      updateParentGroupValue();
    }
  });

  watch(checkStatus, (val) => {
    context.emit('update:checked', val);
  });

  watch(
    () => config?.checkGroupValue,
    (val) => {
      if (val && Array.isArray(val?.value)) {
        if (val.value.includes(props.value!) && !checkStatus.value) {
          checkStatus.value = true;
        }
        if (!val.value.includes(props.value!) && checkStatus.value) {
          checkStatus.value = false;
        }
      }
    },
    {
      deep: true,
      immediate: true
    }
  );

  watch(
    () => props.checked,
    () => {
      checkStatus.value = props.checked;
    }
  );

  function changeCheckboxStatus(status: boolean) {
    checkStatus.value = status;
    context.emit('change', checkStatus.value);
    updateParentGroupValue();
  }

  function updateParentGroupValue() {
    if (config?.updateGroupValue) {
      config.updateGroupValue({ val: props.value, checked: checkStatus.value });
    }
  }

  const disabledStatus = computed(() => {
    return props.disabled || config?.disabledStatus.value;
  });
  function handleClick(e: MouseEvent): void {
    if (disabledStatus.value) {
      return;
    }
    changeCheckboxStatus(!checkStatus.value);
  }

  return {
    checkStatus,
    handleClick,
    disabledStatus
  };
};

const defaultIcon = (
  <svg viewBox="0 0 64 64" class="check-icon">
    <path
      fill="currentColor"
      d="M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z"
    ></path>
  </svg>
);

const Checkbox = defineComponent({
  __STYLE__: style,
  name: 'Checkbox',
  props: checkboxProps,
  emits: ['update:checked', 'change'],
  setup,
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return (
      <div
        class={['lee-checkbox', this.disabledStatus ? 'lee-checkbox-disabled' : '']}
        onClick={(ev) => {
          this.handleClick(ev);
        }}
      >
        <span class={['lee-checkbox-point', this.checkStatus ? 'lee-checkbox-checked' : '']}>
          {this.checkStatus ? defaultIcon : null}
        </span>
        <span class={['lee-checkbox-label']}>{slot}</span>
      </div>
    );
  }
});

export default Checkbox;
