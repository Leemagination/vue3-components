import {
  computed,
  defineComponent,
  h,
  PropType,
  ref,
  Teleport,
  Transition,
  Fragment,
  watch,
  nextTick,
  ExtractPropTypes,
  SetupContext
} from 'vue';
import { Dayjs } from 'dayjs';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import NumList from './NumList';
import './dateText.scss';
import { dateTextEmits, DateTextEmitsType } from './interface';
const dateTextProps = {
  currentDate: {
    type: Object as PropType<Dayjs> | null,
    default: null
  }
};

const setup = (
  props: ExtractPropTypes<typeof dateTextProps>,
  context: SetupContext<Array<DateTextEmitsType>>
) => {
  const pickerVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const zIndex = ref(createZIndex());
  const targetRef = ref<Element | null>(null);
  const floatRef = ref<HTMLElement>();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'bottom',
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

  const yearListRef = ref<InstanceType<typeof NumList> | null>(null);
  const monthListRef = ref<InstanceType<typeof NumList> | null>(null);

  const yearValue = computed(() => {
    if (props.currentDate) {
      return props.currentDate.get('year');
    }
    return null;
  });
  const monthValue = computed(() => {
    if (props.currentDate) {
      return props.currentDate.get('month') + 1;
    }
    return null;
  });

  watch(
    () => props.currentDate,
    async () => {
      await nextTick();
      yearListRef.value?.scrollActiveItem();
      monthListRef.value?.scrollActiveItem();
    }
  );

  function setYear(val: number) {
    console.log(val);
    context.emit('yearClick', val);
  }
  function setMonth(val: number) {
    console.log(val);
    context.emit('monthClick', val - 1);
  }

  return {
    transitionVisible,
    pickerVisible,
    targetRef,
    floatRef,
    floatingStyles,
    zIndexStyle,
    yearListRef,
    monthListRef,
    yearValue,
    monthValue,
    setYear,
    setMonth,
    handlePickerVisible
  };
};

const DateText = defineComponent({
  name: 'DateText',
  props: dateTextProps,
  emits: dateTextEmits,
  setup,
  render() {
    return (
      <>
        <div class="lee-calendar-picker-header__current-date">
          <span ref="targetRef" onClick={() => this.handlePickerVisible()}>
            {this.currentDate.format('YYYY年MM月')}
          </span>
        </div>
        <Teleport to="body">
          <Transition name="lee-date-text-fade">
            {this.pickerVisible || this.transitionVisible ? (
              <div style={this.zIndexStyle}>
                <div ref="floatRef" class="lee-date-text-content" style={this.floatingStyles}>
                  <div class="lee-date-text-list-wrapper" onClick={(ev) => ev.stopPropagation()}>
                    <NumList
                      ref="yearListRef"
                      minNum={1900}
                      maxNum={2099}
                      activeNum={this.yearValue}
                      onClick={this.setYear}
                    ></NumList>
                    <NumList
                      ref="monthListRef"
                      minNum={1}
                      maxNum={12}
                      activeNum={this.monthValue}
                      onClick={this.setMonth}
                    ></NumList>
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

export default DateText;
