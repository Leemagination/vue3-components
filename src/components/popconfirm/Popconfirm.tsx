import {
  defineComponent,
  h,
  Fragment,
  renderSlot,
  ComponentPublicInstance,
  ExtractPropTypes,
  onMounted,
  getCurrentInstance,
  ref,
  Teleport,
  watch,
  computed,
  PropType,
  Transition
} from 'vue';
import './popconfirm.scss';
import { arrow, autoUpdate, flip, offset, Placement, shift, useFloating } from '@floating-ui/vue';
import { createZIndex } from '../../util/zIndex';
import { placementPropList, triggerPropList, TriggerType } from './interface';
import { getPropsValue } from '../../util';

const popconfirmProps = {
  placement: {
    type: String as PropType<Placement>,
    default: 'top'
  },
  disabled: Boolean,
  showArrow: {
    type: Boolean,
    default: true
  },
  trigger: {
    type: String as PropType<TriggerType>,
    default: 'click'
  },
  popconfirmOnHover: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  onCancelClick: {
    type: Function as PropType<(e: MouseEvent) => Promise<boolean> | boolean>,
    default: null
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  onConfirmClick: {
    type: Function as PropType<(e: MouseEvent) => Promise<boolean> | boolean>,
    default: null
  }
};

const setup = (props: ExtractPropTypes<typeof popconfirmProps>) => {
  const popconfirmVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const zIndex = ref(createZIndex());

  const placementValue = computed(() => {
    return getPropsValue(props.placement, placementPropList);
  });

  const triggerValue = computed(() => {
    return getPropsValue(props.trigger, triggerPropList);
  });

  function windowClickListener(el: MouseEvent) {
    const target = el.target as HTMLElement;
    if (target) {
      if (!floatRef.value?.contains(target) && !targetRef.value?.contains(target)) {
        handlePopconfirmVisible(false);
      }
    }
  }

  function handlePopconfirmVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    popconfirmVisible.value = typeof visible === 'boolean' ? visible : !popconfirmVisible.value;
    clearTimeout(transitionTimer);
    if (popconfirmVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (triggerValue.value === 'click') {
      if (popconfirmVisible.value) {
        window.addEventListener('click', windowClickListener, { capture: true });
      } else {
        window.removeEventListener('click', windowClickListener);
      }
    }
  }

  function mouseEventHandler(visible: boolean) {
    if (triggerValue.value === 'hover') {
      handlePopconfirmVisible(visible);
    }
  }

  const targetRef = ref<Element | null>(null);

  const floatRef = ref<HTMLElement>();
  const floatingArrowRef = ref();
  const { floatingStyles, middlewareData, placement, isPositioned } = useFloating(
    targetRef,
    floatRef,
    {
      transform: false,
      placement: placementValue.value,
      whileElementsMounted: autoUpdate,
      middleware: [offset(10), flip(), shift(), arrow({ element: floatingArrowRef })]
    }
  );
  const popconfirmStyle = computed(() => {
    return { zIndex: zIndex.value };
  });
  onMounted(() => {
    const instance = getCurrentInstance();
    if (
      instance &&
      instance.subTree &&
      Array.isArray(instance.subTree.children) &&
      instance.subTree.children.length > 1
    ) {
      const child = instance.subTree.children[1];
      if (child && child.el) {
        targetRef.value = child.el;
      }
    }
  });

  const floatArrowStyle = ref();

  watch(isPositioned, (val) => {
    if (val) {
      const side = placement.value.split('-')[0];

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right'
      }[side];

      const borderWidth = {
        left: {
          borderLeftWidth: 0,
          borderBottomWidth: 0
        },
        right: {
          borderTopWidth: 0,
          borderRightWidth: 0
        },
        top: {
          borderLeftWidth: 0,
          borderTopWidth: 0
        },
        bottom: {
          borderBottomWidth: 0,
          borderRightWidth: 0
        }
      }[side];

      floatArrowStyle.value = {
        position: 'absolute',
        left: middlewareData.value.arrow?.x != null ? `${middlewareData.value.arrow.x}px` : '',
        top: middlewareData.value.arrow?.y != null ? `${middlewareData.value.arrow.y}px` : '',
        // Ensure the static side gets unset when
        // flipping to other placements' axes.
        right: '',
        bottom: '',
        [staticSide as string]: '-6px',
        ...borderWidth
      };
    }
  });

  function handleCancelButtonClick(e: MouseEvent) {
    Promise.resolve(props.onCancelClick ? props.onCancelClick(e) : true).then((res) => {
      if (res !== false) {
        handlePopconfirmVisible(false);
      }
    });
  }

  function handleConfirmButtonClick(e: MouseEvent) {
    Promise.resolve(props.onConfirmClick ? props.onConfirmClick(e) : true).then((res) => {
      if (res !== false) {
        handlePopconfirmVisible(false);
      }
    });
  }

  return {
    floatingArrowRef,
    targetRef,
    floatRef,
    popconfirmVisible,
    transitionVisible,
    popconfirmStyle,
    floatingStyles,
    floatArrowStyle,
    triggerValue,
    handlePopconfirmVisible,
    mouseEventHandler,
    handleCancelButtonClick,
    handleConfirmButtonClick
  };
};
const Popconfirm = defineComponent({
  name: 'Popconfirm',
  props: popconfirmProps,
  setup,
  render(
    instance: ComponentPublicInstance<
      ExtractPropTypes<typeof popconfirmProps>,
      ReturnType<typeof setup>
    >
  ) {
    const defaultSlots = renderSlot(instance.$slots, 'default');
    let targetSlot = null;
    if (instance.$slots.trigger) {
      const triggerSlots = instance.$slots?.trigger();
      if (triggerSlots?.length) {
        targetSlot = triggerSlots[0];
        if (!targetSlot?.props) {
          targetSlot.props = {};
        }
        if (this.triggerValue === 'click') {
          if (targetSlot?.props?.onClick) {
            const originalHandler = targetSlot.props.onClick;
            targetSlot.props.onClick = (...args: unknown[]) => {
              originalHandler(...args);
              this.handlePopconfirmVisible();
            };
          } else {
            targetSlot.props.onClick = () => {
              this.handlePopconfirmVisible();
            };
          }
        }
        if (this.triggerValue === 'hover') {
          const originalMouseEnterHandler = targetSlot.props.onMouseenter;
          const originalMouseLeaveHandler = targetSlot.props.onMouseleave;
          if (originalMouseEnterHandler) {
            targetSlot.props.onMouseenter = (...args: unknown[]) => {
              originalMouseEnterHandler(...args);
              this.handlePopconfirmVisible(true);
            };
          } else {
            targetSlot.props.onMouseenter = () => {
              this.handlePopconfirmVisible(true);
            };
          }
          if (originalMouseLeaveHandler) {
            targetSlot.props.onMouseleave = (...args: unknown[]) => {
              originalMouseLeaveHandler(...args);
              this.handlePopconfirmVisible(false);
            };
          } else {
            targetSlot.props.onMouseleave = () => {
              this.handlePopconfirmVisible(false);
            };
          }
        }
      }
    }
    return (
      <>
        <Teleport to="body">
          <Transition name="lee-popconfirm-fade">
            {this.popconfirmVisible || this.transitionVisible ? (
              <div style={this.popconfirmStyle}>
                <div
                  ref="floatRef"
                  onMouseenter={() =>
                    this.popconfirmOnHover ? this.mouseEventHandler(true) : null
                  }
                  onMouseleave={() =>
                    this.popconfirmOnHover ? this.mouseEventHandler(false) : null
                  }
                  class="lee-popconfirm-content"
                  style={this.floatingStyles}
                >
                  {defaultSlots}
                  <div class="lee-popconfirm-footer">
                    <div
                      onClick={(e) => this.handleCancelButtonClick(e)}
                      class="lee-popconfirm-button lee-popconfirm-button--cancel"
                    >
                      {this.cancelText}
                    </div>
                    <div
                      onClick={(e) => this.handleConfirmButtonClick(e)}
                      class="lee-popconfirm-button lee-popconfirm-button--confirm"
                    >
                      {this.confirmText}
                    </div>
                  </div>
                  {this.showArrow ? (
                    <div
                      ref="floatingArrowRef"
                      class="lee-popconfirm-arrow"
                      style={this.floatArrowStyle}
                    ></div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Transition>
        </Teleport>
        {targetSlot}
      </>
    );
  }
});

export default Popconfirm;
