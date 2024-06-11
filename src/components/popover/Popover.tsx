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
  nextTick,
  computed
} from 'vue';
import './popover.scss';
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue';
import { createZIndex } from '../../util/zIndex';

const popoverProps = {};

const setup = (props: ExtractPropTypes<typeof popoverProps>) => {
  const popoverVisible = ref(false);
  const zIndex = ref(createZIndex());
  function handlePopoverVisible() {
    popoverVisible.value = !popoverVisible.value;
    if (popoverVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
    }
  }

  const targetRef = ref<Element | null>(null);

  const floatRef = ref();
  const floatingArrowRef = ref();
  const { floatingStyles, middlewareData, placement, isPositioned } = useFloating(
    targetRef,
    floatRef,
    {
      transform: false,
      placement: 'bottom',
      middleware: [offset(10), flip(), shift(), arrow({ element: floatingArrowRef })]
    }
  );
  const popoverStyle = computed(() => {
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

  return {
    floatingArrowRef,
    targetRef,
    floatRef,
    popoverVisible,
    popoverStyle,
    floatingStyles,
    floatArrowStyle,
    handlePopoverVisible
  };
};
const Popover = defineComponent({
  name: 'Popover',
  setup,
  render(
    instance: ComponentPublicInstance<
      ExtractPropTypes<typeof popoverProps>,
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
        if (targetSlot?.props?.onClick) {
          const originalHandler = targetSlot.props.onClick;
          targetSlot.props.onClick = (...args: unknown[]) => {
            originalHandler(...args);
            this.handlePopoverVisible();
          };
        } else {
          targetSlot.props.onClick = () => {
            this.handlePopoverVisible();
          };
        }
      }
    }
    return (
      <>
        {this.popoverVisible ? (
          <Teleport to="body">
            <div style={this.popoverStyle}>
              <div ref="floatRef" class="lee-popover-content" style={this.floatingStyles}>
                {defaultSlots}
                <div
                  ref="floatingArrowRef"
                  class="lee-popover-arrow"
                  style={this.floatArrowStyle}
                ></div>
              </div>
            </div>
          </Teleport>
        ) : null}
        {targetSlot}
      </>
    );
  }
});

export default Popover;
