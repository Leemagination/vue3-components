import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  StyleValue,
  Teleport,
  Transition,
  useModel
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import './datePicker.scss';
import CalendarPicker from './CalendarPicker';
import dayjs, { Dayjs } from 'dayjs';
import TimePicker from './TimePicker';

const calendarIcon = (
  <svg
    class="lee-date-picker-icon"
    width="28px"
    height="28px"
    viewBox="0 0 28 28"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke="none" stroke-width="1" fill-rule="evenodd" fill="currentColor">
      <g fill-rule="nonzero">
        <path d="M21.75,3 C23.5449254,3 25,4.45507456 25,6.25 L25,21.75 C25,23.5449254 23.5449254,25 21.75,25 L6.25,25 C4.45507456,25 3,23.5449254 3,21.75 L3,6.25 C3,4.45507456 4.45507456,3 6.25,3 L21.75,3 Z M23.5,9.503 L4.5,9.503 L4.5,21.75 C4.5,22.7164983 5.28350169,23.5 6.25,23.5 L21.75,23.5 C22.7164983,23.5 23.5,22.7164983 23.5,21.75 L23.5,9.503 Z M21.75,4.5 L6.25,4.5 C5.28350169,4.5 4.5,5.28350169 4.5,6.25 L4.5,8.003 L23.5,8.003 L23.5,6.25 C23.5,5.28350169 22.7164983,4.5 21.75,4.5 Z"></path>
      </g>
    </g>
  </svg>
);

const clearIcon = (
  <span class="lee-date-picker-clear-icon">
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

const DatePickerProps = {
  value: {
    type: Number as PropType<number | null>,
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  showTime: Boolean,
  disabled: Boolean,
  clearable: Boolean
};

const setup = (props: ExtractPropTypes<typeof DatePickerProps>) => {
  const dateValue = useModel(props, 'value');
  const selectingValue = ref<Dayjs | null>(null);
  const dateText = computed(() => {
    if (selectingValue.value) {
      return selectingValue.value.format('YYYY-MM-DD HH:mm:ss');
    }
    if (dateValue.value) {
      return dayjs(dateValue.value).format(props.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
    }
    return '';
  });
  const calendarTimestamp = computed(() => {
    if (selectingValue.value) {
      return selectingValue.value.valueOf();
    }
    return dateValue.value;
  });

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
    if (!visible) {
      selectingValue.value = null;
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
      window.addEventListener('click', windowClickListener);
    } else {
      window.removeEventListener('click', windowClickListener);
    }
  }

  function handleDateClick(date: Dayjs) {
    if (props.showTime) {
      if (selectingValue.value) {
        selectingValue.value = date
          .set('hour', selectingValue.value.get('hour'))
          .set('minute', selectingValue.value.get('minute'))
          .set('second', selectingValue.value.get('second'));
      } else {
        selectingValue.value = date;
      }
    } else {
      dateValue.value = date.valueOf();
    }
  }

  function clearDateValue(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    dateValue.value = null;
  }

  const mouseHover = ref(false);
  const showClearIcon = computed(() => {
    if (mouseHover.value && props.clearable && dateText.value) {
      return true;
    }
    return false;
  });

  function changeHoverStatus(status: boolean) {
    mouseHover.value = status;
  }

  function handleNowClick() {
    let date = dayjs();
    if (!props.showTime) {
      date = date.startOf('day');
    }
    dateValue.value = date.valueOf();
    handlePickerVisible(false);
  }

  const timePickerValue = computed(() => {
    if (selectingValue.value) {
      return [
        selectingValue.value.get('hour'),
        selectingValue.value.get('minute'),
        selectingValue.value.get('second')
      ];
    }
    if (dateValue.value) {
      const date = dayjs(dateValue.value);
      return [date.get('hour'), date.get('minute'), date.get('second')];
    }
    return null;
  });

  function handleConfirmClick() {
    if (selectingValue.value) {
      dateValue.value = selectingValue.value.valueOf();
    }
    handlePickerVisible(false);
  }

  function handleTimeChange(val: Array<number>) {
    const target = dayjs(dateValue.value ?? undefined);
    selectingValue.value = target.set('hour', val[0]).set('minute', val[1]).set('second', val[2]);
  }

  return {
    showClearIcon,
    dateValue,
    dateText,
    pickerVisible,
    transitionVisible,
    targetRef,
    floatRef,
    floatingStyles,
    zIndexStyle,
    timePickerValue,
    calendarTimestamp,
    handlePickerVisible,
    handleDateClick,
    changeHoverStatus,
    clearDateValue,
    handleNowClick,
    handleConfirmClick,
    handleTimeChange
  };
};

const DatePicker = defineComponent({
  name: 'DatePicker',
  props: DatePickerProps,
  setup,
  render() {
    return (
      <>
        <div
          ref="targetRef"
          class={['lee-date-picker-container', this.disabled ? 'lee-date-picker-disabled' : null]}
          tabindex="0"
          onMouseenter={() => this.changeHoverStatus(true)}
          onMouseleave={() => this.changeHoverStatus(false)}
          onClick={() => this.handlePickerVisible()}
        >
          <span class="lee-date-picker-value">{this.dateText}</span>
          {this.showClearIcon ? (
            <clearIcon onClick={this.clearDateValue}></clearIcon>
          ) : (
            calendarIcon
          )}
          {this.dateText ? null : <div class="lee-date-picker-placeholder">{this.placeholder}</div>}
        </div>
        <Teleport to="body">
          <Transition name="lee-date-picker-fade">
            {this.pickerVisible || this.transitionVisible ? (
              <div style={this.zIndexStyle}>
                <div ref="floatRef" class="lee-date-picker-content" style={this.floatingStyles}>
                  <CalendarPicker
                    timestamp={this.calendarTimestamp}
                    onDateClick={this.handleDateClick}
                  ></CalendarPicker>
                  <div class="lee-date-picker-footer">
                    {this.showTime ? (
                      <TimePicker
                        value={this.timePickerValue}
                        onUpdate:value={this.handleTimeChange}
                      ></TimePicker>
                    ) : null}
                    <div class="lee-date-picker-button-wrapper">
                      <div
                        class="lee-date-picker-button__normal"
                        onClick={() => this.handleNowClick()}
                      >
                        此刻
                      </div>
                      {this.showTime ? (
                        <div
                          class="lee-date-picker-button__confirm"
                          onClick={() => this.handleConfirmClick()}
                        >
                          确认
                        </div>
                      ) : null}
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

export default DatePicker;
