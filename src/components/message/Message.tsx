import { defineComponent, h, Teleport } from 'vue';
import style from './message.scss';
import MessageItem from './MessageItem';
import {
  deleteMessageItem,
  hideMessageItem,
  messageItemRef,
  messageList,
  messagePlacement
} from './useMessage';
import { ItemRefStatus } from './interface';

const ContainerSetup = () => {
  function handleItemClose(key: number) {
    deleteMessageItem(key);
  }

  function handleItemHide(key: number) {
    hideMessageItem(key);
  }

  return {
    messagePlacement,
    messageList,
    messageItemRef,
    handleItemClose,
    handleItemHide
  };
};

const MessageContainer = defineComponent({
  __STYLE__: style,
  setup: ContainerSetup,
  render() {
    return (
      <Teleport to="body">
        <div
          class={[
            'lee-message-container',
            this.messagePlacement ? `lee-message-container__${this.messagePlacement}` : null
          ]}
        >
          {this.messageList.map((message) => {
            return (
              <MessageItem
                ref={
                  ((el: InstanceType<typeof MessageItem>) => {
                    if (el && !this.messageItemRef[message.key]) {
                      this.messageItemRef[message.key] = { ref: el, status: ItemRefStatus.Show };
                    }
                  }) as () => void
                }
                key={message.key}
                info={message}
                onHide={() => this.handleItemHide(message.key)}
                onClose={() => {
                  this.handleItemClose(message.key);
                }}
              ></MessageItem>
            );
          })}
        </div>
      </Teleport>
    );
  }
});

export default MessageContainer;
