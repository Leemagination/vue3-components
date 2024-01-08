import { computed, defineComponent, h, PropType, ref, watch } from 'vue';

import './switch.scss';
import Loading from '../loading/Loading';
import { MouseFunc } from '../../config/interface';
const switchProps = {
  value: Boolean,
  activeText: {
    type: String,
    default: ''
  },
  closeText: {
    type: String,
    default: ''
  },
  loading: Boolean,
  disabled: Boolean,
  onClick: Function as PropType<MouseFunc>
};
const Switch = defineComponent({
  name: 'Switch',
  props: switchProps,
  emits: ['update:value', 'change'],
  setup(props, context) {
    const switchValueRef = ref(props.value);
    watch(
      () => props.value,
      () => {
        switchValueRef.value = props.value;
      }
    );
    const value = computed(() => {
      return props.value;
    });
    const isDisabled = computed(() => {
      return props.disabled;
    });
    const loading = computed(() => {
      return props.loading;
    });
    const activeText = computed(() => {
      return props.activeText;
    });

    const closeText = computed(() => {
      return props.closeText;
    });

    function handleClick(ev: MouseEvent) {
      const { onClick } = props;
      if (!props.disabled && !props.loading) {
        switchValueRef.value = !switchValueRef.value;
        context.emit('update:value', switchValueRef.value);
        context.emit('change', switchValueRef.value);
        onClick && onClick(ev);
      }
    }
    return { value, handleClick, switchValueRef, isDisabled, activeText, closeText, loading };
  },
  render() {
    return (
      <div
        onClick={this.handleClick}
        class={[
          'lee-switch',
          this.disabled || this.loading ? 'lee-disabled-switch' : null,
          `lee-${this.switchValueRef ? 'active' : 'close'}-switch`
        ]}
      >
        <span class={['lee-switch-text']}>
          {this.switchValueRef ? this.activeText : this.closeText}
        </span>
        <div class={['lee-switch-control']}>
          {this.loading ? (
            <Loading style={{ position: 'absolute', left: '1px', top: '1px' }}></Loading>
          ) : null}
        </div>
      </div>
    );
  }
});

export default Switch;
