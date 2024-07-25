import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  ExtractPropTypes,
  getCurrentInstance,
  h,
  onMounted,
  PropType,
  ref,
  SetupContext,
  Teleport,
  Transition
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { getPropsValue } from '../../util';
import { arrow, autoUpdate, flip, offset, Placement, shift, useFloating } from '@floating-ui/vue';
import './dropdown.scss';
import {
  dropdownEmitsList,
  DropdownEmitsType,
  OptionItem,
  placementPropList,
  triggerPropList,
  TriggerType
} from './interface';
import MenuList from './MenuList';

const dropdownProps = {
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom'
  },
  options: {
    type: Object as PropType<Array<OptionItem> | undefined>,
    default: undefined
  },
  disabled: Boolean,
  trigger: {
    type: String as PropType<TriggerType>,
    default: 'hover'
  }
};

const setup = (
  props: ExtractPropTypes<typeof dropdownProps>,
  context: SetupContext<Array<DropdownEmitsType>>
) => {
  const dropdownVisible = ref(false);
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
        handleDropdownVisible(false);
      }
    }
  }

  function handleDropdownVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    dropdownVisible.value = typeof visible === 'boolean' ? visible : !dropdownVisible.value;
    clearTimeout(transitionTimer);
    if (dropdownVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (triggerValue.value === 'click') {
      if (dropdownVisible.value) {
        window.addEventListener('click', windowClickListener, { capture: true });
      } else {
        window.removeEventListener('click', windowClickListener);
      }
    }
  }

  function mouseEventHandler(visible: boolean) {
    if (triggerValue.value === 'hover') {
      handleDropdownVisible(visible);
    }
  }

  const targetRef = ref<Element | null>(null);

  const floatRef = ref<HTMLElement>();
  const floatingArrowRef = ref();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: placementValue.value,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift(), arrow({ element: floatingArrowRef })]
  });
  const dropdownStyle = computed(() => {
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

  const showDropdown = computed(() => {
    return (dropdownVisible.value || transitionVisible.value) && Array.isArray(props.options);
  });

  function handleSelect(item: OptionItem) {
    context.emit('select', item.key, item);
    handleDropdownVisible(false);
  }

  return {
    showDropdown,
    floatingArrowRef,
    targetRef,
    floatRef,
    dropdownVisible,
    transitionVisible,
    dropdownStyle,
    floatingStyles,
    triggerValue,
    handleSelect,
    handleDropdownVisible,
    mouseEventHandler
  };
};
const Dropdown = defineComponent({
  name: 'Dropdown',
  props: dropdownProps,
  emits: dropdownEmitsList,
  setup,
  render(
    instance: ComponentPublicInstance<
      ExtractPropTypes<typeof dropdownProps>,
      ReturnType<typeof setup>
    >
  ) {
    let targetSlot = null;
    if (instance.$slots.default) {
      const triggerSlots = instance.$slots?.default();
      console.log(triggerSlots);
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
              this.handleDropdownVisible();
            };
          } else {
            targetSlot.props.onClick = () => {
              this.handleDropdownVisible();
            };
          }
        }
        if (this.triggerValue === 'hover') {
          const originalMouseEnterHandler = targetSlot.props.onMouseenter;
          const originalMouseLeaveHandler = targetSlot.props.onMouseleave;
          if (originalMouseEnterHandler) {
            targetSlot.props.onMouseenter = (...args: unknown[]) => {
              originalMouseEnterHandler(...args);
              this.handleDropdownVisible(true);
            };
          } else {
            targetSlot.props.onMouseenter = () => {
              this.handleDropdownVisible(true);
            };
          }
          if (originalMouseLeaveHandler) {
            targetSlot.props.onMouseleave = (...args: unknown[]) => {
              originalMouseLeaveHandler(...args);
              this.handleDropdownVisible(false);
            };
          } else {
            targetSlot.props.onMouseleave = () => {
              this.handleDropdownVisible(false);
            };
          }
        }
      }
    }
    return (
      <>
        <Teleport to="body">
          <Transition name="lee-dropdown-fade">
            {this.showDropdown ? (
              <div style={this.dropdownStyle}>
                <div
                  ref="floatRef"
                  onMouseenter={() => this.mouseEventHandler(true)}
                  onMouseleave={() => this.mouseEventHandler(false)}
                  style={this.floatingStyles}
                >
                  <MenuList onSelect={this.handleSelect} options={this.options}></MenuList>
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

export default Dropdown;
