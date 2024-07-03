import {
  defineComponent,
  h,
  Teleport,
  Transition,
  Fragment,
  ref,
  computed,
  ExtractPropTypes,
  useModel,
  PropType
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import './timePicker.scss';
import NumList from './NumList';

const timeIcon = (
  <svg class="lee-time-picker-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      d="M256,64C150,64,64,150,64,256s86,192,192,192,192-86,192-192S362,64,256,64Z"
      style="fill: none; stroke: currentcolor; stroke-miterlimit: 10; stroke-width: 32px;"
    ></path>
    <polyline
      points="256 128 256 272 352 272"
      style="fill: none; stroke: currentcolor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
    ></polyline>
  </svg>
);

const timePickerProps = {
  value: {
    type: Array as PropType<Array<number> | null>,
    default: null
  },
  disabled: Boolean,
  clearable: Boolean
};

function formatTimeText(val: number) {
  if (val > 9) {
    return `${val}`;
  }
  return `0${val}`;
}

const setup = (props: ExtractPropTypes<typeof timePickerProps>) => {
  const timeValue = useModel(props, 'value');
  const timeText = computed(() => {
    if (Array.isArray(timeValue.value)) {
      const arr = [...timeValue.value];
      while (arr.length < 3) {
        arr.push(0);
      }
      return arr
        .slice(0, 3)
        .map((item) => formatTimeText(item))
        .join(':');
    }
    return '';
  });
  const hourValue = computed(() => {
    return timeValue.value?.[0] ?? null;
  });
  const minuteValue = computed(() => {
    return timeValue.value?.[1] ?? null;
  });
  const secondValue = computed(() => {
    return timeValue.value?.[2] ?? null;
  });

  function setHour(val: number) {
    if (Array.isArray(timeValue.value)) {
      timeValue.value[0] = val;
    } else {
      timeValue.value = [val, 0, 0];
    }
  }
  function setMinute(val: number) {
    if (Array.isArray(timeValue.value)) {
      timeValue.value[1] = val;
    } else {
      timeValue.value = [0, val, 0];
    }
  }
  function setSecond(val: number) {
    if (Array.isArray(timeValue.value)) {
      timeValue.value[2] = val;
    } else {
      timeValue.value = [0, 0, val];
    }
  }

  const pickerVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const zIndex = ref(createZIndex());
  const targetRef = ref<Element | null>(null);
  const floatRef = ref<HTMLElement>();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [flip()]
  });

  const zIndexStyle = computed(() => {
    return { zIndex: zIndex.value };
  });

  function windowClickListener(el: MouseEvent) {
    const target = el.target as HTMLElement;
    if (target) {
      if (!floatRef.value?.contains(target) && !targetRef.value?.contains(target)) {
        handlePickerVisible(false);
      }
    }
  }

  function handlePickerVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    pickerVisible.value = typeof visible === 'boolean' ? visible : !pickerVisible.value;
    clearTimeout(transitionTimer);
    if (pickerVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (pickerVisible.value) {
      window.addEventListener('click', windowClickListener, { capture: true });
    } else {
      window.removeEventListener('click', windowClickListener);
    }
  }

  const hoverStatus = ref(false);

  function changeHoverStatus(status: boolean) {
    hoverStatus.value = status;
  }

  return {
    timeText,
    floatRef,
    targetRef,
    transitionVisible,
    pickerVisible,
    zIndexStyle,
    floatingStyles,
    hourValue,
    minuteValue,
    secondValue,
    setHour,
    setMinute,
    setSecond,
    changeHoverStatus,
    handlePickerVisible
  };
};

const TimePicker = defineComponent({
  name: 'TimePicker',
  props: timePickerProps,
  setup,
  render() {
    return (
      <>
        <div
          onMouseenter={() => this.changeHoverStatus(true)}
          onMouseleave={() => this.changeHoverStatus(false)}
          ref="targetRef"
          class={['lee-time-picker-container', this.disabled ? 'lee-time-picker-disabled' : null]}
          tabindex="0"
          onClick={() => this.handlePickerVisible()}
        >
          <span class="lee-time-picker-value">{this.timeText}</span>
          {timeIcon}
        </div>
        <Teleport to="body">
          <Transition name="lee-time-picker-fade">
            {this.pickerVisible || this.transitionVisible ? (
              <div style={this.zIndexStyle}>
                <div
                  onMouseenter={() => this.changeHoverStatus(true)}
                  onMouseleave={() => this.changeHoverStatus(false)}
                  ref="floatRef"
                  class="lee-time-picker-wrapper"
                  style={this.floatingStyles}
                >
                  <NumList maxNum={24} activeNum={this.hourValue} onClick={this.setHour}></NumList>
                  <NumList
                    maxNum={60}
                    activeNum={this.minuteValue}
                    onClick={this.setMinute}
                  ></NumList>
                  <NumList
                    maxNum={60}
                    activeNum={this.secondValue}
                    onClick={this.setSecond}
                  ></NumList>
                </div>
              </div>
            ) : null}
          </Transition>
        </Teleport>
      </>
    );
  }
});

export default TimePicker;
