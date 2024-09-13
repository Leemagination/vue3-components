import {
  computed,
  Fragment,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  Teleport,
  useModel,
  watch,
  Transition,
  StyleValue
} from 'vue';
import style from './pagination.scss';
import { createZIndex } from '../../util/zIndex';
import { autoUpdate, flip, useFloating } from '@floating-ui/vue';
const leftArrow = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.2674 15.793C11.9675 16.0787 11.4927 16.0672 11.2071 15.7673L6.20572 10.5168C5.9298 10.2271 5.9298 9.7719 6.20572 9.48223L11.2071 4.23177C11.4927 3.93184 11.9675 3.92031 12.2674 4.206C12.5673 4.49169 12.5789 4.96642 12.2932 5.26634L7.78458 9.99952L12.2932 14.7327C12.5789 15.0326 12.5673 15.5074 12.2674 15.793Z"
      fill="currentColor"
    ></path>
  </svg>
);

const rightArrow = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.73271 4.20694C8.03263 3.92125 8.50737 3.93279 8.79306 4.23271L13.7944 9.48318C14.0703 9.77285 14.0703 10.2281 13.7944 10.5178L8.79306 15.7682C8.50737 16.0681 8.03263 16.0797 7.73271 15.794C7.43279 15.5083 7.42125 15.0336 7.70694 14.7336L12.2155 10.0005L7.70694 5.26729C7.42125 4.96737 7.43279 4.49264 7.73271 4.20694Z"
      fill="currentColor"
    ></path>
  </svg>
);

const downArrowIcon = (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.14645 5.64645C3.34171 5.45118 3.65829 5.45118 3.85355 5.64645L8 9.79289L12.1464 5.64645C12.3417 5.45118 12.6583 5.45118 12.8536 5.64645C13.0488 5.84171 13.0488 6.15829 12.8536 6.35355L8.35355 10.8536C8.15829 11.0488 7.84171 11.0488 7.64645 10.8536L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645Z"
      fill="currentColor"
    ></path>
  </svg>
);

const paginationProps = {
  disabled: Boolean,
  pageCount: {
    type: Number,
    default: 1
  },
  displayCount: {
    type: Number,
    default: 9
  },
  showQuickJumper: Boolean,
  jumpText: {
    type: String,
    default: '跳至'
  },
  showSizePicker: Boolean,
  pageSizeOptions: {
    type: Array as PropType<number[]>,
    default: () => [10]
  },
  pageSize: {
    type: Number,
    default: 10
  },
  page: {
    type: Number,
    default: 1
  }
};

const setup = (props: ExtractPropTypes<typeof paginationProps>) => {
  const activePage = useModel(props, 'page');
  const activeSize = useModel(props, 'pageSize');
  const validPageCount = computed(() => {
    return Math.max(props.pageCount, 1);
  });
  const validDisplayCount = computed(() => {
    return Math.max(props.displayCount, 5);
  });
  const pageList = computed(() => {
    if (validPageCount.value <= validDisplayCount.value) {
      return Array.from({ length: validPageCount.value }).map((_, index) => {
        const value = index + 1;
        return {
          value,
          active: activePage.value === value,
          ellipsis: false
        };
      });
    }

    const remainCount = validDisplayCount.value - 2;
    let startIndex = activePage.value - Math.floor(remainCount / 2);
    let offset = startIndex < 2 ? 2 - startIndex : 0;
    startIndex = startIndex + offset;
    let endIndex = startIndex + remainCount;
    if (endIndex > validPageCount.value) {
      offset = validPageCount.value - endIndex;
      endIndex = validPageCount.value;
      startIndex += offset;
    }

    const list = [];
    list.push(1);
    for (let i = startIndex; i < endIndex; i++) {
      list.push(i);
    }
    list.push(validPageCount.value);
    return list.map((value, index) => {
      let ellipsis = false;
      if (index === 1 && value !== 2) {
        ellipsis = true;
      }
      if (index === list.length - 2 && value !== validPageCount.value - 1) {
        ellipsis = true;
      }
      return {
        value,
        active: activePage.value === value,
        ellipsis
      };
    });
  });

  function handlePageClick(value: number) {
    if (props.disabled) {
      return;
    }
    activePage.value = value;
  }

  function handleButtonClick(type: 'pre' | 'next') {
    if (props.disabled) {
      return;
    }
    if (type === 'pre' && activePage.value > 1) {
      activePage.value = activePage.value - 1;
    }
    if (type === 'next' && activePage.value < validPageCount.value) {
      activePage.value = activePage.value + 1;
    }
  }

  const leftButtonDisabled = computed(() => {
    if (activePage.value === 1 || props.disabled) {
      return true;
    }
    return false;
  });
  const rightButtonDisabled = computed(() => {
    if (activePage.value === validPageCount.value || props.disabled) {
      return true;
    }
    return false;
  });

  const jumpInputRef = ref<HTMLInputElement | null>(null);

  watch(activePage, (val) => {
    if (jumpInputRef.value) {
      jumpInputRef.value.value = String(val);
    }
  });

  function handleInputValue(input: HTMLInputElement) {
    let value = Math.floor(Number(input.value));

    if (value < 1) {
      value = 1;
    }
    if (value > validPageCount.value) {
      value = validPageCount.value;
    }
    activePage.value = value;
    input.value = String(value);
  }
  function handleInputBlur(e: FocusEvent) {
    handleInputValue(e.target as HTMLInputElement);
  }

  function handleInputKeyup(e: KeyboardEvent) {
    if (e.key !== 'Enter') {
      return;
    }
    handleInputValue(e.target as HTMLInputElement);
  }

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
  const pageSizeOptions = computed(() => {
    if (Array.isArray(props.pageSizeOptions)) {
      return props.pageSizeOptions.map((item) => {
        let selected = false;
        selected = activeSize.value === item;
        return {
          value: item,
          selected
        };
      });
    }
    return [];
  });
  function handleOptionClick(item: { [p: string]: any }) {
    activeSize.value = item.value;
    handleOptionsVisible(false);
  }

  return {
    floatingStyles,
    zIndexStyle,
    optionsVisible,
    transitionVisible,
    targetRef,
    floatRef,
    activeSize,
    jumpInputRef,
    leftButtonDisabled,
    rightButtonDisabled,
    pageList,
    pageSizeOptions,
    handleOptionClick,
    handleInputBlur,
    handleInputKeyup,
    handlePageClick,
    handleButtonClick,
    handleOptionsVisible
  };
};

