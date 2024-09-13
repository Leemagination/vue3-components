import { defineComponent, h, PropType, Fragment, ref } from 'vue';
import '../../assets/iconfont.css';
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
    const contentSlot = this.$slots.content;
    if (this.isClose) {
      return null;
    }
    return (
      <div
        class={['lee-alert-container', `lee-alert-${this.type}`]}
        style={{ border: !this.border ? 'none' : undefined }}
      >
        {this.showIcon ? (
          <span
            class={[
              'iconfont',
              'lee-alert-icon',
              `icon-${iconMap[this.type]}`,
              `lee-alert-${this.type}-icon`
            ]}
          ></span>
        ) : null}
        {contentSlot ? (
          contentSlot()
        ) : (
          <div class={['lee-alert-content']}>
            {this.title ? <div class={['lee-alert-title']}>{this.title}</div> : null}
            {this.message ? <div class={['lee-alert-message']}>{this.message}</div> : null}
          </div>
        )}
        {this.closeIcon ? (
          <span
            class={['iconfont', 'icon-close', 'lee-alert-close']}
            onClick={(ev) => this.handleCloseClick(ev)}
          ></span>
        ) : null}
      </div>
    );
  }
});

export default Alert;
