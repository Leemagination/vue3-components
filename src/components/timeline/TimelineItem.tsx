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
import { cssPrefix } from '../../config/globalConfig';
import './timelineItem.scss';
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
    <div class={[`${cssPrefix}-timeline-item`]}>
      <div class={[`${cssPrefix}-timeline-cell`, `${cssPrefix}-timeline-left-cell`]}>
        {position === 'left' ? renderCellSlot(instance) : null}
      </div>
      <div class={[`${cssPrefix}-timeline-cell`]}>
        <div
          class={[`${cssPrefix}-timeline-dot`]}
          style={{ borderColor: color ? color : undefined }}
        ></div>
        <div class={[`${cssPrefix}-timeline-line`]}></div>
      </div>
      <div class={[`${cssPrefix}-timeline-cell`, `${cssPrefix}-timeline-right-cell`]}>
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
    <div class={[`${cssPrefix}-h-timeline-item`]} style={{ width: width ? width : undefined }}>
      <div class={[`${cssPrefix}-h-timeline-cell`]}>
        <div class={[`${cssPrefix}-h-timeline-line`]}></div>
        <div
          class={[`${cssPrefix}-h-timeline-dot`]}
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
      {cell?.title ? <p class={[`${cssPrefix}-timeline-cell-title`]}>{cell.title}</p> : null}
      {cell?.content ? <p class={[`${cssPrefix}-timeline-cell-content`]}>{cell.content}</p> : null}
      {cell?.time ? <p class={[`${cssPrefix}-timeline-cell-time`]}>{cell.time}</p> : null}
    </>
  );
}

export default TimelineItem;
