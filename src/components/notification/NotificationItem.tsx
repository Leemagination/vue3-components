import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  onBeforeUnmount,
  PropType,
  ref,
  SetupContext,
  Transition
} from 'vue';
import { NotificationItemEmits, NotificationItemEmitType, NotificationItemType } from './interface';
import { isComponent } from '../../util';

const closeIcon = (
  <svg viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g fill="currentColor" fill-rule="nonzero">
        <path d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
      </g>
    </g>
  </svg>
);

const notificationItemProps = {
  info: {
    default: () => {},
    type: Object as PropType<NotificationItemType>
  },
  placement: {
    default: 'top-right',
    type: String
  }
};

const ItemSetup = (
  props: ExtractPropTypes<typeof notificationItemProps>,
  context: SetupContext<Array<NotificationItemEmitType>>
) => {
  const itemShow = ref(true);
  const removeTimer = ref<number | null>(null);

  const transformOrigin = computed(() => {
    const target = {
      top: 'top center',
      'top-right': 'top right',
      'top-left': 'top left',
      bottom: 'bottom center',
      'bottom-right': 'bottom right',
      'bottom-left': 'bottom left'
    }[props.placement];
    return target || 'top right';
  });
  function setExpandedHeight(el: Element) {
    (el as HTMLElement).style.maxHeight = `${el.scrollHeight}px`;
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.transform = 'scale(1)';
    (el as HTMLElement).style.transformOrigin = transformOrigin.value;
  }

  function setShrinkHeight(el: Element) {
    (el as HTMLElement).style.maxHeight = '0';
    (el as HTMLElement).style.opacity = '0';
    (el as HTMLElement).style.transform = 'scale(0)';
    (el as HTMLElement).style.transformOrigin = transformOrigin.value;
  }

  function removeTransitionStyle(el: Element) {
    (el as HTMLElement).style.maxHeight = '';
    (el as HTMLElement).style.opacity = '';
    (el as HTMLElement).style.transform = '';
  }

  function hideItem() {
    context.emit('hide');
    itemShow.value = false;
  }

  function emitClose() {
    context.emit('close');
  }

  function removeNotificationItem(el: Element) {
    removeTransitionStyle(el);
    emitClose();
  }

  if (props.info?.duration) {
    removeTimer.value = setTimeout(() => {
      hideItem();
    }, props.info.duration);
  }

  onBeforeUnmount(() => {
    if (removeTimer.value) {
      clearTimeout(removeTimer.value);
    }
  });

  const titleRender = computed(() => {
    if (isComponent(props.info.title)) {
      return h(props.info.title);
    }
    return props.info?.title;
  });

  const descRender = computed(() => {
    if (isComponent(props.info?.description)) {
      return h(props.info.description);
    }
    return props.info?.description;
  });

  const contentRender = computed(() => {
    if (isComponent(props.info?.content)) {
      return h(props.info.content);
    }
    return props.info?.content;
  });

  const metaRender = computed(() => {
    if (isComponent(props.info?.meta)) {
      return h(props.info.meta);
    }
    return props.info?.meta;
  });

  return {
    titleRender,
    descRender,
    contentRender,
    metaRender,
    hideItem,
    itemShow,
    removeNotificationItem,
    setExpandedHeight,
    setShrinkHeight,
    removeTransitionStyle
  };
};

const NotificationItem = defineComponent({
  props: notificationItemProps,
  emits: NotificationItemEmits,
  setup: ItemSetup,
  render() {
    return (
      <Transition
        appear
        name="lee-notification-transition"
        onBeforeEnter={this.setShrinkHeight}
        onEnter={this.setExpandedHeight}
        onBeforeLeave={this.setExpandedHeight}
        onLeave={this.setShrinkHeight}
        onAfterEnter={this.removeTransitionStyle}
        onAfterLeave={this.removeNotificationItem}
      >
        {{
          default: () => [
            this.itemShow ? (
              <div class="lee-notification-item">
                <div class="lee-notification-item-title">
                  <div>{this.titleRender}</div>
                  {this.info.closable ? (
                    <div class="lee-notification-item-close-icon" onClick={this.hideItem}>
                      {closeIcon}
                    </div>
                  ) : null}
                </div>
                {this.descRender ? (
                  <div class="lee-notification-item-description">{this.descRender}</div>
                ) : null}
                {this.contentRender ? (
                  <div class="lee-notification-item-content">{this.contentRender}</div>
                ) : null}
                {this.metaRender ? (
                  <div class="lee-notification-item-meta">{this.metaRender}</div>
                ) : null}
              </div>
            ) : null
          ]
        }}
      </Transition>
    );
  }
});

export default NotificationItem;
