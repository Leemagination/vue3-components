import { computed, defineComponent, h, PropType, provide, renderSlot, VNode } from 'vue';
import { cssPrefix } from '../../config/globalConfig';
import './timeline.scss';
import { getPropsValue } from '../../util';
import {
  timelineDirection,
  TimelineDirection,
  TimelinePosition,
  timelinePosition
} from './interface';
const timelinePros = {
  direction: {
    type: String as PropType<TimelineDirection>,
    default: 'vertical'
  },
  position: {
    type: String as PropType<TimelinePosition>,
    default: 'right'
  }
};
const Timeline = defineComponent({
  name: 'Timeline',
  props: timelinePros,
  setup(props) {
    const direction = computed(() => {
      return getPropsValue(props.direction, timelineDirection);
    });
    const position = computed(() => {
      return getPropsValue(props.position, timelinePosition);
    });
    provide('position', position.value);
    provide('direction', direction.value);
    return { direction };
  },
  render() {
    const $slot = renderSlot(this.$slots, 'default');
    if (this.direction === 'horizontal') {
      return renderHorizontal($slot);
    }
    return renderVertical($slot);
  }
});

function renderHorizontal($slot: VNode) {
  return <div class={[`${cssPrefix}-h-timeline-container`]}>{$slot}</div>;
}

function renderVertical($slot: VNode) {
  return (
    <div class={[`${cssPrefix}-timeline-container`]}>
      <div class={[`${cssPrefix}-timeline-left-area`]}></div>
      <div class={[`${cssPrefix}-timeline-dot-area`]}></div>
      <div class={[`${cssPrefix}-timeline-right-area`]}></div>
      {$slot}
    </div>
  );
}

export default Timeline;
