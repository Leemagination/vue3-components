import { computed, defineComponent, h, PropType, ref, renderSlot, Fragment } from 'vue';

import './button.scss';
import { buttonSize, ButtonSize, buttonType, ButtonType } from './interface';
import Loading from '../loading/Loading';
import { getPropsValue } from '../../util';
import { MouseFunc } from '../../config/interface';
const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  disabled: Boolean,
  ghost: Boolean,
  dash: Boolean,
  loading: Boolean,
  size: {
    type: String as PropType<ButtonSize>,
    default: 'middle'
  },
  onClick: Function as PropType<MouseFunc>
};

const Button = defineComponent({
  name: 'Button',
  props: buttonProps,
  setup(props) {
    const buttonRef = ref();
    const btnType = computed(() => {
      return getPropsValue(props.type, buttonType);
    });
    const btnSize = computed(() => {
      return getPropsValue(props.size, buttonSize);
    });
    const isGhostType = computed(() => {
      return props.ghost;
    });
    const disabledStatus = computed(() => {
      return props.disabled;
    });
    const isDash = computed(() => {
      return props.dash;
    });
    const isLoading = computed(() => {
      return props.loading;
    });

    function handleMouseUp() {
      const cssName = `lee-${btnType.value}-shadow`;
      buttonRef.value.classList.remove(cssName);

      setTimeout(() => {
        !disabledStatus.value && buttonRef.value.classList.add(cssName);
      });
    }
    function handleCLick(e: MouseEvent): void {
      const { onClick } = props;
      if (onClick && !props.disabled) {
        onClick(e);
      }
    }
    return {
      buttonRef,
      handleMouseUp,
      btnType,
      handleCLick,
      isGhostType,
      disabledStatus,
      isDash,
      isLoading,
      btnSize
    };
  },
  render() {
    const { $slots } = this;
    const slot = renderSlot($slots, 'default');
    let btnClass = `lee-${this.btnType}-button`;
    if (this.isGhostType) {
      btnClass = `lee-${this.btnType}${this.isGhostType ? '-ghost' : ''}-button`;
    }
    if (this.isDash) {
      btnClass = `lee-${this.btnType}${this.isDash ? '-dash' : ''}-button`;
    }
    if (this.disabledStatus) {
      btnClass = `lee-disabled${this.isDash ? '-dash' : ''}-button`;
    }

    return (
      <button
        ref="buttonRef"
        onMouseup={this.handleMouseUp}
        onClick={(ev) => this.handleCLick(ev)}
        class={[
          'lee-button',
          btnClass,
          `${this.btnSize !== 'middle' ? `lee-${this.btnSize}-button` : ''}`,
          `${this.isLoading ? 'lee-loading-button' : ''}`
        ]}
      >
        <span class={['lee-button-content']}>
          {this.isLoading ? <Loading></Loading> : null}
          <span>{slot}</span>
        </span>
      </button>
    );
  }
});
export default Button;
