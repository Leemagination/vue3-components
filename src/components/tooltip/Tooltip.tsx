import {
  defineComponent,
  h,
  Fragment,
  ComponentPublicInstance,
  ExtractPropTypes,
  onMounted,
  getCurrentInstance,
  ref,
  Teleport,
  watch,
  computed,
  PropType,
  Transition,
  StyleValue
} from 'vue';
import style from './tooltip.scss';
import { arrow, autoUpdate, flip, offset, Placement, shift, useFloating } from '@floating-ui/vue';
import { createZIndex } from '../../util/zIndex';
import { placementPropList, triggerPropList, TriggerType } from './interface';
import { getPropsValue } from '../../util';

const tooltipProps = {
  placement: {
    type: String as PropType<Placement>,
    default: 'top'
  },
  disabled: Boolean,
  showArrow: {
    type: Boolean,
    default: true
  },
  content: {
    default: '',
    type: String
  },
  trigger: {
    type: String as PropType<TriggerType>,
    default: 'hover'
  },
  tooltipOnHover: {
    type: Boolean,
    default: true
  },
  contentStyle: {
    type: Object,
    default: null
  }
};

const setup = (props: ExtractPropTypes<typeof tooltipProps>) => {
  const tooltipVisible = ref(false);
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
        handleTooltipVisible(false);
      }
    }
  }

  function handleTooltipVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    tooltipVisible.value = typeof visible === 'boolean' ? visible : !tooltipVisible.value;
    clearTimeout(transitionTimer);
    if (tooltipVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (triggerValue.value === 'click') {
      if (tooltipVisible.value) {
        window.addEventListener('click', windowClickListener, { capture: true });
      } else {
        window.removeEventListener('click', windowClickListener);
      }
    }
  }

  function mouseEventHandler(visible: boolean) {
    if (triggerValue.value === 'hover') {
      handleTooltipVisible(visible);
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
  const tooltipStyle = computed<StyleValue>(() => {
    return { zIndex: zIndex.value, position: 'relative' };
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

  const contentStyle = computed(() => {
    if (typeof props.contentStyle === 'object') {
      return { ...floatingStyles.value, ...props.contentStyle };
    }
    return floatingStyles.value;
  });

  return {
    floatingArrowRef,
    targetRef,
    floatRef,
    tooltipVisible,
    transitionVisible,
    tooltipStyle,
    floatingStyles,
    contentStyle,
    floatArrowStyle,
    triggerValue,
    handleTooltipVisible,
    mouseEventHandler
  };
};
const tooltip = defineComponent({
  __STYLE__: style,
  name: 'Tooltip',
  props: tooltipProps,
  setup,
  render(
    instance: ComponentPublicInstance<
      ExtractPropTypes<typeof tooltipProps>,
      ReturnType<typeof setup>
    >
  ) {
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
              this.handleTooltipVisible();
            };
          } else {
            targetSlot.props.onClick = () => {
              this.handleTooltipVisible();
            };
          }
        }
        if (this.triggerValue === 'hover') {
          const originalMouseEnterHandler = targetSlot.props.onMouseenter;
          const originalMouseLeaveHandler = targetSlot.props.onMouseleave;
          if (originalMouseEnterHandler) {
            targetSlot.props.onMouseenter = (...args: unknown[]) => {
              originalMouseEnterHandler(...args);
              this.handleTooltipVisible(true);
            };
          } else {
            targetSlot.props.onMouseenter = () => {
              this.handleTooltipVisible(true);
            };
          }
          if (originalMouseLeaveHandler) {
            targetSlot.props.onMouseleave = (...args: unknown[]) => {
              originalMouseLeaveHandler(...args);
              this.handleTooltipVisible(false);
            };
          } else {
            targetSlot.props.onMouseleave = () => {
              this.handleTooltipVisible(false);
            };
          }
        }
      }
    }
    return (
      <>
        <Teleport to="body">
          <Transition name="lee-tooltip-fade">
            {this.content && (this.tooltipVisible || this.transitionVisible) ? (
              <div style={this.tooltipStyle}>
                <div
                  ref="floatRef"
                  onMouseenter={() => (this.tooltipOnHover ? this.mouseEventHandler(true) : null)}
                  onMouseleave={() => (this.tooltipOnHover ? this.mouseEventHandler(false) : null)}
                  class="lee-tooltip-content"
                  style={this.contentStyle}
                >
                  {this.content}
                  {this.showArrow ? (
                    <div
                      ref="floatingArrowRef"
                      class="lee-tooltip-arrow"
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

export default tooltip;
