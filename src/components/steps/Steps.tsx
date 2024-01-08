import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  h,
  PropType,
  provide,
  renderSlot
} from 'vue';

import './steps.scss';
import { getPropsValue } from '../../util';
import { StepsDirection, stepsDirection, StepsPosition, stepsPosition } from './interface';
const stepsPros = {
  current: {
    type: Number,
    default: 0
  },
  direction: {
    type: String as PropType<StepsDirection>,
    default: 'vertical'
  },
  position: {
    type: String as PropType<StepsPosition>,
    default: 'right'
  }
};
const Steps = defineComponent({
  name: 'Steps',
  props: stepsPros,
  setup(props) {
    const direction = computed(() => {
      return getPropsValue(props.direction, stepsDirection);
    });
    const position = computed(() => {
      return getPropsValue(props.position, stepsPosition);
    });
    provide('position', position.value);
    provide('direction', direction.value);
    provide('stepCurrentIndex', props.current);
    return { direction };
  },
  render() {
    if (this.direction === 'horizontal') {
      return renderHorizontal(this);
    }
    return renderVertical(this);
  }
});

function renderHorizontal(instance: ComponentPublicInstance) {
  const slots = handleSlot(instance);
  return <div class={['lee-h-steps-container']}>{slots}</div>;
}

function renderVertical(instance: ComponentPublicInstance) {
  const slots = handleSlot(instance);
  return (
    <div class={['lee-steps-container']}>
      <div class={['lee-steps-left-area']}></div>
      <div class={['lee-steps-dot-area']}></div>
      <div class={['lee-steps-right-area']}></div>
      {slots}
    </div>
  );
}

function handleSlot(instance: ComponentPublicInstance) {
  const slots = renderSlot(instance.$slots, 'default');
  if (slots?.children?.length) {
    Array.prototype.forEach.call(slots.children, (item, index) => {
      if (typeof item.props === 'object') {
        item.props = { ...item.props, stepIndex: index + 1 };
      } else {
        item.props = {
          stepIndex: index + 1
        };
      }
    });
  }
  return slots;
}

export default Steps;
