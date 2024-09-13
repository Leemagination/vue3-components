import {
  Component,
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  renderSlot,
  SetupContext,
  StyleValue,
  Teleport,
  Transition,
  useModel,
  VNode,
  watch
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { drawerEmits, DrawerEmitType, placementList, PlacementType } from './interface';
import { getPropsValue, isComponent } from '../../util';
import style from './drawer.scss';

const closeIcon = (
  <svg viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g fill="currentColor" fill-rule="nonzero">
        <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
      </g>
    </g>
  </svg>
);

const drawerProps = {
  showClose: {
    type: Boolean,
    default: true
  },
  drawerStyle: {
    type: Object as PropType<StyleValue>,
    default: null
  },
  placement: {
    type: String as PropType<PlacementType>,
    default: 'right'
  },
  size: {
    type: [String, Number],
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  zIndex: {
    type: Number,
    default: undefined
  },
  title: {
    type: String as PropType<string | VNode | Component>,
    default: ''
  },
  content: {
    type: String as PropType<string | VNode | Component>,
    default: ''
  },
  maskClosable: {
    type: Boolean,
    default: true
  }
};

const setup = (
  props: ExtractPropTypes<typeof drawerProps>,
  context: SetupContext<Array<DrawerEmitType>>
) => {
  const visibleValue = useModel(props, 'visible');

  const inTransition = ref(false);
  const modalZIndex = ref(createZIndex());
  const modalVisible = ref(props.visible);

  const originOverflow = document.documentElement.style.overflow;
  watch(visibleValue, (val) => {
    if (val) {
      modalZIndex.value = createZIndex(modalZIndex.value);
      modalVisible.value = true;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = originOverflow;
    }
  });
  const zIndex = computed(() => {
    return props.zIndex || modalZIndex.value;
  });

  function closeModal() {
    visibleValue.value = false;
  }

  function handleMaskClick(e: MouseEvent) {
    if (props.maskClosable) {
      closeModal();
    }
    context.emit('maskClick', e);
  }

  function handleModalClosed() {
    inTransition.value = false;
    modalVisible.value = false;
    context.emit('closed');
  }

  function changeTransitionStatus(flag: boolean) {
    inTransition.value = flag;
  }

  const validPlacement = computed<PlacementType>(() => {
    return getPropsValue<PlacementType>(props.placement, placementList);
  });

  const drawerStyle = computed<StyleValue>(() => {
    let result = undefined;
    const sizeMap: { [p: string]: Array<'height' | 'width'> } = {
      top: ['height', 'width'],
      bottom: ['height', 'width'],
      left: ['width', 'height'],
      right: ['width', 'height']
    };

    const sizeStyle: StyleValue = {};
    sizeStyle[sizeMap[validPlacement.value][1]] = '100%';
    sizeStyle[validPlacement.value] = '0';

    if (props.size) {
      sizeStyle[sizeMap[validPlacement.value][0]] =
        typeof props.size === 'number' ? `${props.size}px` : props.size;
    }
    result = {
      ...sizeStyle
    };

    if (typeof props.drawerStyle === 'object') {
      result = {
        ...sizeStyle,
        ...props.drawerStyle
      };
    }
    return result;
  });

  return {
    visibleValue,
    modalVisible,
    zIndex,
    drawerStyle,
    validPlacement,
    changeTransitionStatus,
    handleMaskClick,
    handleModalClosed,
    closeModal
  };
};

const Drawer = defineComponent({
  __STYLE__: style,
  name: 'Drawer',
  props: drawerProps,
  emits: drawerEmits,
  setup,
  render() {
    const { $slots, $props } = this;
    const defaultSlot = renderSlot(
      $slots,
      'default',
      {},
      $props.content
        ? () => [isComponent($props.content) ? h($props.content) : $props.content]
        : undefined
    );
    const headerSlot = renderSlot(
      $slots,
      'header',
      {},
      $props.title ? () => [isComponent($props.title) ? h($props.title) : $props.title] : undefined
    );
    return (
      <>
        {this.modalVisible ? (
          <Teleport to="body">
            <div class="lee-drawer-container" style={{ zIndex: this.zIndex }}>
              <div class="lee-drawer-content-container">
                <Transition name="lee-drawer-mask-fade" appear>
                  {this.visibleValue ? (
                    <div class="lee-drawer-mask" onClick={this.handleMaskClick}></div>
                  ) : null}
                </Transition>
                <Transition
                  duration={500}
                  name="lee-drawer-content-fade"
                  enter-from-class={`placement-transition__${this.validPlacement}`}
                  leave-to-class={`placement-transition__${this.validPlacement}`}
                  appear
                  onBeforeLeave={() => this.changeTransitionStatus(true)}
                  onAfterLeave={() => this.handleModalClosed()}
                >
                  {this.visibleValue ? (
                    <div class="lee-drawer-content" style={this.drawerStyle}>
                      <div class="lee-drawer-content__header">
                        <span class="lee-drawer-content__header-title">{headerSlot}</span>
                        {this.showClose ? (
                          <span
                            class="lee-drawer-content__header-close"
                            onClick={() => this.closeModal()}
                          >
                            {closeIcon}
                          </span>
                        ) : null}
                      </div>
                      <div class="lee-drawer-content__main">{defaultSlot}</div>
                    </div>
                  ) : null}
                </Transition>
              </div>
            </div>
          </Teleport>
        ) : null}
      </>
    );
  }
});

export default Drawer;
