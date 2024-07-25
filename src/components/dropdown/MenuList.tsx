import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  SetupContext,
  toRaw,
  Transition
} from 'vue';
import { dropdownEmitsList, DropdownEmitsType, OptionItem } from './interface';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';

const arrowIcon = (
  <svg
    class="lee-dropdown-menu-arrow-icon"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.64645 3.14645C5.45118 3.34171 5.45118 3.65829 5.64645 3.85355L9.79289 8L5.64645 12.1464C5.45118 12.3417 5.45118 12.6583 5.64645 12.8536C5.84171 13.0488 6.15829 13.0488 6.35355 12.8536L10.8536 8.35355C11.0488 8.15829 11.0488 7.84171 10.8536 7.64645L6.35355 3.14645C6.15829 2.95118 5.84171 2.95118 5.64645 3.14645Z"
      fill="currentColor"
    ></path>
  </svg>
);

const menuListProps = {
  options: {
    type: Object as PropType<Array<OptionItem> | undefined>,
    default: () => []
  }
};

const setup = (
  props: ExtractPropTypes<typeof menuListProps>,
  context: SetupContext<Array<DropdownEmitsType>>
) => {
  function handleItemClick(e: MouseEvent, item: OptionItem) {
    if (item.disabled || item.children?.length) {
      return;
    }
    context.emit('select', toRaw(item));
  }

  const targetRef = ref<Element | null>(null);
  const dropdownVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const floatRef = ref<HTMLElement>();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift()]
  });
  const dropdownStyle = computed(() => {
    return undefined;
  });
  const showDropdown = computed(() => {
    return (
      (dropdownVisible.value || transitionVisible.value) &&
      Array.isArray(props.options) &&
      targetRef.value
    );
  });

  function handleDropdownVisible(visible?: boolean) {
    dropdownVisible.value = typeof visible === 'boolean' ? visible : !dropdownVisible.value;
    clearTimeout(transitionTimer);
    if (dropdownVisible.value) {
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
  }

  const childrenMenu = ref<OptionItem[]>([]);

  function handleItemEnter(e: MouseEvent, item: OptionItem) {
    if (item.children && item.children.length && !item.disabled) {
      targetRef.value = e.target as Element;
      childrenMenu.value = toRaw(item.children);
      handleDropdownVisible(true);
    } else {
      targetRef.value = null;
      handleDropdownVisible(false);
    }
  }

  function handleMenuLeave() {
    targetRef.value = null;
  }

  function handleSelect(item: OptionItem) {
    context.emit('select', item);
    handleDropdownVisible(false);
  }

  return {
    floatRef,
    targetRef,
    floatingStyles,
    dropdownStyle,
    showDropdown,
    childrenMenu,
    handleSelect,
    handleItemEnter,
    handleMenuLeave,
    handleItemClick
  };
};

const MenuList = defineComponent({
  name: 'MenuList',
  props: menuListProps,
  emits: dropdownEmitsList,
  setup,
  render() {
    return (
      <div class="lee-dropdown-menu" onMouseleave={() => this.handleMenuLeave()}>
        {this.options &&
          this.options.map((item) => {
            return (
              <div
                class={[
                  'lee-dropdown-menu-item',
                  item.disabled ? 'lee-dropdown-menu-item--disabled' : null
                ]}
                onMouseenter={(ev) => this.handleItemEnter(ev, item)}
                onClick={(ev) => this.handleItemClick(ev, item)}
              >
                {item.text}
                {item.children && item.children.length ? arrowIcon : null}
              </div>
            );
          })}
        <Transition name="lee-dropdown-fade">
          {this.showDropdown ? (
            <div ref="floatRef" style={this.floatingStyles}>
              <MenuList onSelect={this.handleSelect} options={this.childrenMenu}></MenuList>
            </div>
          ) : null}
        </Transition>
      </div>
    );
  }
});

export default MenuList;