const Pagination = defineComponent({
  __STYLE__: style,
  name: 'Pagination',
  props: paginationProps,
  setup,
  render() {
    return (
      <div class="lee-pagination-container">
        <div
          class={[
            'lee-pagination-button',
            this.leftButtonDisabled ? 'lee-pagination-button--disabled' : null
          ]}
          onClick={() => this.handleButtonClick('pre')}
        >
          {leftArrow}
        </div>
        {this.pageList.map((item) => {
          return (
            <div
              onClick={() => this.handlePageClick(item.value)}
              class={[
                'lee-pagination-item',
                item.active ? 'lee-pagination-item--activated' : null,
                this.disabled ? 'lee-pagination-item--disabled' : null
              ]}
            >
              {item.ellipsis ? '...' : item.value}
            </div>
          );
        })}
        <div
          class={[
            'lee-pagination-button',
            this.rightButtonDisabled ? 'lee-pagination-button--disabled' : null
          ]}
          onClick={() => this.handleButtonClick('next')}
        >
          {rightArrow}
        </div>
        {this.showSizePicker ? (
          <>
            <div
              onClick={() => this.handleOptionsVisible()}
              ref="targetRef"
              class={[
                'lee-pagination-size-select',
                this.disabled ? 'lee-pagination-size-select--disabled' : null
              ]}
            >
              <span>{this.activeSize}&nbsp;/&nbsp;页</span>
              {downArrowIcon}
            </div>
            <>
              <Teleport to="body">
                <Transition name="lee-pagination-select-fade">
                  {this.optionsVisible || this.transitionVisible ? (
                    <div style={this.zIndexStyle}>
                      <div
                        ref="floatRef"
                        class="lee-pagination-select-options-wrapper"
                        style={this.floatingStyles}
                      >
                        {this.pageSizeOptions.map((item) => {
                          return (
                            <div
                              class={[
                                'lee-pagination-select-option-item',
                                item.selected ? 'lee-pagination-select-option-item__selected' : null
                              ]}
                              onClick={() => this.handleOptionClick(item)}
                            >
                              <span>{item.value}&nbsp;/&nbsp;页</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </Transition>
              </Teleport>
            </>
          </>
        ) : null}
        {this.showQuickJumper ? (
          <div
            class={[
              'lee-pagination-jumper',
              this.disabled ? 'lee-pagination-jumper--disabled' : null
            ]}
          >
            <span>{this.jumpText}</span>
            <input
              ref="jumpInputRef"
              onBlur={this.handleInputBlur}
              onKeyup={this.handleInputKeyup}
              type="number"
              class={[
                'lee-pagination-jumper-input',
                this.disabled ? 'lee-pagination-jumper-input--disabled' : null
              ]}
            />
          </div>
        ) : null}
      </div>
    );
  }
});

export default Pagination;
