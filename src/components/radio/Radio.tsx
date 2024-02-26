import {
  defineComponent,
  ExtractPropTypes,
  SetupContext,
  h,
  Fragment,
  ref,
  renderSlot,
  Ref,
  onBeforeMount,
  watch,
  inject,
  computed
} from 'vue';

import './radio.scss';
import { RadioGroupProvideType } from './interface';

const nameMap: { [p: string]: { ref: Ref<boolean>; value: string | number | undefined }[] } = {};

const radioProps = {
  checked: Boolean,
  value: [String, Number],
  disabled: Boolean,
  label: String,
  name: String
};

const setup = (props: ExtractPropTypes<typeof radioProps>, context: SetupContext) => {
  const config = inject<RadioGroupProvideType>('radioGroupProvideKey');

  const checkStatus = ref(false);
  const radioName = config?.groupName.value || props.name || 'lee-radio';

  if (nameMap[radioName]) {
    nameMap[radioName].push({
      ref: checkStatus,
      value: props.value
    });
  } else {
    nameMap[radioName] = [
      {
        ref: checkStatus,
        value: props.value
      }
    ];
  }
  onBeforeMount(() => {
    if (props.checked) {
      changeRadioStatus();
    }
  });

  watch(checkStatus, (val) => {
    context.emit('update:checked', val);
  });

  watch(
    () => props.checked,
    () => {
      checkStatus.value = props.checked;
    }
  );

  function changeRadioStatus() {
    const arr = nameMap[radioName];
    arr.forEach((item) => {
      item.ref.value = false;
      if (item.value === props.value) {
        item.ref.value = true;
      }
    });
    checkStatus.value = true;
    context.emit('change', props.value);
    if (config?.updateGroupValue) {
      config.updateGroupValue(props.value);
    }
  }

  const disabledStatus = computed(() => {
    return props.disabled || config?.disabledStatus.value;
  });
  function handleClick(e: MouseEvent): void {
    if (disabledStatus.value) {
      return;
    }
    changeRadioStatus();
  }

  return {
    checkStatus,
    handleClick,
    disabledStatus
  };
};

const Radio = defineComponent({
  name: 'Radio',
  props: radioProps,
  emits: ['update:value', 'update:checked', 'change'],
  setup,
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    return (
      <div
        class={['lee-radio', this.disabledStatus ? 'lee-radio-disabled' : '']}
        onClick={(ev) => {
          this.handleClick(ev);
        }}
      >
        <span class={['lee-radio-point', this.checkStatus ? 'lee-radio-checked' : '']}></span>
        <span class={['lee-radio-label']}>{slot}</span>
      </div>
    );
  }
});

export default Radio;
