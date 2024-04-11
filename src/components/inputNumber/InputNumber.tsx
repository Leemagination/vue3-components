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
  showControl: {
    type: Boolean,
    default: true
  },
  step: {
    type: Number,
    default: 1
  },
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
    if (isNaN(number) || /^[.-]|[.]$|\d+\.\d+/.test(value)) {
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

  const InputEvent = new Event('input', { bubbles: true });

  const clearEvent = () => {
    inputRef.value.value = '';
    inputRef.value.dispatchEvent(InputEvent);
  };

  function addNumber() {
    const currentNumber = typeof props.value === 'number' ? props.value : 0;

    if (currentNumber < props.max) {
      emitValue(Math.min(currentNumber + props.step, props.max));
    }
  }

  function minusNumber() {
    const currentNumber = typeof props.value === 'number' ? props.value : 0;

    if (currentNumber > props.min) {
      emitValue(Math.max(currentNumber - props.step, props.min));
    }
  }

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
    minusNumber,
    addNumber,
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
    <div class={'lee-input-number-container'}>
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
        class={'lee-input-number-clear'}
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

function renderAddonBefore(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  const { $slots } = instance;
  if (!$slots.addonBefore && !instance.addonBefore) {
    return null;
  }
  return (
    <span class={'lee-input-number-addon lee-addon-before'}>
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
    <span class={'lee-input-number-addon lee-addon-after'}>
      {$slots.addonAfter ? $slots.addonAfter() : instance.addonAfter}
    </span>
  );
}

function renderStepControl(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  if (instance.showControl) {
    return (
      <>
        <span class="lee-input-number-step-control" onClick={instance.minusNumber}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <line
              x1="400"
              y1="256"
              x2="112"
              y2="256"
              style="fill: none; stroke: currentcolor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
            ></line>
          </svg>
        </span>
        <span class="lee-input-number-step-control" onClick={instance.addNumber}>
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M256 112V400M400 256H112"
              stroke="currentColor"
              stroke-width="32"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>
      </>
    );
  }
  return null;
}

function renderNormal(
  instance: ComponentPublicInstance<ExtractPropTypes<typeof inputProps>, ReturnType<typeof setup>>
) {
  return (
    <div
      class={[
        'lee-input-number',
        instance.bordered ? '' : 'lee-input-number-no-border',
        instance.disabled ? 'lee-input-number-disabled' : '',
        instance.isActive && !instance.disabled ? 'lee-input-number-active' : ''
      ]}
    >
      {renderPrefix(instance)}
      {renderInput(instance)}
      {renderClearIcon(instance)}
      {renderSuffix(instance)}
      {renderStepControl(instance)}
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
    return <span class={'lee-fix-text lee-input-number-prefix'}>{instance.prefix}</span>;
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
    return <span class={'lee-fix-text lee-input-number-suffix'}>{instance.suffix}</span>;
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
