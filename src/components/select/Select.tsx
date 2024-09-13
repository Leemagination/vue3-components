import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  SetupContext,
  useModel,
  Fragment,
  Transition,
  Teleport,
  ref,
  StyleValue
} from 'vue';
import style from './select.scss';
import { SelectType } from './interface';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
import ClearIcon from './clearIcon';

const selectProps = {
  value: {
    type: [String, Number, Array, Object],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  multiple: Boolean,
  disabled: Boolean,
  clearable: Boolean,
  sameWidth: {
    default: true,
    type: Boolean
  }
};

const arrowIcon = (
  <svg
    class="lee-select-arrow-icon"
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

const selectedIcon = (
  <svg class="lee-select-selected-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <g fill="none">
      <path
        d="M14.046 3.486a.75.75 0 0 1-.032 1.06l-7.93 7.474a.85.85 0 0 1-1.188-.022l-2.68-2.72a.75.75 0 1 1 1.068-1.053l2.234 2.267l7.468-7.038a.75.75 0 0 1 1.06.032z"
        fill="currentColor"
      ></path>
    </g>
  </svg>
);

const setup = (
  props: ExtractPropTypes<typeof selectProps>,
  context: SetupContext<Array<SelectType>>
) => {
  const selectValue = useModel(props, 'value');
  const showPlaceholder = computed(() => {
    return selectValue.value === null || selectValue.value === undefined;
  });

  const optionsVisible = ref(false);
  const transitionVisible = ref(false);
  let transitionTimer: number | undefined = undefined;
  const zIndex = ref(createZIndex());
  const targetRef = ref<Element | null>(null);
  const floatRef = ref<HTMLElement>();
  const { floatingStyles } = useFloating(targetRef, floatRef, {
    transform: false,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [flip()]
  });

  const zIndexStyle = computed<StyleValue>(() => {
    return { zIndex: zIndex.value, position: 'relative' };
  });

  function windowClickListener(el: MouseEvent) {
    const target = el.target as HTMLElement;
    if (target) {
      if (!floatRef.value?.contains(target) && !targetRef.value?.contains(target)) {
        handleOptionsVisible(false);
      }
    }
  }

  function handleOptionsVisible(visible?: boolean) {
    if (props.disabled) {
      return;
    }
    optionsVisible.value = typeof visible === 'boolean' ? visible : !optionsVisible.value;
    clearTimeout(transitionTimer);
    if (optionsVisible.value) {
      zIndex.value = createZIndex(zIndex.value);
      transitionVisible.value = true;
      if (targetRef.value && props.sameWidth) {
        selectWidth.value = getComputedStyle(targetRef.value).width;
      }
    } else {
      transitionTimer = setTimeout(() => {
        transitionVisible.value = false;
      }, 50);
    }
    if (optionsVisible.value) {
      window.addEventListener('click', windowClickListener, { capture: true });
    } else {
      window.removeEventListener('click', windowClickListener);
    }
  }

  const formatOptions = computed(() => {
    if (Array.isArray(props.options)) {
      return props.options.map((item) => {
        let selected = false;
        if (props.multiple && Array.isArray(selectValue.value)) {
          selected = selectValue.value.includes(item.value);
        }
        if (!props.multiple) {
          selected = selectValue.value === item.value;
        }
        return {
          ...item,
          selected
        };
      });
    }
    return [];
  });

  const showText = computed<string>(() => {
    const target = formatOptions.value.find((item) => item.value === selectValue.value);
    if (target) {
      return target.text;
    }
    return '';
  });

  const multiSelectedList = computed(() => {
    if (props.multiple) {
      return formatOptions.value.filter((item) => item.selected);
    }
    return null;
  });

  function handleOptionClick(item: { [p: string]: any }) {
    if (props.multiple) {
      if (Array.isArray(selectValue.value)) {
        const index = selectValue.value.findIndex((val) => val === item.value);
        if (index === -1) {
          selectValue.value.push(item.value);
        } else {
          selectValue.value.splice(index, 1);
          if (selectValue.value.length === 0) {
            selectValue.value = undefined;
          }
        }
      } else {
        selectValue.value = [item.value];
      }
    } else {
      selectValue.value = item.value;
      handleOptionsVisible(false);
    }
  }

  const selectWidth = ref<null | string>(null);

  const optionsWrapperStyle = computed(() => {
    if (selectWidth.value) {
      return { ...floatingStyles.value, width: selectWidth.value };
    }
    return floatingStyles.value;
  });

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
    clearIconShow,
    floatRef,
    targetRef,
    transitionVisible,
    optionsVisible,
    zIndexStyle,
    optionsWrapperStyle,
    selectValue,
    showText,
    showPlaceholder,
    formatOptions,
    multiSelectedList,
    changeHoverStatus,
    clearValue,
    handleOptionsVisible,
    handleOptionClick
  };
};

const Select = defineComponent({
  __STYLE__: style,
  name: 'Select',
  props: selectProps,
  setup,
  render() {
    return (
      <>
        <div
          onMouseenter={() => this.changeHoverStatus(true)}
          onMouseleave={() => this.changeHoverStatus(false)}
          ref="targetRef"
          class={['lee-select-container', this.disabled ? 'lee-select-disabled' : null]}
          tabindex="0"
          onClick={() => this.handleOptionsVisible()}
        >
          {this.multiSelectedList ? (
            <div class="lee-select-multi-input">
              {this.multiSelectedList.map((item) => {
                return (
                  <div class="lee-select-selected-item">
                    <span>{item.text}</span>
                    <ClearIcon onClick={() => this.handleOptionClick(item)}></ClearIcon>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="lee-select-input">{this.showText}</div>
          )}
          {this.showPlaceholder ? (
            <div class="lee-select-placeholder">{this.placeholder}</div>
          ) : null}
          {this.clearIconShow ? <ClearIcon onClick={this.clearValue}></ClearIcon> : arrowIcon}
        </div>
        {this.formatOptions.length ? (
          <Teleport to="body">
            <Transition name="lee-select-fade">
              {this.optionsVisible || this.transitionVisible ? (
                <div style={this.zIndexStyle}>
                  <div
                    onMouseenter={() => this.changeHoverStatus(true)}
                    onMouseleave={() => this.changeHoverStatus(false)}
                    ref="floatRef"
                    class="lee-select-options-wrapper"
                    style={this.optionsWrapperStyle}
                  >
                    {this.formatOptions.map((item) => {
                      return (
                        <div
                          class={[
                            'lee-select-option-item',
                            item.selected ? 'lee-select-option-item__selected' : null
                          ]}
                          onClick={() => this.handleOptionClick(item)}
                        >
                          <span>{item.text}</span>
                          {item.selected ? selectedIcon : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Transition>
          </Teleport>
        ) : null}
      </>
    );
  }
});

export default Select;
