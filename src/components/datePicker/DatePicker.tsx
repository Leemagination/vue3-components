import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  Teleport,
  Transition,
  useModel
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import './datePicker.scss';
import CalendarPicker from './CalendarPicker';
import dayjs, { Dayjs } from 'dayjs';

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

const DatePickerProps = {
  value: {
    type: Number as PropType<number | null>,
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  disabled: Boolean,
  clearable: Boolean
};

const setup = (props: ExtractPropTypes<typeof DatePickerProps>) => {
  const dateValue = useModel(props, 'value');
  const dateText = computed(() => {
    if (dateValue.value) {
      return dayjs(dateValue.value).format('YYYY-MM-DD');
    }
    return '';
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
      window.addEventListener('click', windowClickListener);
    } else {
      window.removeEventListener('click', windowClickListener);
    }
  }

  function handleDateClick(date: Dayjs) {
    dateValue.value = date.valueOf();
  }

  return {
    dateValue,
    dateText,
    pickerVisible,
    transitionVisible,
    targetRef,
    floatRef,
    floatingStyles,
    zIndexStyle,
    handlePickerVisible,
    handleDateClick
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
          onClick={() => this.handlePickerVisible()}
        >
          <span class="lee-date-picker-value">{this.dateText}</span>
          {calendarIcon}
          {this.dateText ? null : <div class="lee-date-picker-placeholder">{this.placeholder}</div>}
        </div>
        <Teleport to="body">
          <Transition name="lee-date-picker-fade">
            {this.pickerVisible || this.transitionVisible ? (
              <div style={this.zIndexStyle}>
                <div ref="floatRef" class="lee-date-picker-content" style={this.floatingStyles}>
                  <CalendarPicker
                    timestamp={this.dateValue}
                    onDateClick={this.handleDateClick}
                  ></CalendarPicker>
                  <div class="lee-date-picker-button-wrapper">
                    <div
                      class="lee-date-picker-button__confirm"
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

export default DatePicker;
