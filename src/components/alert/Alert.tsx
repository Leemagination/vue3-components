import { defineComponent, h, PropType, Fragment, ref, renderSlot } from 'vue';
import { infoIcon, successIcon, warningIcon, errorIcon, closeIcon } from './icon';
import style from './alert.scss';
import { AlertType } from './interface';

const alertProps = {
  type: {
    type: String as PropType<AlertType>,
    default: 'info'
  },
  border: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  closable: Boolean
};
const iconMap = {
  info: infoIcon,
  warning: warningIcon,
  success: successIcon,
  error: errorIcon
};

const Alert = defineComponent({
  __STYLE__: style,
  name: 'Alert',
  props: alertProps,
  emits: ['close'],
  setup(props, context) {
    const isClose = ref(false);

    function handleCloseClick(ev: MouseEvent) {
      ev.preventDefault();
      isClose.value = true;
      context.emit('close', ev);
    }

    return { handleCloseClick, isClose };
  },
  render() {
    const { $slots } = this;
    const defaultSlot = renderSlot($slots, 'default');
    if (this.isClose) {
      return null;
    }
    return (
      <div
        class={['lee-alert-container', `lee-alert-${this.type}`]}
        style={{ border: !this.border ? 'none' : undefined }}
      >
        {this.showIcon ? (
          <span class={['lee-alert-icon', `lee-alert-${this.type}-icon`]}>
            {iconMap[this.type]}
          </span>
        ) : null}
        <div class={['lee-alert-content']}>
          {this.title ? <div class={['lee-alert-title']}>{this.title}</div> : null}
          {defaultSlot.children?.length ? (
            <div class={['lee-alert-message']}>{defaultSlot}</div>
          ) : null}
        </div>
        {this.closable ? (
          <span class={['lee-alert-close']} onClick={(ev) => this.handleCloseClick(ev)}>
            {closeIcon}
          </span>
        ) : null}
      </div>
    );
  }
});

export default Alert;
