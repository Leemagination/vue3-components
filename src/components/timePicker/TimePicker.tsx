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
  PropType,
  watch,
  nextTick,
  StyleValue
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import style from './timePicker.scss';
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
  placeholder: {
    type: String,
    default: '请选择时间'
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

const clearIcon = (
  <span class="lee-time-picker-clear-icon">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 12 12"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor" fill-rule="nonzero">
          <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
        </g>
      </g>
    </svg>
  </span>
);

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

  const hourListRef = ref<InstanceType<typeof NumList> | null>(null);
  const minuteListRef = ref<InstanceType<typeof NumList> | null>(null);
  const secondListRef = ref<InstanceType<typeof NumList> | null>(null);

  const mouseHover = ref(false);
  const showClearIcon = computed(() => {
    if (mouseHover.value && props.clearable && timeText.value) {
      return true;
    }
    return false;
  });

  function changeHoverStatus(status: boolean) {
    mouseHover.value = status;
  }

  function clearTimeValue(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    timeValue.value = null;
  }

  watch(timeText, async () => {
    await nextTick();
    hourListRef.value?.scrollActiveItem();
    minuteListRef.value?.scrollActiveItem();
    secondListRef.value?.scrollActiveItem();
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

  const zIndexStyle = computed<StyleValue>(() => {
    return { zIndex: zIndex.value, position: 'relative' };
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
    hourListRef,
    minuteListRef,
    secondListRef,
    showClearIcon,
    changeHoverStatus,
    clearTimeValue,
    setHour,
    setMinute,
    setSecond,
    handlePickerVisible
  };
};

const TimePicker = defineComponent({
  __STYLE__: style,
  name: 'TimePicker',
  props: timePickerProps,
  setup,
  render() {
    return (
      <>
        <div
          ref="targetRef"
          class={['lee-time-picker-container', this.disabled ? 'lee-time-picker-disabled' : null]}
          tabindex="0"
          onMouseenter={() => this.changeHoverStatus(true)}
          onMouseleave={() => this.changeHoverStatus(false)}
          onClick={() => this.handlePickerVisible()}
        >
          <span class="lee-time-picker-value">{this.timeText}</span>
          {this.showClearIcon ? <clearIcon onClick={this.clearTimeValue}></clearIcon> : timeIcon}
          {this.timeText ? null : <div class="lee-time-picker-placeholder">{this.placeholder}</div>}
        </div>
        <Teleport to="body">
          <Transition name="lee-time-picker-fade">
            {this.pickerVisible || this.transitionVisible ? (
              <div style={this.zIndexStyle}>
                <div ref="floatRef" class="lee-time-picker-content" style={this.floatingStyles}>
                  <div class="lee-time-picker-list-wrapper">
                    <NumList
                      ref="hourListRef"
                      maxNum={24}
                      activeNum={this.hourValue}
                      onClick={this.setHour}
                    ></NumList>
                    <NumList
                      ref="minuteListRef"
                      maxNum={60}
                      activeNum={this.minuteValue}
                      onClick={this.setMinute}
                    ></NumList>
                    <NumList
                      ref="secondListRef"
                      maxNum={60}
                      activeNum={this.secondValue}
                      onClick={this.setSecond}
                    ></NumList>
                  </div>
                  <div class="lee-time-picker-button-wrapper">
                    <div
                      class="lee-time-picker-button__confirm"
                      onClick={() => this.handlePickerVisible(false)}
                    >
                      确认
                    </div>
                  </div>
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
