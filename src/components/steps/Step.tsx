import {
  defineComponent,
  h,
  inject,
  PropType,
  renderSlot,
  Fragment,
  computed,
  ComponentPublicInstance,
  ExtractPropTypes
} from 'vue';
import { cssPrefix } from '../../config/globalConfig';
import './step.scss';
import { StepsPosition, stepsPosition, Status } from './interface';
import { MouseFunc } from '../../config/interface';

const stepProps = {
  position: {
    type: String as PropType<StepsPosition>,
    default: null
  },
  stepIndex: {
    type: Number
  },
  status: {
    type: String as PropType<Status>,
    default: 'default'
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
  onClick: Function as PropType<MouseFunc>
};

const setup = (props: ExtractPropTypes<typeof stepProps>) => {
  const parentPosition = inject('position');
  const parentDirection = inject('direction');
  const parentIndex = inject('stepCurrentIndex') as number;
  const validPosition = computed(() => {
    let position = props.position || parentPosition;
    if (!stepsPosition.includes(position)) {
      position = 'right';
    }
    return position;
  });

  const validStatus = computed(() => {
    if (!status.includes(props.status)) {
      return 'default';
    }
    return props.status;
  });

  function handleClick(e: MouseEvent): void {
    const { onClick } = props;
    onClick && onClick(e);
  }

  return { validPosition, direction: parentDirection, parentIndex, validStatus, handleClick };
};
const Step = defineComponent({
  name: 'Step',
  props: stepProps,
  setup,
  render() {
    if (this.direction === 'horizontal') {
      return renderHorizontal(this);
    }
    return renderVertical(this);
  }
});

function renderVertical(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof stepProps>, ReturnType<typeof setup>>
) {
  const validDotStatus = getStepStatus('dot', instance);
  const validLineStatus = getStepStatus('line', instance);
  const position = instance.validPosition;
  const index = instance.stepIndex;
  return (
    <div class={[`${cssPrefix}-step-item`]}>
      <div class={[`${cssPrefix}-step-cell`, `${cssPrefix}-step-left-cell`]}>
        {position === 'left' ? renderCellSlot(instance) : null}
      </div>
      <div class={[`${cssPrefix}-step-cell`]} onClick={(ev) => instance.handleClick(ev)}>
        <div
          class={[`${cssPrefix}-step-dot`, `${cssPrefix}-${validDotStatus}-step-dot`]}
          style={{ cursor: instance.onClick ? 'pointer' : undefined }}
        >
          {index}
        </div>
        <div class={[`${cssPrefix}-step-line`, `${cssPrefix}-${validLineStatus}-step-line`]}></div>
      </div>
      <div class={[`${cssPrefix}-step-cell`, `${cssPrefix}-step-right-cell`]}>
        {position === 'right' ? renderCellSlot(instance) : null}
      </div>
    </div>
  );
}

function renderHorizontal(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof stepProps>, ReturnType<typeof setup>>
) {
  const validDotStatus = getStepStatus('dot', instance);
  const validLineStatus = getStepStatus('line', instance);
  const width = instance.width;
  const index = instance.stepIndex;
  const handleClick = instance.handleClick;
  const title = instance.title;
  return (
    <div class={[`${cssPrefix}-h-step-item`]} style={{ width: width ? width : undefined }}>
      <div class={[`${cssPrefix}-h-step-cell`]} onClick={(ev) => handleClick(ev)}>
        <div
          class={[`${cssPrefix}-h-step-dot`, `${cssPrefix}-${validDotStatus}-step-dot`]}
          style={{ cursor: instance.onClick ? 'pointer' : undefined }}
        >
          {index}
        </div>
        <div class={[`${cssPrefix}-h-step-content`]}>
          <div class={[`${cssPrefix}-step-cell-title-container`]}>
            {title ? <p class={[`${cssPrefix}-step-cell-title`]}>{title}</p> : null}
            <div
              class={[`${cssPrefix}-h-step-line`, `${cssPrefix}-${validLineStatus}-step-line`]}
            ></div>
          </div>
          {renderCellSlot(instance)}
        </div>
      </div>
    </div>
  );
}

function renderCellSlot(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof stepProps>, ReturnType<typeof setup>>
) {
  const slots = renderSlot(instance.$slots, 'default');
  const cell = { title: instance.title, content: instance.content };
  const direction = instance.direction;
  if (slots?.children?.length) {
    return slots;
  }
  return (
    <>
      {cell.title && direction === 'vertical' ? (
        <p class={[`${cssPrefix}-step-cell-title`]}>{cell.title}</p>
      ) : null}
      {cell?.content ? <p class={[`${cssPrefix}-step-cell-content`]}>{cell.content}</p> : null}
    </>
  );
}

function getStepStatus(
  type: string,
  instance: ComponentPublicInstance<ExtractPropTypes<typeof stepProps>, ReturnType<typeof setup>>
) {
  const index = instance.stepIndex as number;
  const parentIndex = instance.parentIndex;
  const status = instance.status;
  if (type === 'line') {
    if (index < parentIndex) {
      return 'finish';
    }
    return 'undo';
  }

  if (status !== 'default') {
    return status;
  }
  if (index < parentIndex) {
    return 'finish';
  }
  if (index > parentIndex) {
    return 'undo';
  }
  return 'process';
}

export default Step;
