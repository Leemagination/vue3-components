import {
  computed,
  defineComponent,
  h,
  onBeforeMount,
  PropType,
  ref,
  Slot,
  Slots,
  watch
} from 'vue';
import style from './slider.scss';

import { StepSlot, ValidSlots } from './interface';
const sliderProps = {
  disabled: Boolean,
  range: Boolean,
  value: {
    type: [Number, Array] as PropType<number | number[]>,
    default: 0
  },
  step: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 100
  },
  min: {
    type: Number,
    default: 0
  }
};
const Slider = defineComponent({
  __STYLE__: style,
  name: 'Slider',
  props: sliderProps,
  emits: ['update:value', 'change'],
  setup(props, context) {
    const rangeMode = computed(() => {
      return props.range;
    });
    const step = computed(() => {
      return props.step;
    });
    const sliderTrack = ref<HTMLElement | null>(null);
    const dragging = ref<undefined | 0 | 1>();
    onBeforeMount(() => {
      window.addEventListener('mouseup', () => {
        dragging.value = undefined;
      });
    });
    function handleDragStart(e: MouseEvent, type: 0 | 1) {
      if (props.disabled) {
        return;
      }
      e.stopPropagation();
      dragging.value = type;
    }
    function setDragLineValue(percent: number) {
      if (percent < lineValue.value[0] && dragging.value === 1) {
        dragging.value = 0;
        lineValue.value[1] = lineValue.value[0];
      }
      if (percent > lineValue.value[1] && dragging.value === 0) {
        dragging.value = 1;
        lineValue.value[0] = lineValue.value[1];
      }
      if (dragging.value !== undefined) {
        if (dragging.value === 1) {
          percent = getBoundaryValue('max', percent);
        }
        if (dragging.value === 0) {
          percent = getBoundaryValue('min', percent);
        }
        setLineValue(dragging.value, percent);
      }
    }
    function calDistance(e: MouseEvent) {
      const trackRect = sliderTrack.value?.getBoundingClientRect();
      if (!trackRect) return 0;
      trackRect.left;
      let distance = (e.clientX - trackRect.left) / trackRect.width;
      distance = Math.max(distance, 0);
      distance = Math.min(distance, 1);
      return Number((distance * 100).toFixed(1));
    }
    function draggingListener(e: MouseEvent) {
      const distance = calDistance(e);
      setDragLineValue(distance);
    }
    watch(
      () => dragging.value,
      (newValue, oldValue) => {
        if (dragging.value !== undefined) {
          if (oldValue === undefined) {
            window.addEventListener('mousemove', draggingListener);
          }
        } else {
          window.removeEventListener('mousemove', draggingListener);
        }
      }
    );
    const max = computed(() => {
      return Math.max(Math.min(props.max, 100), props.min);
    });
    const min = computed(() => {
      return Math.min(Math.max(props.min, 0), props.max);
    });

    function getBoundaryValue(type: 'max' | 'min', value: number): number {
      if (type === 'min') {
        return Math.min(Math.max(min.value, value), max.value);
      }
      if (type === 'max') {
        return Math.max(Math.min(max.value, value), min.value);
      }
      return 0;
    }
    const lineValue = ref<number[]>([]);
    watch(
      () => props.value,
      () => {
        calcLineValue(props.value);
      },
      { immediate: true }
    );
    function calcLineValue(val: number | number[]) {
      if (Array.isArray(val)) {
        const arr = val as number[];
        if (arr.length === 2) {
          if (rangeMode.value) {
            const [num1, num2] = arr.sort((a, b) => a - b);
            lineValue.value = [getBoundaryValue('min', num1), getBoundaryValue('max', num2)];
          } else {
            lineValue.value = [getBoundaryValue('min', 0), getBoundaryValue('max', arr[0])];
          }
        }
        if (arr.length === 1) {
          lineValue.value = [getBoundaryValue('min', 0), getBoundaryValue('max', arr[0])];
        }
      } else {
        const propsValue = val as number;
        lineValue.value = [getBoundaryValue('min', 0), getBoundaryValue('max', propsValue)];
      }
    }

    function handledTrackClick(e: MouseEvent) {
      const distance = calDistance(e);
      if (distance < lineValue.value[0]) {
        setLineValue(0, getBoundaryValue('min', distance));
        handleDragStart(e, 0);
      }
      if (distance > lineValue.value[1]) {
        setLineValue(1, getBoundaryValue('max', distance));
        handleDragStart(e, 1);
      }
      if (distance > lineValue.value[0] && distance < lineValue.value[1]) {
        if (rangeMode.value) {
          let order = 0;
          if (distance - lineValue.value[0] > lineValue.value[1] - distance) {
            order = 1;
          }
          setLineValue(order, distance);
          handleDragStart(e, order as 0 | 1);
          return;
        }
        setLineValue(1, distance);
        handleDragStart(e, 1);
      }
    }

    function setLineValue(order: number, distance: number) {
      if (props.disabled) {
        return;
      }
      const closestValue = calClosestValue(distance);
      if (lineValue.value[order] === closestValue) return;
      lineValue.value[order] = closestValue;
      if (rangeMode.value) {
        context.emit('update:value', [...lineValue.value]);
        context.emit('change', [...lineValue.value]);
        return;
      }
      context.emit('update:value', closestValue);
      context.emit('change', closestValue);
    }

    function calClosestValue(value: number) {
      const validStepValue: number[] = getValidStepSlots(context.slots).map((item) => item.order);
      const remainder = Number((value % step.value).toFixed(4));
      const additionalValue =
        remainder / step.value >= 0.5 ? step.value - remainder : remainder * -1;
      for (let i = 0; i < validStepValue.length; i++) {
        if (Math.abs(additionalValue) > Math.abs(value - validStepValue[i])) {
          return validStepValue[i];
        }
      }
      return Number((value + additionalValue).toFixed(4));
    }

    function getValidStepSlots(slots: Slots) {
      const result: StepSlot[] = [];
      Object.keys(slots).forEach((key) => {
        const reg = /step(\d|[1-9]\d|100)$/;
        const match = key.match(reg);
        if (match && slots[key]) {
          const order = match[1];
          result.push({
            order: Number(order),
            slot: slots[key] as Slot
          });
        }
      });
      return result.sort((a, b) => a.order - b.order);
    }

    function renderStep(slots: Slots) {
      const validSlots = getValidStepSlots(slots);
      const result: ValidSlots[] = validSlots.map((item) => (
        <div style={{ left: `${item.order}%` }} class={['lee-step-text']}>
          {item.slot()}
        </div>
      ));
      return result.length ? result : null;
    }

    function renderStepSpot(slots: Slots) {
      const validSlots = getValidStepSlots(slots);
      const result: ValidSlots[] = validSlots.map((item) => (
        <div style={{ left: `${item.order}%` }} class={['lee-step-spot']}></div>
      ));
      return result.length ? result : null;
    }

    return {
      lineValue,
      dragging,
      handleDragStart,
      sliderTrack,
      handledTrackClick,
      renderStep,
      renderStepSpot,
      getValidStepSlots
    };
  },
  render() {
    const lineLength = `${this.lineValue[1] - this.lineValue[0]}%`;
    const offset = `${this.lineValue[0]}%`;
    const { $slots } = this;
    const validStep = this.getValidStepSlots($slots);
    return (
      <div
        class={[
          'lee-slider',
          validStep.length ? 'lee-slider-step-margin' : null,
          this.disabled ? 'lee-slider--disabled' : null
        ]}
      >
        <div class={['lee-slider-track']} ref="sliderTrack" onMousedown={this.handledTrackClick}>
          {this.range ? (
            <div
              onMousedown={(e) => this.handleDragStart(e, 0)}
              class={[
                'lee-slider-drag-point',
                this.dragging === 0 ? 'lee-slider-dragging-point' : null
              ]}
              style={{ left: `${this.lineValue[0]}%` }}
            />
          ) : null}
          <div
            onMousedown={(e) => this.handleDragStart(e, 1)}
            class={[
              'lee-slider-drag-point',
              this.dragging === 1 ? 'lee-slider-dragging-point' : null
            ]}
            style={{ left: `${this.lineValue[1]}%` }}
          />
          <div class={['lee-slider-line']} style={{ width: lineLength, left: offset }} />
          {this.renderStepSpot($slots)}
        </div>
        <div class={['lee-slider-step']}>{this.renderStep($slots)}</div>
      </div>
    );
  }
});

export default Slider;
