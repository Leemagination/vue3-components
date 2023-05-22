import { defineComponent, h, PropType, Fragment, ref } from 'vue';
import '/src/assets/iconfont.css';
import './alert.scss';
import { AlertType } from './interface';
import { cssPrefix } from '../../config/globalConfig';
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
  message: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  closeIcon: Boolean
};
const iconMap = {
  info: 'warning-circle-fill',
  warning: 'warning-circle-fill',
  success: 'check-circle-fill',
  error: 'close-circle-fill'
};
const Alert = defineComponent({
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
    const contentSlot = this.$slots.content;
    if (this.isClose) {
      return null;
    }
    return (
      <div
        class={[`${cssPrefix}-alert-container`, `${cssPrefix}-alert-${this.type}`]}
        style={{ border: !this.border ? 'none' : undefined }}
      >
        {this.showIcon ? (
          <span
            class={[
              'iconfont',
              `${cssPrefix}-alert-icon`,
              `icon-${iconMap[this.type]}`,
              `${cssPrefix}-alert-${this.type}-icon`
            ]}
          ></span>
        ) : null}
        {contentSlot ? (
          contentSlot()
        ) : (
          <div class={[`${cssPrefix}-alert-content`]}>
            {this.title ? <div class={[`${cssPrefix}-alert-title`]}>{this.title}</div> : null}
            {this.message ? <div class={[`${cssPrefix}-alert-message`]}>{this.message}</div> : null}
          </div>
        )}
        {this.closeIcon ? (
          <span
            class={['iconfont', 'icon-close', `${cssPrefix}-alert-close`]}
            onClick={(ev) => this.handleCloseClick(ev)}
          ></span>
        ) : null}
      </div>
    );
  }
});

export default Alert;
