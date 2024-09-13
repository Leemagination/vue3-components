import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  provide,
  ref,
  SetupContext,
  Teleport,
  Transition,
  useModel
} from 'vue';
import { createZIndex } from '../../util/zIndex';
import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';
import style from './cascader.scss';
import {
  cascaderEmitsList,
  CascaderEmitsType,
  CascaderProvideType,
  OptionItem,
  TriggerType
} from './interface';
import ChildList from './ChildList';
import ClearIcon from './clearIcon';

const arrowIcon = (
  <svg
    class="lee-cascader-select-arrow-icon"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.14645 5.64645C3.34171 5.45118 3.65829 5.45118 3.85355 5.64645L8 9.79289L12.1464 5.64645C12.3417 5.45118 12.6583 5.45118 12.8536 5.64645C13.0488 5.84171 13.0488 6.15829 12.8536 6.35355L8.35355 10.8536C8.15829 11.0488 7.84171 11.0488 7.64645 10.8536L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645Z"
      fill="currentColor"
    ></path>
  </svg>
);

const cascaderProps = {
  value: {
    type: [String, Number],
    default: undefined
  },
  clearable: Boolean,
  showPath: Boolean,
  placeholder: {
    type: String,
    default: '请选择'
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
  props: ExtractPropTypes<typeof cascaderProps>,
  context: SetupContext<Array<CascaderEmitsType>>
) => {
  const cascaderVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const zIndex = ref(createZIndex());

  const selectValue = useModel(props, 'value');
  const showPlaceholder = computed(() => {
    return selectValue.value === null || selectValue.value === undefined;
  });

  const selectPath = computed(() => {
    if (!selectValue.value) {
      return [];
    }
    function findTargetPath(node: OptionItem, target: string | number) {
      let result: OptionItem[] = [];
      if (node.key === target) {
        result.push(node);
        return result;
      }
      if (node.children?.length) {
        for (let i = 0; i < node.children.length; i++) {
          const arr = findTargetPath(node.children[i], target);
          if (arr?.length) {
            result.push(node);
            result = result.concat(arr);
            return result;
          }
        }
      }
      return result;
    }
    if (Array.isArray(props.options)) {
      for (let i = 0; i < props.options.length; i++) {
        const arr = findTargetPath(props.options[i], selectValue.value);
        if (arr.length) {
          return arr;
        }
      }
    }
    return [];
  });

  provide<CascaderProvideType>('cascaderProvideKey', {
    selectPath
  });

  const showText = computed<string>(() => {
    const textPath = selectPath.value.map((item) => item.text);
    if (textPath.length) {
      if (props.showPath) {
        return textPath.join(' / ');
      }
      return textPath[textPath.length - 1];
    }
    return '';
  });

  function windowClickListener(el: MouseEvent) {
    const target = el.target as HTMLElement;
    if (target) {
      if (!floatRef.value?.contains(target) && !targetRef.value?.contains(target)) {
        handleCascaderVisible(false);
      }
    }
  }

  function handleCascaderVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    cascaderVisible.value = typeof visible === 'boolean' ? visible : !cascaderVisible.value;
    clearTimeout(transitionTimer);
    if (cascaderVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (cascaderVisible.value) {
      window.addEventListener('click', windowClickListener, { capture: true });
    } else {
      window.removeEventListener('click', windowClickListener);
    }
  }

  function mouseEventHandler(visible: boolean) {
    handleCascaderVisible(visible);
  }

  const targetRef = ref<Element | null>(null);

  const floatRef = ref<HTMLElement>();
  const floatingArrowRef = ref();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift(), arrow({ element: floatingArrowRef })]
  });
  const cascaderStyle = computed(() => {
    return { zIndex: zIndex.value };
  });

  const showCascader = computed(() => {
    return (cascaderVisible.value || transitionVisible.value) && Array.isArray(props.options);
  });

  function handleSelect(item: OptionItem) {
    context.emit('select', item.key, item);
    selectValue.value = item.key;
    handleCascaderVisible(false);
  }

  const hoverStatus = ref(false);

  function changeHoverStatus(status: boolean) {
    hoverStatus.value = status;
  }

  const clearIconShow = computed(() => {
    if (props.clearable && selectValue.value !== undefined && hoverStatus.value) {
      return true;
    }
    return false;
  });

  function clearValue(e: MouseEvent) {
    e.stopPropagation();
    selectValue.value = undefined;
  }

  return {
    showCascader,
    floatingArrowRef,
    targetRef,
    floatRef,
    cascaderVisible,
    transitionVisible,
    cascaderStyle,
    floatingStyles,
    showPlaceholder,
    showText,
    clearIconShow,
    selectPath,
    clearValue,
    changeHoverStatus,
    handleSelect,
    handleCascaderVisible,
    mouseEventHandler
  };
};
const Cascader = defineComponent({
  __STYLE__: style,
  name: 'Cascader',
  props: cascaderProps,
  emits: cascaderEmitsList,
  setup,
  render() {
    return (
      <>
        <div
          onMouseenter={() => this.changeHoverStatus(true)}
          onMouseleave={() => this.changeHoverStatus(false)}
          ref="targetRef"
          class={[
            'lee-cascader-select-container',
            this.disabled ? 'lee-cascader-select-disabled' : null
          ]}
          tabindex="0"
          onClick={() => this.handleCascaderVisible()}
        >
          <div class="lee-cascader-select-input">{this.showText}</div>
          {this.showPlaceholder ? (
            <div class="lee-cascader-select-placeholder">{this.placeholder}</div>
          ) : null}
          {this.clearIconShow ? <ClearIcon onClick={this.clearValue}></ClearIcon> : arrowIcon}
        </div>
        <Teleport to="body">
          <Transition name="lee-cascader-fade">
            {this.showCascader ? (
              <div style={this.cascaderStyle}>
                <div
                  ref="floatRef"
                  onMouseenter={() => this.mouseEventHandler(true)}
                  onMouseleave={() => this.mouseEventHandler(false)}
                  style={this.floatingStyles}
                >
                  <ChildList onSelect={this.handleSelect} options={this.options}></ChildList>
                </div>
              </div>
            ) : null}
          </Transition>
        </Teleport>
      </>
    );
  }
});

export default Cascader;
