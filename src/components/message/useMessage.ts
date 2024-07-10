import { App, computed, createApp, h, reactive, ref, watch } from 'vue';
import { ItemRefStatus, MessageConfig, MessageGlobalConfig, MessageItemType } from './interface';
import MessageItem from './MessageItem';
import MessageContainer from './Message';

let keyCounter = 1;
const messageConfig: MessageGlobalConfig = reactive({
  duration: 3000,
  maxItem: 5,
  placement: 'top'
});
export function setMessageConfig(config: Partial<MessageGlobalConfig>) {
  if (typeof config.duration === 'number') {
    messageConfig.duration = config.duration;
  }
  if (typeof config.maxItem === 'number') {
    messageConfig.maxItem = config.maxItem;
  }
  if (config.placement) {
    messageConfig.placement = config.placement;
  }
}

export const messagePlacement = computed(() => {
  return messageConfig.placement;
});

export const messageList = ref<MessageItemType[]>([]);
export let containerVNode: App<Element> | null = null;
export let containerDom: HTMLElement | null = null;
export const messageItemRef = ref<
  Record<string, { ref: InstanceType<typeof MessageItem>; status: ItemRefStatus }>
>({});

function removeMessageByKey(key: string) {
  const messageRef = messageItemRef.value[key];
  if (messageRef) {
    messageRef.ref.hideItem();
  }
}

export function clearAllMessage() {
  Object.keys(messageItemRef.value).forEach((key) => {
    removeMessageByKey(key);
  });
}

watch(messageList, (val, oldValue) => {
  if (oldValue.length === 0 && val.length) {
    insertContainer();
  }
  if (oldValue.length && val.length === 0) {
    removeContainer();
  }
});

export function deleteMessageItem(key: number) {
  messageList.value = messageList.value.filter((item) => item.key !== key);
}

export function hideMessageItem(key: number) {
  messageItemRef.value[key].status = ItemRefStatus.Hiding;
}

function insertContainer() {
  containerVNode = createApp({
    render() {
      return h(MessageContainer);
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

export default function useMessage(config: Partial<MessageConfig> | undefined) {
  let duration = messageConfig.duration;
  if (typeof config?.duration === 'number') {
    duration = config.duration;
  }
  messageList.value = [
    ...messageList.value,
    {
      content: config?.content || '',
      duration,
      type: config?.type || null,
      closable: !!config?.closable,
      key: keyCounter
    }
  ];
  if (
    messageList.value.length &&
    messageConfig.maxItem &&
    messageList.value.length > messageConfig.maxItem
  ) {
    const len = messageList.value.length;
    for (let i = 0; i < len; i++) {
      const messageItem = messageList.value[i];
      if (messageItemRef.value[messageItem.key].status === ItemRefStatus.Show) {
        messageItemRef.value[messageItem.key].ref.hideItem();
        break;
      }
    }
  }
  const key = String(keyCounter);
  function close() {
    removeMessageByKey(key);
  }
  keyCounter++;
  return {
    close
  };
}
