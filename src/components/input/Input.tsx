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
  watch
} from 'vue';
import style from './input.scss';
import { InputEmit } from './interface';

const inputProps = {
  value: {
    type: String,
    default: ''
  },
  disabled: Boolean,
  placeholder: String,
  password: Boolean,
  prefix: String,
  suffix: String,
  bordered: {
    type: Boolean,
    default: true
  },
  addonBefore: String,
  addonAfter: String,
  showCount: Boolean,
  showClear: Boolean,
  limit: {
    type: Number,
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
  const addonType = computed(() => {
    const { slots } = context;
    return props.addonBefore || props.addonAfter || slots.addonBefore || slots.addonAfter;
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
    addonType,
    clearEvent,
    textLength
  };
};

const Input = defineComponent({
  __STYLE__: style,
  name: 'Input',
  props: inputProps,
  setup,
  render() {
    if (this.addonType) {
      return renderAddon(this);
    }
    return renderNormal(this);
  }
});

function renderAddon(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  return (
    <div class={'lee-input-container'}>
      {renderAddonBefore(instance)}
      {renderNormal(instance)}
      {renderAddonAfter(instance)}
    </div>
  );
}

function renderClearIcon(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  if (instance.showClear && instance.textLength) {
    return (
      <span
        onClick={() => {
          instance.clearEvent();
        }}
        class={'lee-input-clear'}
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
      <span class={'lee-input-count'}>
        {`${instance.textLength}${instance.limit ? `/${instance.limit}` : ''}`}
      </span>
    );
  }
  return null;
}

function renderAddonBefore(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  const { $slots } = instance;
  if (!$slots.addonBefore && !instance.addonBefore) {
    return null;
  }
  return (
    <span class={'lee-input-addon lee-addon-before'}>
      {$slots.addonBefore ? $slots.addonBefore() : instance.addonBefore}
    </span>
  );
}

function renderAddonAfter(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  const { $slots } = instance;
  if (!$slots.addonAfter && !instance.addonAfter) {
    return null;
  }
  return (
    <span class={'lee-input-addon lee-addon-after'}>
      {$slots.addonAfter ? $slots.addonAfter() : instance.addonAfter}
    </span>
  );
}

function renderNormal(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  return (
    <div
      class={[
        'lee-input',
        instance.bordered ? '' : 'lee-input-no-border',
        instance.disabled ? 'lee-input-disabled' : '',
        instance.isActive && !instance.disabled ? 'lee-input-active' : ''
      ]}
    >
      {renderPrefix(instance)}
      {renderInput(instance)}
      {renderClearIcon(instance)}
      {renderCount(instance)}
      {renderSuffix(instance)}
    </div>
  );
}

function renderPrefix(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  const { $slots } = instance;
  if ($slots.prefix) {
    return $slots.prefix();
  }
  if (instance.prefix) {
    return <span class={'lee-fix-text lee-input-prefix'}>{instance.prefix}</span>;
  }
  return null;
}

function renderSuffix(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  const { $slots } = instance;
  if ($slots.suffix) {
    return $slots.suffix();
  }
  if (instance.suffix) {
    return <span class={'lee-fix-text lee-input-suffix'}>{instance.suffix}</span>;
  }
  return null;
}

function renderInput(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  return (
    <input
      ref="inputRef"
      maxlength={instance.limit}
      onFocus={(ev) => instance.handleFocus(ev)}
      onBlur={(ev) => instance.handleBlur(ev)}
      onInput={(ev) => instance.inputEvent(ev)}
      type={instance.password ? 'password' : 'text'}
      placeholder={instance.placeholder}
      disabled={instance.disabled}
    />
  );
}

export default Input;
