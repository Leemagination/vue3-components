import { App, computed, createApp, h, reactive, ref, watch } from 'vue';
import {
  ItemRefStatus,
  NotificationConfig,
  NotificationGlobalConfig,
  NotificationItemType
} from './interface';
import NotificationItem from './NotificationItem';
import NotificationContainer from './Notification';

let keyCounter = 1;
const notificationConfig: NotificationGlobalConfig = reactive({
  duration: 0,
  maxItem: 5,
  placement: 'top-right'
});
export function setNotificationConfig(config: Partial<NotificationGlobalConfig>) {
  if (typeof config.duration === 'number') {
    notificationConfig.duration = config.duration;
  }
  if (typeof config.maxItem === 'number') {
    notificationConfig.maxItem = config.maxItem;
  }
  if (config.placement) {
    notificationConfig.placement = config.placement;
  }
}

export const notificationPlacement = computed(() => {
  return notificationConfig.placement;
});

export const notificationList = ref<NotificationItemType[]>([]);
export let containerVNode: App<Element> | null = null;
export let containerDom: HTMLElement | null = null;
export const notificationItemRef = ref<
  Record<string, { ref: InstanceType<typeof NotificationItem>; status: string }>
>({});

function removeNotificationByKey(key: string) {
  const notificationRef = notificationItemRef.value[key];
  if (notificationRef) {
    notificationRef.ref.hideItem();
  }
}

export function clearAllNotification() {
  Object.keys(notificationItemRef.value).forEach((key) => {
    removeNotificationByKey(key);
  });
}

watch(notificationList, (val, oldValue) => {
  if (oldValue.length === 0 && val.length) {
    insertContainer();
  }
  if (oldValue.length && val.length === 0) {
    removeContainer();
  }
});

export function deleteNotificationItem(key: number) {
  notificationList.value = notificationList.value.filter((item) => item.key !== key);
}

export function hideNotificationItem(key: number) {
  notificationItemRef.value[key].status = ItemRefStatus.Hiding;
}

function insertContainer() {
  containerVNode = createApp({
    render() {
      return h(NotificationContainer);
    }
  });
  containerDom = document.createElement('div');
  document.body.appendChild(containerDom);
  containerVNode.mount(containerDom);
}

function removeContainer() {
  if (containerVNode) {
    containerVNode.unmount();
  }
  if (containerDom) {
    containerDom.remove();
  }
}

export default function useNotification(config: Partial<NotificationConfig> | undefined) {
  let duration = notificationConfig.duration;
  if (typeof config?.duration === 'number') {
    duration = config.duration;
  }
  notificationList.value = [
    ...notificationList.value,
    {
      content: config?.content || '',
      title: config?.title || '',
      description: config?.description || '',
      meta: config?.meta || '',
      duration,
      closable: config?.closable !== false,
      key: keyCounter
    }
  ];
  if (
    notificationList.value.length &&
    notificationConfig.maxItem &&
    notificationList.value.length > notificationConfig.maxItem
  ) {
    const len = notificationList.value.length;
    for (let i = 0; i < len; i++) {
      const notificationItem = notificationList.value[i];

      if (notificationItemRef.value[notificationItem.key].status === ItemRefStatus.Show) {
        notificationItemRef.value[notificationItem.key].ref.hideItem();
        break;
      }
    }
  }
  const key = String(keyCounter);
  function close() {
    removeNotificationByKey(key);
  }
  keyCounter++;
  return {
    close
  };
}
