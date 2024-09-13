import {
  defineComponent,
  h,
  inject,
  PropType,
  renderSlot,
  Fragment,
  computed,
  ExtractPropTypes,
  ComponentPublicInstance
} from 'vue';

import style from './timelineItem.scss';
import { TimelinePosition } from './interface';
import { stepsPosition } from '../steps/interface';
const timelineItemProps = {
  position: {
    type: String as PropType<TimelinePosition>,
    default: null
  },
  width: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  color: String
};
const setup = (props: ExtractPropTypes<typeof timelineItemProps>) => {
  const parentPosition = inject('position');
  const parentDirection = inject('direction');
  const validPosition = computed(() => {
    let position = props.position || parentPosition;
    if (!stepsPosition.includes(position)) {
      position = 'right';
    }
    return position;
  });
  return { validPosition, direction: parentDirection };
};
const TimelineItem = defineComponent({
  __STYLE__: style,
  name: 'TimelineItem',
  props: timelineItemProps,
  setup,
  render() {
    if (this.direction === 'horizontal') {
      return renderHorizontal(this);
    }
    return renderVertical(this);
  }
});

function renderVertical(
  instance: ComponentPublicInstance<
    ExtractPropTypes<typeof timelineItemProps>,
    ReturnType<typeof setup>
  >
) {
  const position = instance.validPosition;
  const color = instance.color;
  return (
    <div class={['lee-timeline-item']}>
      <div class={['lee-timeline-cell', 'lee-timeline-left-cell']}>
        {position === 'left' ? renderCellSlot(instance) : null}
      </div>
      <div class={['lee-timeline-cell']}>
        <div class={['lee-timeline-dot']} style={{ borderColor: color ? color : undefined }}></div>
        <div class={['lee-timeline-line']}></div>
      </div>
      <div class={['lee-timeline-cell', 'lee-timeline-right-cell']}>
        {position === 'right' ? renderCellSlot(instance) : null}
      </div>
    </div>
  );
}

function renderHorizontal(
  instance: ComponentPublicInstance<
    ExtractPropTypes<typeof timelineItemProps>,
    ReturnType<typeof setup>
  >
) {
  const width = instance.width;
  const color = instance.color;
  return (
    <div class={['lee-h-timeline-item']} style={{ width: width ? width : undefined }}>
      <div class={['lee-h-timeline-cell']}>
        <div class={['lee-h-timeline-line']}></div>
        <div
          class={['lee-h-timeline-dot']}
          style={{ borderColor: color ? color : undefined }}
        ></div>
        {renderCellSlot(instance)}
      </div>
    </div>
  );
}

function renderCellSlot(
  instance: ComponentPublicInstance<
    ExtractPropTypes<typeof timelineItemProps>,
    ReturnType<typeof setup>
  >
) {
  const slots = renderSlot(instance.$slots, 'default');
  const cell = { title: instance.title, content: instance.content, time: instance.time };
  if (slots?.children?.length) {
    return slots;
  }
  return (
    <>
      {cell?.title ? <p class={['lee-timeline-cell-title']}>{cell.title}</p> : null}
      {cell?.content ? <p class={['lee-timeline-cell-content']}>{cell.content}</p> : null}
      {cell?.time ? <p class={['lee-timeline-cell-time']}>{cell.time}</p> : null}
    </>
  );
}

export default TimelineItem;
