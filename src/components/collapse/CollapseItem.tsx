import {
  defineComponent,
  ExtractPropTypes,
  SetupContext,
  h,
  Fragment,
  renderSlot,
  ref,
  Transition,
  inject,
  onBeforeMount
} from 'vue';
import { CollapseProvideType } from './interface';

const collapseProps = {
  title: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },
  collect: {
    type: String,
    default: () => []
  }
};
const setup = (props: ExtractPropTypes<typeof collapseProps>, context: SetupContext) => {
  const config = inject<CollapseProvideType>('collapseProvideKey');
  const expandedStatus = ref(!!props.defaultExpanded);
  const itemName = props.name || Symbol();
  onBeforeMount(() => {
    if (config) {
      config.addItemRef({
        name: itemName,
        status: expandedStatus
      });
    }
  });
  function changeStatus() {
    if (config) {
      config.changeItemStatus(itemName);
    }
  }

  function setExpandedHeight(el: Element) {
    (el as HTMLElement).style.maxHeight = `${el.scrollHeight}px`;
    (el as HTMLElement).style.opacity = '1';
  }
  function setShrinkHeight(el: Element) {
    (el as HTMLElement).style.maxHeight = '0';
    (el as HTMLElement).style.opacity = '0';
  }
  function removeTransitionStyle(el: Element) {
    (el as HTMLElement).style.maxHeight = '';
    (el as HTMLElement).style.opacity = '';
  }

  return {
    expandedStatus,
    changeStatus,
    setExpandedHeight,
    setShrinkHeight,
    removeTransitionStyle
  };
};

const CollapseItem = defineComponent({
  name: 'CollapseItem',
  props: collapseProps,
  setup,
  render() {
    const { $slots, expandedStatus } = this;
    const slot = renderSlot($slots, 'default');
    return (
      <div class={['lee-collapse-item', expandedStatus ? 'lee-collapse-item-expanded' : null]}>
        <div class="lee-collapse-item-title" onClick={this.changeStatus}>
          <svg class="arrow-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.64645 3.14645C5.45118 3.34171 5.45118 3.65829 5.64645 3.85355L9.79289 8L5.64645 12.1464C5.45118 12.3417 5.45118 12.6583 5.64645 12.8536C5.84171 13.0488 6.15829 13.0488 6.35355 12.8536L10.8536 8.35355C11.0488 8.15829 11.0488 7.84171 10.8536 7.64645L6.35355 3.14645C6.15829 2.95118 5.84171 2.95118 5.64645 3.14645Z"
              fill="currentColor"
            ></path>
          </svg>
          {this.title}
        </div>
        <Transition
          name="lee-collapse-transition"
          onBeforeEnter={this.setShrinkHeight}
          onEnter={this.setExpandedHeight}
          onBeforeLeave={this.setExpandedHeight}
          onLeave={this.setShrinkHeight}
          onAfterEnter={this.removeTransitionStyle}
          onAfterLeave={this.removeTransitionStyle}
        >
          {expandedStatus ? (
            <div class="lee-collapse-item-main">
              <div class="lee-collapse-item-content">{slot}</div>
            </div>
          ) : null}
        </Transition>
      </div>
    );
  }
});

export default CollapseItem;
