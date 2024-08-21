import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  inject,
  PropType,
  ref,
  SetupContext,
  toRaw,
  Transition,
  unref
} from 'vue';
import { cascaderEmitsList, CascaderEmitsType, CascaderProvideType, OptionItem } from './interface';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';

const checkIcon = (
  <svg viewBox="0 0 64 64" class="lee-cascader-check-icon" key="all-check">
    <path
      fill="currentColor"
      d="M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z"
    ></path>
  </svg>
);

const arrowIcon = (
  <svg
    class="lee-cascader-arrow-icon"
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

const childListProps = {
  options: {
    type: Object as PropType<Array<OptionItem> | undefined>,
    default: () => []
  }
};

const setup = (
  props: ExtractPropTypes<typeof childListProps>,
  context: SetupContext<Array<CascaderEmitsType>>
) => {
  function handleItemClick(e: MouseEvent, item: OptionItem) {
    if (item.disabled || item.children?.length) {
      return;
    }
    context.emit('select', toRaw(item));
  }

  const config = inject<CascaderProvideType>('cascaderProvideKey');

  const selectPath = unref(config?.selectPath);

  const targetRef = ref<Element | null>(null);
  const cascaderVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const floatRef = ref<HTMLElement>();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(0), flip(), shift()]
  });
  const cascaderStyle = computed(() => {
    return undefined;
  });

  const showCascader = computed(() => {
    return (
      (cascaderVisible.value || transitionVisible.value) &&
      Array.isArray(props.options) &&
      targetRef.value
    );
  });

  function handleCascaderVisible(visible?: boolean) {
    cascaderVisible.value = typeof visible === 'boolean' ? visible : !cascaderVisible.value;
    clearTimeout(transitionTimer);
    if (cascaderVisible.value) {
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
  }

  const childrenMenu = ref<OptionItem[]>([]);

  function handleItemEnter(item: OptionItem) {
    if (item.children && item.children.length && !item.disabled) {
      childrenMenu.value = toRaw(item.children);
      handleCascaderVisible(true);
    } else {
      handleCascaderVisible(false);
    }
  }

  const targetNode = ref<OptionItem | undefined>();
  if (selectPath?.length) {
    targetNode.value = selectPath[selectPath.length - 1];
  }
  if (props.options?.length) {
    for (let i = 0; i < props.options.length; i++) {
      if (selectPath?.some((item: OptionItem) => item.key === props.options?.[i].key)) {
        handleItemEnter(props.options[i]);
        break;
      }
    }
  }

  function handleMenuLeave() {
    targetRef.value = null;
  }

  function handleSelect(item: OptionItem) {
    context.emit('select', item);
    handleCascaderVisible(false);
  }

  return {
    floatRef,
    targetRef,
    floatingStyles,
    cascaderStyle,
    showCascader,
    childrenMenu,
    targetNode,
    handleSelect,
    handleItemEnter,
    handleMenuLeave,
    handleItemClick
  };
};

const ChildList = defineComponent({
  name: 'ChildList',
  props: childListProps,
  emits: cascaderEmitsList,
  setup,
  render() {
    return (
      <div
        class="lee-cascader-option-wrapper"
        ref="targetRef"
        onMouseleave={() => this.handleMenuLeave()}
      >
        {this.options &&
          this.options.map((item) => {
            return (
              <div
                class={['lee-cascader-item', item.disabled ? 'lee-cascader-item--disabled' : null]}
                onMouseenter={(ev) => this.handleItemEnter(item)}
                onClick={(ev) => this.handleItemClick(ev, item)}
              >
                {item.text}
                {item.key === this.targetNode?.key ? checkIcon : null}
                {item.children && item.children.length ? arrowIcon : null}
              </div>
            );
          })}
        <Transition name="lee-cascader-fade">
          {this.showCascader ? (
            <div ref="floatRef" style={this.floatingStyles}>
              <ChildList onSelect={this.handleSelect} options={this.childrenMenu}></ChildList>
            </div>
          ) : null}
        </Transition>
      </div>
    );
  }
});

export default ChildList;
