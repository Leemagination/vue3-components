import {
  defineComponent,
  h,
  Fragment,
  ref,
  onMounted,
  ComponentPublicInstance,
  ExtractPropTypes,
  SetupContext,
  computed,
  PropType,
  CSSProperties,
  watch
} from 'vue';
import style from './textarea.scss';

import { AutoSize, InputEmit } from './interface';
const inputProps = {
  value: {
    type: String,
    default: ''
  },
  disabled: Boolean,
  placeholder: String,
  bordered: {
    type: Boolean,
    default: true
  },
  showCount: Boolean,
  showClear: Boolean,
  limit: {
    type: Number,
    default: undefined
  },
  autoSize: {
    type: Object as PropType<AutoSize>,
    default: undefined
  }
};

const setup = (
  props: ExtractPropTypes<typeof inputProps>,
  context: SetupContext<Array<InputEmit>>
) => {
  const isActive = ref(false);
  const inputRef = ref();
  const textLength = ref(0);
  function setPropValue() {
    inputRef.value.value = props.value;
    textLength.value = props.value.length;
  }

  onMounted(() => {
    setPropValue();
  });
  watch(
    () => props.value,
    () => {
      setPropValue();
    }
  );
  const autoSizeStyle = computed(() => {
    if (!props.autoSize) {
      return undefined;
    }
    const { minRows, maxRows } = props.autoSize;
    return {
      resize: 'none',
      minHeight: `${minRows || 2}em`,
      maxHeight: maxRows ? `${maxRows}em` : null
    } as CSSProperties;
  });
  const handleFocus = (e: FocusEvent) => {
    isActive.value = true;
    context.emit('focus', e);
  };
  const handleBlur = (e: FocusEvent) => {
    isActive.value = false;
    context.emit('blur', e);
  };
  const inputEvent = (e: Event) => {
    context.emit('input', e);
    context.emit('update:value', inputRef.value.value);
    context.emit('change', inputRef.value.value);

    if (props.autoSize) {
      if (inputRef.value.value.length < textLength.value) {
        inputRef.value.style.overflow = 'hidden';
        inputRef.value.style.height = autoSizeStyle.value?.minHeight;
      }
      if (inputRef.value.scrollHeight > inputRef.value.clientHeight) {
        inputRef.value.style.height = `${inputRef.value.scrollHeight}px`;
      }
      inputRef.value.style.overflow = 'auto';
    }
    textLength.value = inputRef.value.value.length;
  };

  const clearEvent = () => {
    const ev = new Event('input', { bubbles: true });
    inputRef.value.value = '';
    inputRef.value.dispatchEvent(ev);
  };
  return {
    isActive,
    handleFocus,
    handleBlur,
    inputEvent,
    inputRef,
    clearEvent,
    autoSizeStyle,
    textLength
  };
};

const Textarea = defineComponent({
  __STYLE__: style,
  name: 'Textarea',
  props: inputProps,
  setup,
  render() {
    return (
      <div class={'lee-textarea'}>
        {renderTextarea(this)}
        {renderClearIcon(this)}
        {renderCount(this)}
      </div>
    );
  }
});

function renderClearIcon(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  if (instance.showClear && instance.textLength) {
    return (
      <span
        onClick={() => {
          instance.clearEvent();
        }}
        class={'lee-textarea-clear'}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 12 12"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g fill="currentColor" fill-rule="nonzero">
              <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
            </g>
          </g>
        </svg>
      </span>
    );
  }
  return null;
}

function renderCount(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  if (instance.showCount) {
    return (
      <span class={'lee-textarea-count'}>
        {`${instance.textLength}${instance.limit ? `/${instance.limit}` : ''}`}
      </span>
    );
  }
  return null;
}

function renderTextarea(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  return (
    <textarea
      class={[
        instance.bordered ? '' : 'lee-textarea-no-border',
        instance.disabled ? 'lee-textarea-disabled' : '',
        instance.isActive && !instance.disabled ? 'lee-textarea-active' : '',
        instance.showCount ? 'lee-textarea-count-margin' : '',
        instance.showClear ? 'lee-textarea-clear-padding' : ''
      ]}
      style={instance.autoSizeStyle}
      ref="inputRef"
      maxlength={instance.limit}
      onFocus={(ev) => instance.handleFocus(ev)}
      onBlur={(ev) => instance.handleBlur(ev)}
      onInput={(ev) => instance.inputEvent(ev)}
      placeholder={instance.placeholder}
      disabled={instance.disabled}
    />
  );
}

export default Textarea;
