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
import './input.scss';
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
