import {
  defineComponent,
  ExtractPropTypes,
  SetupContext,
  h,
  Fragment,
  ref,
  PropType,
  renderSlot,
  Ref,
  onBeforeMount,
  watch
} from 'vue';

import './radio.scss';

const nameMap: { [p: string]: { ref: Ref<boolean>; value: string | number | undefined }[] } = {};

const radioProps = {
  checked: Boolean,
  value: [String, Number],
  disabled: Boolean,
  label: String,
  name: String
};

const setup = (props: ExtractPropTypes<typeof radioProps>, context: SetupContext) => {
  const checkStatus = ref(false);
  const radioName = props.name || 'lee-radio';

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
  }
  function handleClick(e: MouseEvent): void {
    if (props.disabled) {
      return;
    }
    changeRadioStatus();
  }

  return {
    checkStatus,
    handleClick
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
        class={['lee-radio', this.disabled ? 'lee-radio-disabled' : '']}
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
