import { defineComponent, h, Teleport } from 'vue';
import './message.scss';
import MessageItem from './MessageItem';
import { deleteMessageItem, messageItemRef, messageList, messagePlacement } from './useMessage';

const ContainerSetup = () => {
  function handleItemClose(key: number) {
    deleteMessageItem(key);
  }

  return {
    messagePlacement,
    messageList,
    messageItemRef,
    handleItemClose
  };
};

const MessageContainer = defineComponent({
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
                    if (el) {
                      this.messageItemRef[message.key] = el;
                    }
                  }) as () => void
                }
                key={message.key}
                info={message}
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
