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
  ref
} from 'vue';
import './select.scss';
import { SelectType } from './interface';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';

const selectProps = {
  value: {
    type: [String, Number, Array, Object],
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  disabled: Boolean,
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

  const zIndexStyle = computed(() => {
    return { zIndex: zIndex.value };
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
      return props.options;
    }
    return [];
  });

  const showText = computed<string>(() => {
    const target = formatOptions.value.find((item) => item.value === selectValue.value);
    if (target) {
      return target.text;
    }
    return null;
  });

  function handleOptionClick(item: { [p: string]: any }) {
    selectValue.value = item.value;
    handleOptionsVisible(false);
  }

  const selectWidth = ref<null | string>(null);

  const optionsWrapperStyle = computed(() => {
    if (selectWidth.value) {
      return { ...floatingStyles.value, width: selectWidth.value };
    }
    return floatingStyles.value;
  });

  return {
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
    handleOptionsVisible,
    handleOptionClick
  };
};

const Select = defineComponent({
  name: 'Select',
  props: selectProps,
  setup,
  render() {
    return (
      <>
        <div
          ref="targetRef"
          class={['lee-select-container', this.disabled ? 'lee-select-disabled' : null]}
          tabindex="0"
          onClick={() => this.handleOptionsVisible()}
        >
          {this.showText ? <div class="lee-select-input">{this.showText}</div> : null}
          {this.showPlaceholder ? (
            <div class="lee-select-placeholder">{this.placeholder}</div>
          ) : null}
          {arrowIcon}
        </div>
        {this.formatOptions.length ? (
          <Teleport to="body">
            <Transition name="lee-select-fade">
              {this.optionsVisible || this.transitionVisible ? (
                <div style={this.zIndexStyle}>
                  <div
                    ref="floatRef"
                    class="lee-select-options-wrapper"
                    style={this.optionsWrapperStyle}
                  >
                    {this.formatOptions.map((item) => {
                      return (
                        <div
                          class="lee-select-option-item"
                          onClick={() => this.handleOptionClick(item)}
                        >
                          {item.text}
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
