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
import './inputNumber.scss';
import { InputNumberEmit } from './interface';

const inputProps = {
  value: {
    type: [Number, String],
    default: ''
  },
  disabled: Boolean,
  placeholder: String,
  prefix: String,
  suffix: String,
  bordered: {
    type: Boolean,
    default: true
  },
  addonBefore: String,
  addonAfter: String,
  showClear: Boolean,
  max: {
    type: Number,
    default: Infinity
  },
  min: {
    type: Number,
    default: -Infinity
  }
};

const setup = (
  props: ExtractPropTypes<typeof inputProps>,
  context: SetupContext<Array<InputNumberEmit>>
) => {
  const isActive = ref(false);
  const inputRef = ref();

  function setPropValue() {
    let target: string | number = props.value;
    if (typeof props.value === 'number') {
      target = Math.min(props.value, props.max);
      target = Math.max(target, props.min);
    }

    inputRef.value.value = target;
    emitValue(target);
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
    const number = Number(inputRef.value.value);
    if (!isNaN(number)) {
      emitValue(number);
    } else {
      setPropValue();
    }
    context.emit('blur', e);
  };

  function emitValue(value: string | number) {
    inputRef.value.value = value;
    context.emit('update:value', value);
    context.emit('change', value);
  }
  function emitValidValue(value: string) {
    const number = Number(value);
    if (isNaN(number) || /^[.-]|[.]$/.test(value)) {
      return;
    }
    let target: string | number = number;
    if (value === '') {
      target = '';
    }
    emitValue(target);
  }
  const inputEvent = (e: Event) => {
    context.emit('input', e);
    emitValidValue(inputRef.value.value);
  };

  const clearEvent = () => {
    const ev = new Event('input', { bubbles: true });
    inputRef.value.value = '';
    inputRef.value.dispatchEvent(ev);
  };

  const showClearIcon = computed(() => {
    return props.showClear && typeof props.value === 'number';
  });

  return {
    isActive,
    handleFocus,
    handleBlur,
    inputEvent,
    inputRef,
    addonType,
    clearEvent,
    showClearIcon
  };
};

const InputNumber = defineComponent({
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
  if (instance.showClearIcon) {
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
      onFocus={(ev) => instance.handleFocus(ev)}
      onBlur={(ev) => instance.handleBlur(ev)}
      onInput={(ev) => instance.inputEvent(ev)}
      type="text"
      placeholder={instance.placeholder}
      disabled={instance.disabled}
    />
  );
}

export default InputNumber;
