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
import './textarea.scss';

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
        +
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
